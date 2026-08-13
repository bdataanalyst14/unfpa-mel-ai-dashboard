# UNFPA Nepal MEL Dashboard - Ubuntu UAT Deployment Runbook

> Historical/optional Ubuntu tooling. The current production architecture uses Vercel and does not invoke these commands.

This document describes the steps to build, package, extract, configure, and verify dashboard updates inside the restricted UAT environment.

## 1. Directory Structure

| Location | Description |
|---|---|
| `/opt/unfpa-mel-dashboard` | Application Root |
| `/opt/unfpa-mel-dashboard/current` | Symlink to Active Release Folder |
| `/opt/unfpa-mel-dashboard/releases` | Archive of Deployments |
| `/etc/unfpa-mel-dashboard` | Configuration Root |
| `/var/lib/unfpa-mel-dashboard/evidence` | Redacted Preflight Evidence |
| `/var/backups/unfpa-mel-dashboard` | Runtime Configuration Backups |

## 2. Ports and Proxy Layout
- **Next.js Local Process**: Runs on local address `127.0.0.1:3000`.
- **Nginx Local Proxy**: Listens on `127.0.0.1:8080` (loopback) and `10.53.90.95:8080` (restricted private IP).
- **Public access**: Public access, public domains, and TLS are **strictly prohibited** in this restricted environment. Do not modify the UFW firewall configurations or expose public interfaces.

## 3. Deployment Script Usage
The deployment automation script is located at:
`ops/ubuntu/deploy-uat.sh`

### Package Current Release
Run this command from the repository workspace to package files and create a SHA-256 checksum:
```bash
./ops/ubuntu/deploy-uat.sh --package
```

### Safe Extraction of Package
Extract the release tarball to `/opt/unfpa-mel-dashboard/releases/<timestamp>` and verify its checksum:
```bash
./ops/ubuntu/deploy-uat.sh --extract unfpa-mel-dashboard-release-XYZ.tar.gz
```

### Configuration Backup
Back up current runtime environment settings:
```bash
./ops/ubuntu/deploy-uat.sh --backup-config
```

### Restart Application
Restart systemd configuration and the node service process:
```bash
./ops/ubuntu/deploy-uat.sh --restart
```

### Verify Local Health
Check Next.js response status codes:
```bash
./ops/ubuntu/deploy-uat.sh --verify-health
```

### Nginx restricted-UAT Smoke Test
Check proxy routes and configuration alignment:
```bash
./ops/ubuntu/deploy-uat.sh --nginx-smoke
```

### Rollback Release
Revert the release to the previous folder in `/opt/unfpa-mel-dashboard/releases`:
```bash
./ops/ubuntu/deploy-uat.sh --rollback
```

### Capture Deployment Evidence
Record status dumps to `/var/lib/unfpa-mel-dashboard/evidence`:
```bash
./ops/ubuntu/deploy-uat.sh --capture-evidence
```
