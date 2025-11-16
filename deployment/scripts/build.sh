#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "Building GrowPath Client Docker image..."

API_URL=${REACT_APP_API_URL:-http://localhost:8080/api}

docker build \
  --build-arg REACT_APP_API_URL=$API_URL \
  -f deployment/Dockerfile \
  -t growpath-client:latest \
  .

echo "Build completed successfully!"
echo "Image: growpath-client:latest"
