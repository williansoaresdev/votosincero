const VERSION = "v12";
const APP_SHELL_CACHE = `voto-sincero-shell-${VERSION}`;
const RUNTIME_CACHE = `voto-sincero-runtime-${VERSION}`;

const APP_SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./objetivos.json",
  "./css/styles.css",
  "./js/app.js",
  "./js/data.js",
  "./js/utils.js",
  "./js/share.js",
  "./js/toast.js",
  "./js/analytics.js",
  "./js/views/common.js",
  "./js/views/home.js",
  "./js/views/detail.js",
  "./js/views/about.js",
  "./icons/icon-72.png",
  "./icons/icon-96.png",
  "./icons/icon-128.png",
  "./icons/icon-144.png",
  "./icons/icon-152.png",
  "./icons/icon-192.png",
  "./icons/icon-384.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-16.png",
  "./icons/favicon-32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isAppShellRequest(url) {
  return APP_SHELL_FILES.some((path) => url.pathname.endsWith(path.replace("./", "/")));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegação (abrir o app ou uma página como imprensa.html): tenta a rede
  // primeiro, cai para o cache offline da própria página ou, por fim, para o index.html.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  // App shell e objetivos.json: rede primeiro (o JSON é atualizado todo mês e o
  // leitor precisa ver a versão nova), com cache como fallback offline.
  if (isAppShellRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // PDF do plano de governo e imagens: cache-first com preenchimento
  // em segundo plano (runtime cache), para funcionar offline após a 1ª visita.
  if (url.pathname.includes("/src/assets/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }
});
