import copy from 'bun-copy-plugin'

await Bun.build({
  entrypoints: ['./src/index.js'],
  minify: {
    identifiers: true,
    syntax: true,
    whitespace: true,
  },
  target: 'browser',
  outdir: './public',
  plugins: [
    copy('static/', 'public'),
  ],
  sourcemap: 'linked',
}).catch(err => {
  console.error(err);
});
