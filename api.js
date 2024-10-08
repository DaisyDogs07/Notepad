const http = require('http');
const https = require('https');
const fs = require('fs');
const database = new (require('SimpleDatabase'));
const mimeTypes = require('mime-types');

function readBody(req) {
  return new Promise((res, rej) => {
    let chunks = [];
    req.on('data', d => chunks.push(d))
      .once('end', () => res(Buffer.concat(chunks)))
      .on('error', rej);
  });
}

async function handleRequest(req, res) {
  let path = req.url.split('?')[0];
  if (!path.startsWith('/') || path.includes('..'))
    return res.writeHead(404).end();
  if (path.startsWith('/api/')) {
    const op = path.slice(5).split('/');
    switch (op[0]) {
      case 'id': {
        switch (req.method) {
          case 'OPTIONS': {
            return res.writeHead(200, {
              'Allow': 'GET,POST,DELETE,OPTIONS'
            }).end();
          }
          case 'GET': {
            const body = op[1];
            if (!body?.length || body.includes('.'))
              return res.writeHead(400).end();
            if (database.has(body))
              return res.writeHead(200).end();
            return res.writeHead(404).end();
          }
          case 'POST': {
            let body;
            try {
              body = (await readBody(req)).toString('utf8');
            } catch (e) {
              console.log(e);
              res.writeHead(500).end();
            }
            if (!body.length || body.includes('.'))
              return res.writeHead(400).end();
            database.set(body, '');
            return res.writeHead(201).end();
          }
          case 'DELETE': {
            let body;
            try {
              body = (await readBody(req)).toString('utf8');
            } catch (e) {
              console.log(e);
              res.writeHead(500).end();
            }
            if (!body.length || body.includes('.'))
              return res.writeHead(400).end();
            database.delete(body);
            return res.writeHead(201).end();
          }
          default: {
            return res.writeHead(405).end();
          }
        }
      }
      case 'note': {
        switch (req.method) {
          case 'OPTIONS': {
            return res.writeHead(200, {
              'Allow': 'GET,PATCH,OPTIONS'
            }).end();
          }
          case 'GET': {
            const body = op[1];
            if (!body?.length || body.includes('.'))
              return res.writeHead(400).end();
            if (!database.has(body))
              return res.writeHead(404).end();
            return res.writeHead(200).end(database.get(body));
          }
          case 'PATCH': {
            let body;
            try {
              body = (await readBody(req)).toString('utf8');
            } catch (e) {
              console.log(e);
              res.writeHead(500).end();
            }
            let json;
            try {
              json = JSON.parse(body);
            } catch {
              res.writeHead(400).end();
            }
            if (typeof json.id !== 'string' ||
                !json.id.length ||
                json.id.includes('.') ||
                typeof json.value !== 'string')
              return res.writeHead(400).end();
            if (!database.has(json.id))
              return res.writeHead(404).end();
            database.set(json.id, json.value);
            return res.writeHead(200).end();
          }
          default: {
            return res.writeHead(405).end();
          }
        }
      }
      default: {
        return res.writeHead(400).end();
      }
    }
  }
  if (path === '/')
    path = '/index.html';
  if (fs.existsSync('.' + path)) {
    if (fs.existsSync('.' + path + '.gz'))
      return fs.createReadStream('.' + path + '.gz')
        .pipe(res.writeHead(200, {
          'Content-Type': mimeTypes.lookup(path),
          'Content-Encoding': 'gzip'
        }));
    return fs.createReadStream('.' + path)
      .pipe(res.writeHead(200, {
        'Content-Type': mimeTypes.lookup(path)
      }));
  }
  return res.writeHead(404).end();
}

http.createServer(handleRequest).listen(80);
https.createServer(handleRequest).listen(443);