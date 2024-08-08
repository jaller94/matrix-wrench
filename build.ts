import copy from 'bun-copy-plugin'

await Bun.build({
  entrypoints: ['./src/index.js'],
  minify: {
    identifiers: false,
    syntax: true,
    whitespace: true,
  },
  target: 'browser',
  outdir: './public',
  plugins: [
    copy('static/', 'public'),
  ],
}).catch(err => {
  console.error(err);
});
