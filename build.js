#!/usr/bin/env node
const {build,cliopts} = require("estrella");

build({
  entryPoints: ['client/client.tsx'],
  bundle: true,
  sourcemap: true,
  sourcesContent: true,
  outfile: 'build/client.js',
  run: false,
}).catch(() => process.exit(1))

build({
  entryPoints: ['server/server.tsx'],
  bundle: true,
  sourcemap: true,
  sourcesContent: true,
  external: ["express","path","fs"],
  outfile: 'build/server.js',
  run: true,
}).catch(() => process.exit(1))

