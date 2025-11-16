$ErrorActionPreference = "Stop"

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Join-Path $scriptPath "..\.."
Set-Location $projectRoot

Write-Host "Building GrowPath Client Docker image..." -ForegroundColor Green

$API_URL = if ($env:REACT_APP_API_URL) { $env:REACT_APP_API_URL } else { "http://localhost:8080/api" }

docker build `
  --build-arg REACT_APP_API_URL=$API_URL `
  -f deployment/Dockerfile `
  -t growpath-client:latest `
  .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "Image: growpath-client:latest" -ForegroundColor Cyan
