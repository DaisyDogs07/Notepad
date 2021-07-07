let sites = [
    '/',
    '/options.html',
    '/manifest.json',
    'https://notepad.daisydogs07.repl.co/favicon.png'
];
addEventListener('install', e => e.waitUntil(caches.delete('Notepad').then(() => caches.open('Notepad').then(c => c.addAll(sites)))));
addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request)
        .then(res => {
        return res || (function () {
            return fetch(e.request).then(res => {
                const resClone = res.clone(), url = new URL(res.url);
                if (sites.includes(url.pathname))
                    caches.open('Notepad').then(cache => cache.put(e.request, resClone));
                return res;
            });
        }());
    }));
});
