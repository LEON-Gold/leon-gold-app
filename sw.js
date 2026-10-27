/* Keeps the app on the phone: network first so updates arrive when online, cache when offline.
   build.ps1 stamps VERSION so each build replaces the old cache. */
var VERSION='8A892A0AE299',CACHE='leon-gold-'+VERSION,FILES=['./','index.html','manifest.webmanifest?v=2','icon-180.png?v=2','icon-512.png',
  'lib/html2canvas.min.js','lib/jspdf.umd.min.js','lib/xlsx.full.min.js'];  // PDF and Excel, loaded only when used
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
/* the public site's preview lives under site/ inside this scope: leave it to the network, so its photos and video
   stay out of the ledger's cache and an offline visit never answers a site page with the ledger */
self.addEventListener('fetch',function(e){var r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin||u.pathname.indexOf('/api/')>=0||u.pathname.indexOf('/site/')>=0)return;
  e.respondWith(fetch(r).then(function(res){if(res.ok){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}return res})
    .catch(function(){return caches.match(r,{ignoreSearch:true}).then(function(m){return m||caches.match('index.html')})}))});
