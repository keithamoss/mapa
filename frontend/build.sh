#!/bin/bash

rm -rf ./build
mkdir -p ./build

yarn run build

cd ./build && tar czvf /build/frontend.tgz .