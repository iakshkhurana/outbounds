# Host sniffer → Docker/local API on 127.0.0.1:4000 (avoids Windows localhost dual-stack split).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$sniffer = Join-Path $root "services\sniffer"
Set-Location $sniffer

if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  Write-Host "Created .env from .env.example"
}

$py = Join-Path $sniffer ".venv\Scripts\python.exe"
if (Test-Path $py) {
  & $py main.py
} else {
  Write-Host "No .venv found. Creating one..."
  python -m venv .venv
  & (Join-Path $sniffer ".venv\Scripts\python.exe") -m pip install -r requirements.txt
  & (Join-Path $sniffer ".venv\Scripts\python.exe") main.py
}
