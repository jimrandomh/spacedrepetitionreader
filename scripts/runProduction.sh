#!/bin/bash
set -ex

# runProduction.sh: Run the server in production. This uses the enviornment variable
# GITHUB_DEPLOY_KEY as an ssh priate key to load the github repo named in
# GITHUB_CREDENTIALS_REPO, which should contain a config.js (which in turn contains
# the database password and other configuration)

# GITHUB_DEPLOY_KEY should be an SSH private key, which is added to the credentials
# repo as described in: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys
echo "$GITHUB_DEPLOY_KEY" >ssh_key

echo "Cloning credentials repo"
GIT_SSH_COMMAND="ssh -i ssh_key" git clone https://git@github.com/$GITHUB_CREDENTIALS_REPO Credentials
rm ssh_key
cp Credentials/config.js .
rm -rf Credentials

./build.js --watch --run

