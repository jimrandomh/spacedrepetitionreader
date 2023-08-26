#!/bin/bash

## runProduction.sh: Run the server in production. This uses the enviornment variable
## GITHUB_DEPLOY_KEY as an ssh priate key to load the github repo named in
## GITHUB_CREDENTIALS_REPO, which should contain a config.js (which in turn contains
## the database password and other configuration)
#
## GITHUB_DEPLOY_KEY should be an SSH private key, which is added to the credentials
## repo as described in: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys
#echo "$GITHUB_DEPLOY_KEY" >ssh_key
#
#echo "Cloning credentials repo"
#GIT_SSH_COMMAND="ssh -v -i ssh_key -o StrictHostKeyChecking=no" git clone ssh://git@github.com/$GITHUB_CREDENTIALS_REPO Credentials
#
#echo "Copying config"
#cp Credentials/config.js .
#
#echo "Cleaning up temporaries"
#rm ssh_key
#rm -rf Credentials

echo "$SERVER_CONFIG" >config.js

echo "Running yarn install"
yarn --network-timeout 100000 install

echo "Running apt-get install"
apt-get install build-essential libpq-dev

yarn prisma generate

echo "Starting server"
./build.js --watch --run

