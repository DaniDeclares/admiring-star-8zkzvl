# Update-DaniDeclares.ps1 - Local Automation & Backup Script
param (
    [string]$ProjectRoot = "C:\Projects\admiring-star-8zkzvl"
)

Write-Host "==========================================" -ForegroundColor Gold
Write-Host "  DANI DECLARES LLC - File Backup & Sync " -ForegroundColor Burgundy
Write-Host "==========================================" -ForegroundColor Gold

# 1. Create Timestamped Backup Folder
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = Join-Path -Path $ProjectRoot -ChildPath "backups\backup_$Timestamp"

if (-not (Test-Path -Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Host "[SUCCESS] Created backup folder: $BackupDir" -ForegroundColor Green
}

# 2. Backup Target Files
$FilesToBackup = @(
    "src\App.js",
    "src\components\Navbar.jsx",
    "src\components\Navbar.css",
    "src\components\Footer.jsx",
    "src\components\Footer.css"
)

foreach ($File in $FilesToBackup) {
    $SourcePath = Join-Path -Path $ProjectRoot -ChildPath $File
    if (Test-Path -Path $SourcePath) {
        $DestPath = Join-Path -Path $BackupDir -ChildPath $File
        $DestSubDir = Split-Path -Path $DestPath -Parent
        if (-not (Test-Path -Path $DestSubDir)) { New-Item -ItemType Directory -Path $DestSubDir -Force | Out-Null }
        Copy-Item -Path $SourcePath -Destination $DestPath -Force
        Write-Host "[BACKUP] Saved $File to backup." -ForegroundColor Cyan
    }
}

Write-Host "`n[SUCCESS] Local backup completed safely." -ForegroundColor Green
