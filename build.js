#!/usr/bin/env node
const {build,cliopts} = require("estrella");
const serverConfig = require("./config");

const connectionString = serverConfig.psqlConnectionString;
process.env.DATABASE_URL = connectionString;

build({
  entryPoints: ['client/client.tsx'],
  bundle: true,
  sourcemap: true,
  sourcesContent: true,
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
  external: ["express","path","fs","rss-parser","body-parser","bcrypt","@prisma","@prisma/client","crypto","rel-to-abs","process","html-to-text","mailgun.js","form-data","juice"],
  outfile: 'build/server.js',
  minify: false,
  run: cliopts.run && ['node', '-r', 'source-map-support/register', '--inspect', 'build/server.js'],
  define: {
    isClient: false,
    isServer: true,
  },
}).catch(() => process.exit(1))

