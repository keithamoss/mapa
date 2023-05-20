#!/bin/bash

# rm -rf ./build
# mkdir -p ./build

# # For GitHub actions
# if [ ! -d "node_modules" ]; then
#     npm install
# fi

# npm run lint

npm run build

# pwd

cd ./build && tar czvf /build/frontend.tgz .

# cd ./build

# ls -l

# tar czvf /build/frontend.tgz .

ls -l /build