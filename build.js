const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['client/client.tsx'],
  bundle: true,
  outfile: 'build/client.js',
}).catch(() => process.exit(1))

esbuild.build({
  entryPoints: ['server/server.tsx'],
  bundle: true,
  external: ["express","path","fs"],
  outfile: 'build/server.js',
}).catch(() => process.exit(1))
