import copy from 'bun-copy-plugin'
import lightningcss from 'bun-lightningcss';

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
    lightningcss(),
  ],
}).catch(err => {
  console.error(err);
});
