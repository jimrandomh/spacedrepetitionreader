#!/usr/bin/env node
const serverConfig = require("../config");
const connectionString = serverConfig.psqlShadowDbConnectionString;
console.log(connectionString);

