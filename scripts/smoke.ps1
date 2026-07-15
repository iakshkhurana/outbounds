#requires -Version 5.1
param(
  [string]$ApiBase = "http://127.0.0.1:4000"
)

$ErrorActionPreference = "Stop"

function Invoke-JsonGet([string]$Url) {
  return Invoke-RestMethod -Method GET -Uri $Url
}

function Invoke-JsonPost([string]$Url, [string]$Body = "{}") {
  return Invoke-RestMethod -Method POST -Uri $Url -ContentType "application/json" -Body $Body
}

Write-Host "1) health"
$health = Invoke-JsonGet "$ApiBase/health"
if (-not $health.ok) { throw "health failed" }
Write-Host "   ok"

Write-Host "2) demo reset"
Invoke-JsonPost "$ApiBase/api/demo/reset" | Out-Null
Write-Host "   ok"

Write-Host "3) demo replay"
$replay = Invoke-JsonPost "$ApiBase/api/demo/replay"
Write-Host "   accepted=$($replay.accepted) hosts=$($replay.hostsTouched)"

Write-Host "4) overview"
$overview = Invoke-JsonGet "$ApiBase/api/overview?windowSec=300"
Write-Host "   activeHosts=$($overview.activeHosts) failedDns=$($overview.failedDns) highLatency=$($overview.highLatency)"

if ($overview.activeHosts -lt 1) { throw "overview expected hosts after replay" }

Write-Host "5) report json"
$report = Invoke-JsonGet "$ApiBase/api/report?format=json&windowSec=300"
Write-Host "   events=$($report.summary.eventsInWindow) flagged=$($report.summary.flaggedHostCount)"

Write-Host ""
Write-Host "Smoke passed."
