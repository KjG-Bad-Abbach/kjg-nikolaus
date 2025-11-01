#!/bin/bash

docker build \
  --build-arg NODE_ENV=production \
  -t kjg-nikolaus-frontend:latest \
  -f Dockerfile.prod .
