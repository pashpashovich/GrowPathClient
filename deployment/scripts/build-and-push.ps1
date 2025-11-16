$ErrorActionPreference = "Stop"

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Join-Path $scriptPath "..\.."
Set-Location $projectRoot

$REGISTRY = if ($env:DOCKER_REGISTRY) { $env:DOCKER_REGISTRY } else { "localhost:5000" }
$IMAGE_NAME = if ($env:IMAGE_NAME) { $env:IMAGE_NAME } else { "growpath-client" }
$TAG = if ($env:TAG) { $env:TAG } else { "latest" }
$API_URL = if ($env:REACT_APP_API_URL) { $env:REACT_APP_API_URL } else { "http://localhost:8080/api" }

Write-Host "Building and pushing Docker image..." -ForegroundColor Green
Write-Host "Registry: $REGISTRY" -ForegroundColor Cyan
Write-Host "Image: $IMAGE_NAME:$TAG" -ForegroundColor Cyan

docker build `
  --build-arg REACT_APP_API_URL=$API_URL `
  -f deployment/Dockerfile `
  -t "$REGISTRY/$IMAGE_NAME`:$TAG" `
  -t "$REGISTRY/$IMAGE_NAME`:latest" `
  .

if ($env:PUSH -eq "true") {
  Write-Host "Pushing image to registry..." -ForegroundColor Yellow
  docker push "$REGISTRY/$IMAGE_NAME`:$TAG"
  docker push "$REGISTRY/$IMAGE_NAME`:latest"
  Write-Host "Image pushed successfully!" -ForegroundColor Green
} else {
  Write-Host "Skipping push. Set PUSH=true to push to registry." -ForegroundColor Yellow
}
