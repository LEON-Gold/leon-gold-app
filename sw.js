/* Keeps the app on the phone: network first so updates arrive when online, cache when offline.
   build.ps1 stamps VERSION so each build replaces the old cache. */
var VERSION='B12BA0057EEF',CACHE='leon-gold-'+VERSION,FILES=['./','index.html','manifest.webmanifest?v=2','icon-180.png?v=2','icon-512.png',
  'lib/html2canvas.min.js','lib/jspdf.umd.min.js','lib/xlsx.full.min.js'];  // PDF and Excel, loaded only when used
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
/* the public site's preview lives under site/ inside this scope: leave it to the network, so its photos and video
   stay out of the ledger's cache and an offline visit never answers a site page with the ledger */
self.addEventListener('fetch',function(e){var r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin||u.pathname.indexOf('/api/')>=0||u.pathname.indexOf('/site/')>=0)return;
  e.respondWith(fetch(r).then(function(res){if(res.ok){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}return res})
    .catch(function(){return caches.match(r,{ignoreSearch:true}).then(function(m){return m||caches.match('index.html')})}))});
/* notifications from the sync server (leon-gold-server/notify.mjs): what the other ledger users did, and new orders
   from «حساب من». A tap opens the ledger, or brings it forward if it is already open. */
self.addEventListener('push',function(e){var m={};try{m=e.data?e.data.json():{}}catch(x){m={body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(m.title||'دفتر لئون',{body:m.body||'',dir:'rtl',lang:'fa',icon:'icon-180.png?v=2',badge:'icon-180.png?v=2'}))});
self.addEventListener('notificationclick',function(e){e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(all){
    for(var i=0;i<all.length;i++){var c=all[i];if(c.url.indexOf(self.registration.scope)===0&&c.url.indexOf('/site/')<0)return c.focus()}
    return self.clients.openWindow(self.registration.scope)}))});
