$ErrorActionPreference = "Stop"

Write-Host "Deploying GrowPath Client with Docker Compose..." -ForegroundColor Green

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Join-Path $scriptPath "..\.."
Set-Location $projectRoot

docker-compose -f deployment/docker-compose.yml up -d --build

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "Application is running on http://localhost:3000" -ForegroundColor Cyan

