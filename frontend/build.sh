#!/bin/bash

rm -rf ./build
mkdir -p ./build

# For GitHub actions
if [ ! -d "node_modules" ]; then
    yarn install
fi

# For some reason npm throws:
# EACCES: permission denied, mkdir '/app/build/app-icon'
# So whatever, let's just use yarn to build for now
# and see if switching to vite fixes this
yarn run build

cd ./build && tar czvf /build/frontend.tgz .