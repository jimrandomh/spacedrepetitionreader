#!/usr/bin/env node
const {build,cliopts} = require("estrella");
const fs = require("fs");
const process = require("process");

console.log("Checking for config.js");
if (!fs.existsSync("./config.js")) {
  console.log("Can't build, no config.js found");
  process.exit(0);
}

const serverConfig = require("./config");
const connectionString = serverConfig.psqlConnectionString;
process.env.DATABASE_URL = connectionString;

const externalLibs = [
  "express","path","fs","rss-parser","body-parser","bcrypt","@prisma",
  "@prisma/client","crypto","rel-to-abs","process","html-to-text","mailgun",
  "mailgun.js","mailgun.js/Interfaces","form-data","juice","events","node:http",
  "node:https","node:zlib","node:buffer","node:fs","node:stream","node:path",
  "node:util","node:url","node:net","better-sqlite3"
];

build({
  entryPoints: ['client/client.tsx'],
  bundle: true,
  sourcemap: true,
  sourcesContent: true,
  external: externalLibs,
  keepNames: true,
  minify: false,
  outfile: 'build/client.js',
  run: false,
  define: {
    isClient: true,
    isServer: false,
  },
}).catch(() => process.exit(1))

build({
  entryPoints: ['server/server.tsx'],
  bundle: true,
  sourcemap: true,
  sourcesContent: true,
  external: externalLibs,
  outfile: 'build/server.js',
  minify: false,
  run: cliopts.run && ['node', '-r', 'source-map-support/register', '--inspect', 'build/server.js'],
  platform: "node",
  define: {
    isClient: false,
    isServer: true,
  },
}).catch(() => process.exit(1))

