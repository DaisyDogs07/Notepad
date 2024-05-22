const terser = require('terser');
const fs = require('fs');
const {
  pipeline
} = require('stream');
const {
  createGzip
} = require('zlib');

[
  'Buffer.js',
  'index.js',
  'settings.js'
].forEach(file => {
  fs.writeFileSync(file.replace('.', '.min.'), terser.minify_sync(terser.minify_sync(fs.readFileSync(file, 'utf8')).code).code);
  pipeline(
    fs.createReadStream(file.replace('.', '.min.')),
    createGzip(),
    fs.createWriteStream(file + '.gz'),
    () => {
      fs.unlinkSync(file.replace('.', '.min.'));
    }
  );
});

[
  'index.html',
  'settings.html'
].forEach(file => {
  fs.writeFileSync(
    file.replace('.', '.min.'),
    fs.readFileSync(file, 'utf8')
      .replace(/\r?\n {0,}/g, '')
      .replace('\r?\n', '')
  );
  pipeline(
    fs.createReadStream(file.replace('.', '.min.')),
    createGzip(),
    fs.createWriteStream(file + '.gz'),
    () => {
      fs.unlinkSync(file.replace('.', '.min.'));
    }
  );
})