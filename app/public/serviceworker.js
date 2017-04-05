var HTMLToCache = '/';
var version = 'PUSW V1';

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed');
  event.waitUntil(caches.open(version).then((cache) => {
    cache.add(HTMLToCache).then(self.skipWaiting());
  }));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
  caches.keys().then(cacheNames => Promise.all(cacheNames.map((cacheName) => {
    if (version !== cacheName) return caches.delete(cacheName);
  }))).then(self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  console.log('[Service Worker] Fetch', event.request.url);
  var requestToFetch = event.request.clone();
  event.respondWith(
  caches.match(event.request.clone()).then((cached) => {
    // We don't return cached HTML (except if fetch failed)
    if (cached) {
      var resourceType = cached.headers.get('content-type');
      // We only return non css/js/html cached response e.g images
      if (!hasHash(event.request.url) && !/text\/html/.test(resourceType)) {
        return cached;
      }

      // If the CSS/JS didn't change since it's been cached, return the cached version
      if (hasHash(event.request.url) && hasSameHash(event.request.url, cached.url)) {
        return cached;
      }
    }
    return fetch(requestToFetch).then((response) => {
      var clonedResponse = response.clone();
      var contentType = clonedResponse.headers.get('content-type');

      if (!clonedResponse || clonedResponse.status !== 200 || clonedResponse.type !== 'basic'
      || /\/sockjs\//.test(event.request.url)) {
        return response;
      }

      if (/html/.test(contentType)) {
        caches.open(version).then(cache => cache.put(HTMLToCache, clonedResponse));
      } else {
        // Delete old version of a file
        if (hasHash(event.request.url)) {
          caches.open(version).then(cache => cache.keys().then(keys => keys.forEach((asset) => {
            if (new RegExp(removeHash(event.request.url)).test(removeHash(asset.url))) {
              cache.delete(asset);
            }
          })));
        }

        caches.open(version).then(cache => cache.put(event.request, clonedResponse));
      }
      return response;
    }).catch(() => {
      if (hasHash(event.request.url)) return caches.match(event.request.url);
      // If the request URL hasn't been served from cache and isn't sockjs we suppose it's HTML
      else if (!/\/sockjs\//.test(event.request.url)) return caches.match(HTMLToCache);
      // Only for sockjs
      return new Response('No connection to the server', {
        status: 503,
        statusText: 'No connection to the server',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      });
    });
  })
  );
});

function removeHash(element) {
  if (typeof element === 'string') return element.split('?hash=')[0];
}

function hasHash(element) {
  if (typeof element === 'string') return /\?hash=.*/.test(element);
}

function hasSameHash(firstUrl, secondUrl) {
  if (typeof firstUrl === 'string' && typeof secondUrl === 'string') {
    return /\?hash=(.*)/.exec(firstUrl)[1] === /\?hash=(.*)/.exec(secondUrl)[1];
  }
}

// Service worker created by Ilan Schemoul alias NitroBAY as a specific Service Worker for Meteor
// Please see https://github.com/NitroBAY/meteor-service-worker for the official project source


// // Set a name for the current cache
// var cacheName = 'v1';
//
// // Default files to always cache
// var cacheFiles = [
//     './css/highlight.js-default.min.css'
// ];
//
//
// self.addEventListener('install', function(e) {
//     console.log('[Service Worker] Installed');
//
//     // e.waitUntil Delays the event until the Promise is resolved
//     e.waitUntil(
//
//         // Open the cache
//         caches.open(cacheName).then(function(cache) {
//
//             // Add all the default files to the cache
//             console.log('[Service Worker] Caching cacheFiles');
//             return cache.addAll(cacheFiles);
//         })
//     ); // end e.waitUntil
// });
//
//
// self.addEventListener('activate', function(e) {
//     console.log('[Service Worker] Activated');
//
//     e.waitUntil(
//
//         // Get all the cache keys (cacheName)
//         caches.keys().then(function(cacheNames) {
//             return Promise.all(cacheNames.map(function(thisCacheName) {
//               console.log('kyguitfutud',cacheNames);
//
//                 // If a cached item is saved under a previous cacheName
//                 if (thisCacheName !== cacheName) {
//
//                     // Delete that cached file
//                     console.log('[Service Worker] Removing Cached Files from Cache - ', thisCacheName);
//                     return caches.delete(thisCacheName);
//                 }
//             }));
//         })
//     ); // end e.waitUntil
//
// });
//
//
// self.addEventListener('fetch', function(e) {
//     console.log('[Service Worker] Fetch', e.request.url);
//
//     // e.respondWidth Responds to the fetch event
//     e.respondWith(
//
//         // Check in cache for the request being made
//         caches.match(e.request)
//
//
//             .then(function(response) {
//
//                 // If the request is in the cache
//                 if ( response ) {
//                     console.log("[Service Worker] Found in Cache", e.request.url, response);
//                     // Return the cached version
//                     return response;
//                 }
//
//                 // If the request is NOT in the cache, fetch and cache
//
//                 var requestClone = e.request.clone();
//                 fetch(requestClone)
//                     .then(function(response) {
//
//                         if ( !response ) {
//                             console.log("[Service Worker] No response from fetch ");
//                             return response;
//                         }
//
//                         var responseClone = response.clone();
//
//                         //  Open the cache
//                         caches.open(cacheName).then(function(cache) {
//
//                             // Put the fetched response in the cache
//                             cache.put(e.request, responseClone);
//                             console.log('[Service Worker] New Data Cached', e.request.url);
//
//                             // Return the response
//                             return response;
//
//                         }); // end caches.open
//
//                     })
//                     .catch(function(err) {
//                         console.log('[Service Worker] Error Fetching & Caching New Data', err);
//                     });
//
//
//             }) // end caches.match(e.request)
//     ); // end e.respondWith
// });
