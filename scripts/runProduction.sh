#!/bin/bash

export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use 18
node --version

echo "Running yarn install"
yarn install

echo "Starting server"
./build.js --watch --run

