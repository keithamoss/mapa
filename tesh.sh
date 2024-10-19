#!/bin/bash

echo "Foo!"

cd frontend && pnpm biome check --write --files-ignore-unknown=true --no-errors-on-unmatched