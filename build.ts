import copy from 'bun-copy-plugin'
import lightningcss from 'bun-lightningcss';

await Bun.build({
  entrypoints: ['./src/index.js'],
  minify: true,
  outdir: './public',
  plugins: [
    copy('static/', 'public'),
    lightningcss(),
  ],
});
