#!/bin/bash

if [ ! -f "config.js" ]; then
  cp "defaultConfig.js" "config.js"
fi

