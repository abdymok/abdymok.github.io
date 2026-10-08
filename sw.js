const CACHE_NAME="abdymok-v6";

self.addEventListener("install",e=>e.waitUntil(self.skipWaiting()));

self.addEventListener("activate",e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k.startsWith("abdymok-")&&k!==CACHE_NAME).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim())
));

self.addEventListener("fetch",e=>{
  const request=e.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==location.origin)return;

  e.respondWith(
    fetch(request,{cache:"no-store"})
      .then(response=>{
        if(response&&response.ok){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(c=>c.put(request,copy));
        }
        return response;
      })
      .catch(()=>caches.match(request))
  );
});