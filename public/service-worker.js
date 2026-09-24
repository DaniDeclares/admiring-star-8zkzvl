const CACHE='dani-app-shell-v3';
const SHELL=['/portal','/portal/login','/manifest.json','/manifest-worker.json','/manifest-customer.json','/dani-declares-favicon.png'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).catch(()=>null));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  if(url.pathname.startsWith('/api/')) return;

  // The worker app shell is a portal resilience feature only. Never intercept
  // public-site navigation: a failed homepage/catalog request must not fall
  // back to the authenticated /portal shell.
  const isPortalRequest=url.pathname==='/portal'||url.pathname.startsWith('/portal/');
  const isWorkerAsset=SHELL.includes(url.pathname);
  if(!isPortalRequest&&!isWorkerAsset) return;

  event.respondWith(
    fetch(event.request)
      .then(response=>{
        if(response&&response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        }
        return response;
      })
      .catch(()=>caches.match(event.request).then(cached=>cached||(isPortalRequest?caches.match('/portal'):undefined)))
  );
});
