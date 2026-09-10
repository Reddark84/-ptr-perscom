/* Service Worker — PTR PERSCOM */
const CACHE = "ptr-perscom-v3";
const PRECACHE = ["/icon-192.png", "/icon-512.png", "/emblema.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Rede primeiro; cache como recurso de emergência para ficheiros estáticos.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const estatico = /\.(png|svg|jpg|jpeg|webp|ico|woff2?|css|js)$/.test(url.pathname) || url.pathname.startsWith("/_next/static/");
  if (estatico) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }))
    );
  }
});

self.addEventListener("push", (event) => {
  let data = { titulo: "PTR PERSCOM", corpo: "Nova notificação", url: "/", tag: undefined };
  try {
    data = Object.assign(data, event.data ? event.data.json() : {});
  } catch (_) {
    if (event.data) data.corpo = event.data.text();
  }
  // Pedir às janelas abertas que se actualizem para mostrar os dados novos.
  self.clients.matchAll({ type: "window" }).then((list) => list.forEach((c) => c.postMessage({ tipo: "actualizar" })));
  event.waitUntil(
    self.registration.showNotification(data.titulo, {
      body: data.corpo,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag,
      data: { url: data.url || "/" },
      vibrate: [120, 60, 120],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url === url && "focus" in c) return c.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
