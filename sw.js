"use strict";

const MEDIA_CACHE = "luminara-media-v1";
const MEDIA_PATHS = ["/assets/optimized/", "/assets/fonts/"];

self.addEventListener("install", function(){
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys()
      .then(function(keys){
        return Promise.all(keys.map(function(key){
          if (key.indexOf("luminara-") === 0 && key !== MEDIA_CACHE){ return caches.delete(key); }
          return Promise.resolve(false);
        }));
      })
      .then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(event){
  const request = event.request;
  if (request.method !== "GET"){ return; }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin){ return; }

  const isMedia = MEDIA_PATHS.some(function(prefix){
    return url.pathname.indexOf(prefix) !== -1;
  });
  if (!isMedia){ return; }

  event.respondWith(
    caches.match(request).then(function(cached){
      if (cached){ return cached; }
      return fetch(request).then(function(response){
        if (response.ok){
          const copy = response.clone();
          caches.open(MEDIA_CACHE).then(function(cache){
            cache.put(request, copy);
          });
        }
        return response;
      });
    })
  );
});
