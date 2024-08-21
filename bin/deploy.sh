#!/bin/sh

export DISABLE_ESLINT_PLUGIN="true" # ignore eslint/prettier errors during build

if npm run build ; then
  echo "Successfully built project with npm"
else
  echo "Failed to build project with npm"
  exit 1
fi

read -rp "Enter your UB username (e.g. username@buffalo.edu): " username

if scp -r build/* api ${username}@cheshire.cse.buffalo.edu:/web/CSE442-542/2024-Spring/cse-442t/; then
  echo "Successfully deployed to server, enter password again to set permissions"

  if ssh ${username}@cheshire.cse.buffalo.edu "chmod -R ugo+rwx /web/CSE442-542/2024-Spring/cse-442t/*" ; then
    echo "Successfully set permissions on deployed files"
  else
    echo "Failed to set permissions on deployed files, please rerun this script so that permissions are properly set for everyone"
    exit 1
  fi
else
  echo "Failed to deploy to server"
  exit 1
fi
