#!/usr/bin/env node
const serverConfig = require("../config");
const connectionString = serverConfig.psqlConnectionString;
console.log(connectionString);

