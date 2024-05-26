const urls = [
  '/',
  '/Buffer.js',
  '/favicon.ico',
  '/favicon.png',
  '/favicon96x96.png',
  '/index.css',
  '/index.js',
  '/manifest.json',
  '/settings.css',
  '/settings.html',
  '/settings.js'
];

addEventListener('install', e => {
  e.waitUntil(caches.open('cache').then(cache => cache.addAll(urls), () => {}));
});

addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  e.respondWith(
    caches
      .match(url)
      .then(res => {
        if (res && !navigator.onLine)
          return res;
        return fetch(e.request).then(fres => {
          const clone = fres.clone();
          if (urls.includes(url.pathname) && clone.ok)
            caches.open('cache').then(cache => {
              cache.put(e.request, clone).catch(() => {});
            }, () => {});
          return clone;
        }, () => res);
      }, () => {
        return fetch(e.request);
      })
  )
});