#!/bin/bash

rm -rf ./build
mkdir -p ./build

# For GitHub actions
if [ ! -d "node_modules" ]; then
    npm install
fi

npm run lint

npm run build
cd ./build && tar czvf /build/frontend.tgz .