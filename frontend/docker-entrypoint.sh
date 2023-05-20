#!/bin/sh

command="$1"
cd /app

if [ ! -d ".yarn" ]; then
  rm -f .yarn*
  yarn set version stable
  yarn install
else
  yarn install
fi

if [ "$VITE_ENVIRONMENT" = "DEVELOPMENT" ]; then
  yarn run start
  exit
fi

if [ x"$command" = x"build" ]; then
    . /app/build.sh
    exit
fi