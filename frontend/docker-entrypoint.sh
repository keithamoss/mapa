#!/bin/sh

command="$1"
cd /app

if [ ! -d ".yarn" ]; then
  rm -f .yarn*
fi

# For some reason our Docker container run through GitHub Actions comes with yarn 1.x, but then that can't upgrade directly to 3.x
# So let's upgrade to v4+ (berry) and then downgrade to 3.x.
# We avoid yarn v4 at the moment because it broke some stuff (see earlier commit logs)
yarn set version berry
yarn set version 3.x

yarn install

if [ "$VITE_ENVIRONMENT" = "DEVELOPMENT" ]; then
  yarn run start
  exit
fi

if [ x"$command" = x"build" ]; then
    . /app/build.sh
    exit
fi