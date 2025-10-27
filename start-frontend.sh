#!/bin/bash
cd "$(dirname "$0")/frontend"
export NODE_OPTIONS=--openssl-legacy-provider
SKIP_PREFLIGHT_CHECK=true npm start
