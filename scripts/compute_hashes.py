import subprocess, os, json

# Files to hash
files = [
    r"src\data\geo\nepal-map-base.ts",
    r"src\components\GeographicCoverageMap.tsx",
    r"src\data\mock\geographic-map-metrics.ts",
    r"scripts\generate-nepal-map-base.py",
    r"src\app\dashboard\geographic-coverage\page.tsx",
]

# Compute hashes using PowerShell Get-FileHash
hashes = []
for f in files:
    # Use PowerShell command
    cmd = ["powershell", "-NoProfile", "-Command", f"$h = Get-FileHash -Algorithm SHA256 -Path '{f}'; Write-Output \"{f}`t$($h.Hash)\""]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=os.getcwd())
    line = result.stdout.strip()
    hashes.append(line)

# Write to a temporary file
out_path = os.path.join(os.getcwd(), "protected_hashes_after.txt")
with open(out_path, "w", encoding="utf-8") as f:
    for line in hashes:
        f.write(line + "\n")
print(json.dumps({"hash_file": out_path, "hashes": hashes}))
