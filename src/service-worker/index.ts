/**
 * The offline shell: the files the app boots from and draws its one screen
 * with, precached so the app opens with the network off (SYSTEM.md).
 *
 * The cache is named after the build, so a new build is a new cache: a
 * returning device is moved onto it rather than left holding the old files.
 * SvelteKit bundles this file and registers it, so nothing here registers it.
 */
import { version } from "$app/env";
import { assets, immutable, prerendered } from "$app/manifest";
import { self } from "$app/service-worker";
import { assetUrl } from "#lib/assets.js";

const CACHE = `keysmash-${version}`;

/** Every file the app boots from: the built app, the static files, and the shell itself. */
const SHELL = [...immutable, ...assets, ...prerendered].map((entry) => assetUrl(entry.path));

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
