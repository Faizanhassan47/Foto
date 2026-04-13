param(
  [string]$EnvFile = ".\\deployment\\github.secrets.env"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $EnvFile)) {
  Write-Error "Secrets file not found: $EnvFile"
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "GitHub CLI (gh) is not installed or not on PATH."
}

$lines = Get-Content $EnvFile | Where-Object {
  $_.Trim() -and -not $_.Trim().StartsWith("#")
}

foreach ($line in $lines) {
  $parts = $line -split "=", 2

  if ($parts.Count -ne 2) {
    continue
  }

  $key = $parts[0].Trim()
  $value = $parts[1]

  if (-not $key) {
    continue
  }

  $value | gh secret set $key
  Write-Host "Set GitHub secret $key"
}
