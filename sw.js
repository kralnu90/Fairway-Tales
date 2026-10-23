// Fairway Tales offline support.
// The game page is fetched fresh whenever there's signal, so updates show up on their own;
// the saved copy is only used offline. Bump VERSION if icons or the manifest change.
const VERSION='ft-v1';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('ft-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(req.mode==='navigate'||url.pathname.endsWith('/index.html')){
    // network first for the game itself
    e.respondWith(fetch(req).then(r=>{const copy=r.clone();caches.open(VERSION).then(c=>c.put('index.html',copy));return r}).catch(()=>caches.match('index.html')));
    return;
  }
  if(url.origin===location.origin||url.host.endsWith('fonts.googleapis.com')||url.host.endsWith('fonts.gstatic.com')){
    // cache first for icons and fonts
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{const copy=r.clone();caches.open(VERSION).then(c=>c.put(req,copy));return r})));
  }
});
