/* Change VERSION when you edit the display, then upload both files. */
var VERSION="mini-board-private-v3";
var CACHE=VERSION+":"+self.registration.scope;
self.addEventListener("install",function(event){event.waitUntil(caches.open(CACHE).then(function(cache){return cache.addAll(["./","./index.html"]);}).then(function(){return self.skipWaiting();}));});
self.addEventListener("activate",function(event){event.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(key){return key.indexOf("mini-board-private-")===0&&key.slice(key.indexOf(":" )+1)===self.registration.scope&&key!==CACHE;}).map(function(key){return caches.delete(key);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(event){
  if(event.request.method!=="GET"||event.request.mode!=="navigate")return;
  var url=new URL(event.request.url),base=new URL(self.registration.scope);
  if(url.origin!==base.origin||[base.pathname,base.pathname+"index.html"].indexOf(url.pathname)<0)return;
  event.respondWith(fetch(event.request).then(function(response){if(!response.ok)throw new Error("Page unavailable");var copy=response.clone();event.waitUntil(caches.open(CACHE).then(function(cache){return cache.put("./index.html",copy);}));return response;}).catch(function(){return caches.match("./index.html");}));
});
