#!/usr/bin/env node
const {build,cliopts} = require("estrella");

build({
  entryPoints: ['client/client.tsx'],
  bundle: true,
  sourcemap: true,
  sourcesContent: true,
  keepNames: true,
  minify: false,
  outfile: 'build/client.js',
  run: false,
}).catch(() => process.exit(1))

build({
  entryPoints: ['server/server.tsx'],
  bundle: true,
  sourcemap: true,
  sourcesContent: true,
  external: ["express","path","fs","rss-parser","body-parser","bcrypt","@prisma","@prisma/client","crypto"],
  outfile: 'build/server.js',
  minify: false,
  run: true,
}).catch(() => process.exit(1))

