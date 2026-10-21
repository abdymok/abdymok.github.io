const CACHE_NAME="abdymok-v18";

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
  if(url.origin!==self.location.origin)return;

  // Never intercept media or byte-range requests. Safari needs the server's
  // native 206 Partial Content response for reliable MP4 playback/seeking.
  if(request.headers.has("range") || /\.(mp4|mov|m4a|webm|m4v)$/i.test(url.pathname))return;

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
