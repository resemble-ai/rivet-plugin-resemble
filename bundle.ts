import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'neutral',
  format: 'esm',
  target: 'es2022',
  outfile: 'dist/bundle.js',
  // Rivet provides its core library at runtime — never bundle it.
  external: ['@ironclad/rivet-core'],
})

// eslint-disable-next-line no-console
console.log('Built dist/bundle.js')
