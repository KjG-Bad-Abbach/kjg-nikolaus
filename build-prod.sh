#!/bin/bash

docker build \
  --build-arg NODE_ENV=production \
  -t kjg-nikolaus:latest \
  -f Dockerfile.prod .
  # --build-arg STRAPI_URL=https://api.example.com \ # Uncomment to set the Strapi Server URL
