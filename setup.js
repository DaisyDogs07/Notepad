require('child_process').execSync('npm i github:DaisyDogs07/SimpleDatabase terser mime-types');

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
  'settings.js',
  'serviceWorker.js'
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
  );
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
  'index.css',
  'settings.css',
  'manifest.json'
].forEach(file => {
  fs.writeFileSync(
    file.replace('.', '.min.'),
    fs.readFileSync(file, 'utf8')
      .replace(/\r?\n {0,}/g, '')
      .replace(/: /g, ':')
      .replace(/, /g, ',')
      .replace(/ {/g, '{')
  );
  pipeline(
    fs.createReadStream(file.replace('.', '.min.')),
    createGzip(),
    fs.createWriteStream(file + '.gz'),
    () => {
      fs.unlinkSync(file.replace('.', '.min.'));
    }
  );
});