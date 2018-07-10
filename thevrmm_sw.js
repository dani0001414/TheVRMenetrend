/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
//const CACHE_VERSION = '{{ site.time }}';
function date() {
  var d = new Date();
  var honap = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  var honapnap = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"];
  var dat = d.getFullYear() + "." + honap[d.getMonth()] + "." + honapnap[d.getDate()];
  return dat;
}
function timestamp(b) {
  var utcDate = b;
  var localDate = new Date(utcDate);
  var localDate = localDate.getTime() / 1000;
  return localDate;
}

function current_timestamp() {
  var d = new Date().getTime();
  return d / 1000;
}
//const version = "v2018.07.10";
const version = "v" + date();
const PRECACHE = 'precache-' + version;
const RUNTIME = 'runtime' + version;

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  'mm.html',
  'https://i.imgur.com/5dZn6sc.png',
  '',
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

var eltelt;
// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  var same_origin = event.request.url.startsWith(self.location.origin);
  var google_fonts = event.request.url.startsWith('https://fonts');
  var twitch_cover = event.request.url.startsWith('https://static-cdn.jtvnw.net/twitch-event');
  var imgur = event.request.url.startsWith('https://i.imgur.com/9KP46NF.png');

  if (same_origin | google_fonts | twitch_cover | imgur) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          eltelt = current_timestamp() - timestamp(cachedResponse.headers.get('Date'));
          if (twitch_cover & (eltelt > 200)) {
            console.log('elteltmásodpercek:', cachedResponse.url);
            caches.open(RUNTIME).then(function (cache) {
              cache.delete(cachedResponse).then(function(response) {
               //valami
              });
            })

          }
          console.log('elteltmásodpercek:', eltelt);


          return cachedResponse;

        }




        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      }) /*.catch(function () { return caches.match('mm.html');})*/
    );
  }
})