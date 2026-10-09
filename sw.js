// The shell the app boots and draws its one screen from. Bump CACHE in the
// same commit as any change to a file here, or a returning device keeps the
// old copy (SYSTEM.md).
const CACHE = "keysmash-v28";

const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./src/app.js",
  "./src/emoji-colors.js",
  "./src/lists.js",
  "./src/numbers.js",
  "./src/render.js",
  "./src/settings.js",
  "./src/speech.js",
  "./src/thresholds.js",
  "./src/words.js",
  "./clips/a.wav",
  "./clips/b.wav",
  "./clips/c.wav",
  "./clips/d.wav",
  "./clips/e.wav",
  "./clips/f.wav",
  "./clips/g.wav",
  "./clips/h.wav",
  "./clips/i.wav",
  "./clips/j.wav",
  "./clips/k.wav",
  "./clips/l.wav",
  "./clips/m.wav",
  "./clips/n.wav",
  "./clips/o.wav",
  "./clips/p.wav",
  "./clips/q.wav",
  "./clips/r.wav",
  "./clips/s.wav",
  "./clips/t.wav",
  "./clips/u.wav",
  "./clips/v.wav",
  "./clips/w.wav",
  "./clips/x.wav",
  "./clips/y.wav",
  "./clips/z.wav",
];

self.addEventListener("install", (event) => {
  // Fetch each shell file past the HTTP cache, or a fresh cache can hold a
  // stale file it fetched from one.
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      // An older keysmash cache means this install replaces one: the open pages
      // are on the old version, so reload them onto this one at once.
      const replacesOlder = keys.some((key) => key.startsWith("keysmash-") && key !== CACHE);
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
      if (!replacesOlder) return;
      for (const client of await self.clients.matchAll({ type: "window" })) client.navigate(client.url);
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((hit) => hit ?? fetch(event.request)));
});
