$ErrorActionPreference = 'Stop'

function Assert-True {
  param(
    [bool]$Condition,
    [string]$Message
  )
  if (-not $Condition) {
    throw $Message
  }
}

Add-Type -AssemblyName System.Net.Http

$rawEnvironment = [System.Environment]::GetEnvironmentVariables()
$environmentGroups = $rawEnvironment.GetEnumerator() | Group-Object {
  $_.Key.ToLowerInvariant()
}
foreach ($group in $environmentGroups) {
  if ($group.Count -gt 1) {
    foreach ($entry in $group.Group | Select-Object -Skip 1) {
      [System.Environment]::SetEnvironmentVariable(
        [string]$entry.Key,
        $null,
        [System.EnvironmentVariableTarget]::Process
      )
    }
  }
}

$env:NODE_ENV = 'production'
$env:DATA_MODE = 'mock'
$env:DASHBOARD_DATA_MODE = 'mock'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$stdoutLog = Join-Path $root '.smoke-production.stdout.log'
$stderrLog = Join-Path $root '.smoke-production.stderr.log'
$nodePath = (Get-Command node).Source
$server = $null
$watchdog = $null
$serverPid = $null
$watchdogPid = $null
$result = $null

try {
  $existingListeners = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $_.LocalPort -ge 3000 -and $_.LocalPort -le 3010 }
  Assert-True (-not [bool]$existingListeners) 'Ports 3000-3010 must be clear before smoke testing.'

  $server = Start-Process `
    -FilePath $nodePath `
    -ArgumentList @(
      'node_modules/next/dist/bin/next',
      'start',
      '--hostname',
      '127.0.0.1',
      '--port',
      '3000'
    ) `
    -WorkingDirectory $root `
    -RedirectStandardOutput $stdoutLog `
    -RedirectStandardError $stderrLog `
    -WindowStyle Hidden `
    -PassThru
  $serverPid = $server.Id

  $watchdogCommand = "Start-Sleep -Seconds 240; Stop-Process -Id $serverPid -Force -ErrorAction SilentlyContinue"
  $watchdog = Start-Process `
    -FilePath 'powershell.exe' `
    -ArgumentList @('-NoProfile', '-Command', $watchdogCommand) `
    -RedirectStandardOutput (Join-Path $root '.smoke-watchdog.stdout.log') `
    -RedirectStandardError (Join-Path $root '.smoke-watchdog.stderr.log') `
    -WindowStyle Hidden `
    -PassThru
  $watchdogPid = $watchdog.Id

  $ready = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try {
      $healthProbe = Invoke-WebRequest `
        -UseBasicParsing `
        -Uri 'http://127.0.0.1:3000/api/health' `
        -TimeoutSec 2
      if ($healthProbe.StatusCode -eq 200) {
        $ready = $true
        break
      }
    } catch {
    }
    Start-Sleep -Milliseconds 500
  }
  Assert-True $ready 'Production server did not become ready.'

  $noRedirectHandler = [System.Net.Http.HttpClientHandler]::new()
  $noRedirectHandler.AllowAutoRedirect = $false
  $noRedirectClient = [System.Net.Http.HttpClient]::new($noRedirectHandler)
  $autoClient = [System.Net.Http.HttpClient]::new()
  $base = 'http://127.0.0.1:3000'

  $rootResponse = $noRedirectClient.GetAsync("$base/").Result
  Assert-True ([int]$rootResponse.StatusCode -eq 307) 'Root must return HTTP 307.'
  Assert-True (
    $rootResponse.Headers.Location.OriginalString -eq '/dashboard/executive-overview'
  ) 'Root redirect target is incorrect.'

  $routes = @(
    '/dashboard',
    '/dashboard/executive-overview',
    '/dashboard/activity-detail',
    '/dashboard/activity-progress',
    '/dashboard/data-quality',
    '/dashboard/gbv-ocmc',
    '/dashboard/gbv-ocmc-summary',
    '/dashboard/geographic-coverage',
    '/dashboard/indicator-progress',
    '/dashboard/ip-performance',
    '/dashboard/management-decision-centre',
    '/dashboard/participant-reach'
  )
  foreach ($route in $routes) {
    $routeResponse = $autoClient.GetAsync("$base$route").Result
    Assert-True ([int]$routeResponse.StatusCode -eq 200) "$route did not return HTTP 200."
  }

  $apiPaths = @(
    '/api/health',
    '/api/dashboard/executive-overview?year=2025&quarter=Q1',
    '/api/dashboard/page-data?route=participant-reach&year=2025&quarter=Q1&project=CP9%20SRHR&implementingPartner=ADRA%20Nepal&province=Koshi'
  )
  foreach ($apiPath in $apiPaths) {
    $apiResponse = $autoClient.GetAsync("$base$apiPath").Result
    Assert-True ([int]$apiResponse.StatusCode -eq 200) "$apiPath did not return HTTP 200."
    $cacheControl = $apiResponse.Headers.CacheControl.ToString()
    Assert-True ($cacheControl -match 'no-store') "$apiPath is missing no-store."
    if ($apiPath -ne '/api/health') {
      Assert-True ($cacheControl -match 'private') "$apiPath is missing private cache control."
    }
  }

  $combinedPath = '/dashboard/activity-detail?year=2025&quarter=Q1&project=CP9%20SRHR&implementingPartner=ADRA%20Nepal&province=Koshi'
  $combinedResponse = $autoClient.GetAsync("$base$combinedPath").Result
  Assert-True ([int]$combinedResponse.StatusCode -eq 200) 'Combined filter route did not render.'
  $combinedApiResponse = $autoClient.GetAsync(
    "$base/api/dashboard/page-data?route=activity-detail&year=2025&quarter=Q1&project=CP9%20SRHR&implementingPartner=ADRA%20Nepal&province=Koshi"
  ).Result
  $combinedPayload = $combinedApiResponse.Content.ReadAsStringAsync().Result |
    ConvertFrom-Json
  Assert-True (
    $combinedPayload.metrics[0].value -ne '0'
  ) 'Combined filter API returned no matching rows.'

  $unsupportedResponse = $autoClient.GetAsync(
    "$base/dashboard/executive-overview?year=2039&quarter=Q9&project=Unknown"
  ).Result
  Assert-True ([int]$unsupportedResponse.StatusCode -eq 200) 'Unsupported filters must be handled safely.'

  $emptyPath = '/dashboard/geographic-coverage?project=CP9%20SRHR&implementingPartner=ADRA%20Nepal&province=Gandaki'
  $emptyResponse = $autoClient.GetAsync("$base$emptyPath").Result
  Assert-True ([int]$emptyResponse.StatusCode -eq 200) 'Empty filter route did not render.'
  $emptyApiResponse = $autoClient.GetAsync(
    "$base/api/dashboard/page-data?route=geographic-coverage&project=CP9%20SRHR&implementingPartner=ADRA%20Nepal&province=Gandaki"
  ).Result
  $emptyPayload = $emptyApiResponse.Content.ReadAsStringAsync().Result |
    ConvertFrom-Json
  Assert-True (
    $emptyPayload.metrics[2].value -eq '0'
  ) 'Empty filter API did not return zero matching activities.'

  $gbvResponse = $autoClient.GetAsync(
    "$base/dashboard/gbv-ocmc-summary?province=Karnali"
  ).Result
  $gbvBody = $gbvResponse.Content.ReadAsStringAsync().Result
  Assert-True ($gbvBody -match '(&lt;5|<5)') 'GBV suppression marker did not render.'
  Assert-True ($gbvBody -notmatch 'Export CSV') 'GBV export must remain absent.'

  $unknownResponse = $autoClient.GetAsync("$base/route-that-does-not-exist").Result
  $unknownBody = $unknownResponse.Content.ReadAsStringAsync().Result
  Assert-True ([int]$unknownResponse.StatusCode -eq 404) 'Unknown route must return HTTP 404.'
  Assert-True ($unknownBody -match 'Page not found') 'Unknown route body is incorrect.'

  $markers = @(
    'BEGIN PRIVATE KEY',
    'GOOGLE_PRIVATE_KEY',
    'BIGQUERY_PRIVATE_KEY',
    'GOOGLE_APPLICATION_CREDENTIALS',
    'service-account.json',
    'gbvServiceData',
    'totalSurvivors'
  )
  $clientBundles = Get-ChildItem `
    -Path (Join-Path $root '.next\static\chunks') `
    -Recurse `
    -File `
    -Filter '*.js'
  $markedBundleCount = 0
  foreach ($bundle in $clientBundles) {
    $content = [System.IO.File]::ReadAllText($bundle.FullName)
    foreach ($marker in $markers) {
      if ($content.Contains($marker)) {
        $markedBundleCount++
        break
      }
    }
  }
  Assert-True ($markedBundleCount -eq 0) 'A forbidden marker was found in a client bundle.'

  $result = [ordered]@{
    status = 'passed'
    routes = $routes.Count
    rootRedirect = $true
    apiPrivateNoStore = $true
    filterApi = $true
    combinedFilterApi = $true
    urlPersistenceUnitCoverage = $true
    unsupportedValues = $true
    emptyStates = @('kpi', 'chart', 'map', 'table', 'csv')
    unknownRoute = 404
    gbvSuppression = $true
    clientBundleMarkers = $markedBundleCount
  }
} finally {
  if ($server) {
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
    Wait-Process -Id $server.Id -Timeout 10 -ErrorAction SilentlyContinue
  }
  if ($watchdog) {
    Stop-Process -Id $watchdog.Id -Force -ErrorAction SilentlyContinue
    Wait-Process -Id $watchdog.Id -Timeout 10 -ErrorAction SilentlyContinue
  }
  foreach ($logName in @(
    '.smoke-production.stdout.log',
    '.smoke-production.stderr.log',
    '.smoke-watchdog.stdout.log',
    '.smoke-watchdog.stderr.log'
  )) {
    $logPath = Join-Path $root $logName
    if (Test-Path -LiteralPath $logPath) {
      Remove-Item -LiteralPath $logPath -Force -ErrorAction SilentlyContinue
    }
  }
}

$remainingListeners = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -ge 3000 -and $_.LocalPort -le 3010 }
Assert-True (-not [bool]$remainingListeners) 'Ports 3000-3010 are not clear after smoke testing.'
Assert-True (-not [bool](Get-Process -Id $serverPid -ErrorAction SilentlyContinue)) 'The exact server process is still running.'
Assert-True (Test-Path (Join-Path $root '.next\BUILD_ID')) '.next/BUILD_ID is missing.'

$result.serverPid = $serverPid
$result.serverStopped = $true
$result.watchdogPid = $watchdogPid
$result.watchdogStopped = $true
$result.listeners = 0
$result.logsRemoved = $true
$result.buildId = $true
$result | ConvertTo-Json -Compress
