#!/bin/sh

command="$1"
cd /app

echo "yarn version"
yarn --version

if [ ! -d ".yarn" ]; then
  rm -f .yarn*
fi

# Update to v4+
yarn set version berry

# Downgrade to v3
yarn set version 3.x

echo "yarn version"
yarn --version

# yarn install

echo "fin"
exit

if [ "$VITE_ENVIRONMENT" = "DEVELOPMENT" ]; then
  yarn run start
  exit
fi

if [ x"$command" = x"build" ]; then
    . /app/build.sh
    exit
fi