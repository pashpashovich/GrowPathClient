#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

REGISTRY=${DOCKER_REGISTRY:-localhost:5000}
IMAGE_NAME=${IMAGE_NAME:-growpath-client}
TAG=${TAG:-latest}
API_URL=${REACT_APP_API_URL:-http://localhost:8080/api}

echo "Building and pushing Docker image..."
echo "Registry: $REGISTRY"
echo "Image: $IMAGE_NAME:$TAG"

docker build \
  --build-arg REACT_APP_API_URL=$API_URL \
  -f deployment/Dockerfile \
  -t $REGISTRY/$IMAGE_NAME:$TAG \
  -t $REGISTRY/$IMAGE_NAME:latest \
  .

if [ "$PUSH" = "true" ]; then
  echo "Pushing image to registry..."
  docker push $REGISTRY/$IMAGE_NAME:$TAG
  docker push $REGISTRY/$IMAGE_NAME:latest
  echo "Image pushed successfully!"
else
  echo "Skipping push. Set PUSH=true to push to registry."
fi
