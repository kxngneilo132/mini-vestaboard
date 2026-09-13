/* Increase the version whenever you update the display. */

var VERSION = "mini-board-private-v3";
var CACHE = VERSION + ":" + self.registration.scope;


/* Save the display for offline use. */

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) {
        return cache.addAll([
          "./",
          "./index.html"
        ]);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});


/* Remove older copies belonging to this board. */

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        var oldCaches = keys.filter(function (key) {
          return (
            key.indexOf("mini-board-private-") === 0 &&
            key.slice(key.indexOf(":") + 1) ===
              self.registration.scope &&
            key !== CACHE
          );
        });

        return Promise.all(
          oldCaches.map(function (key) {
            return caches.delete(key);
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});


/* Use the website when available, or its saved copy offline. */

self.addEventListener("fetch", function (event) {
  if (
    event.request.method !== "GET" ||
    event.request.mode !== "navigate"
  ) {
    return;
  }

  var url = new URL(event.request.url);
  var base = new URL(self.registration.scope);

  if (
    url.origin !== base.origin ||
    [
      base.pathname,
      base.pathname + "index.html"
    ].indexOf(url.pathname) < 0
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Page unavailable");
        }

        var copy = response.clone();

        event.waitUntil(
          caches.open(CACHE)
            .then(function (cache) {
              return cache.put("./index.html", copy);
            })
        );

        return response;
      })
      .catch(function () {
        return caches.match("./index.html");
      })
  );
});