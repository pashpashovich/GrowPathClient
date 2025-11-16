#!/bin/bash

set -e

echo "Deploying GrowPath Client with Docker Compose..."

cd "$(dirname "$0")/../.."
docker-compose -f deployment/docker-compose.yml up -d --build

echo "Deployment completed!"
echo "Application is running on http://localhost:3000"
