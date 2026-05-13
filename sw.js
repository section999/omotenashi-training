const CACHE = 'omotenashi-v1'

const PRECACHE = [
  '/omotenashi-training/',
  '/omotenashi-training/index.html',
  '/omotenashi-training/curriculum.html',
  '/omotenashi-training/md-viewer.html',
  '/omotenashi-training/vocabularypractice.html',
  '/omotenashi-training/manifest.json',
  '/omotenashi-training/assets/nav.css',
  '/omotenashi-training/assets/nav.js',
  '/omotenashi-training/assets/icon.svg',
  '/omotenashi-training/assets/favicon-32x32.png'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(PRECACHE).then(() => self.skipWaiting())
    )
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const req = event.request
  const url = new URL(req.url)

  if (url.pathname.startsWith('/omotenashi-training/content/') ||
      url.pathname.startsWith('/omotenashi-training/scenarios/')) {
    event.respondWith(networkFirst(req))
  } else if (
    req.method === 'GET' &&
    url.origin === location.origin
  ) {
    event.respondWith(cacheFirst(req))
  }
})

async function cacheFirst(req) {
  const cached = await caches.match(req)
  if (cached) return cached
  try {
    const res = await fetch(req)
    if (res.ok) {
      const cache = await caches.open(CACHE)
      cache.put(req, res.clone())
    }
    return res
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(req) {
  try {
    const res = await fetch(req)
    if (res.ok) {
      const cache = await caches.open(CACHE)
      cache.put(req, res.clone())
    }
    return res
  } catch {
    const cached = await caches.match(req)
    if (cached) return cached
    return new Response('Offline', { status: 503 })
  }
}
