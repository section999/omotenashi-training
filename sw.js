const CACHE = 'omotenashi-v14'

const BASE = self.location.pathname.replace(/\/[^/]*$/, '/')

const PRECACHE = [
  BASE,
  BASE + 'index.html',
  BASE + '404.html',
  BASE + 'manifest.json',
  BASE + 'assets/nav.css',
  BASE + 'assets/nav-template.js',
  BASE + 'assets/nav.js',
  BASE + 'assets/search-init.js',
  BASE + 'assets/analytics.js',
  BASE + 'assets/icon.svg',
  BASE + 'assets/favicon-32x32.png',
  BASE + 'assets/fcc_primary_large.png',
  BASE + 'assets/fcc_primary_small.png',
  BASE + 'pages/curriculum.html',
  BASE + 'pages/md-viewer.html',
  BASE + 'pages/vocabularypractice.html',
  BASE + 'pages/games.html',
  BASE + 'pages/languagedojo.html',
  BASE + 'pages/simulator.html',
  BASE + 'pages/dashboard.html'
]

const CDN_CACHE = 'omotenashi-cdn-v1'

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(PRECACHE).catch(err => {
        console.warn('SW: PRECACHE partial failure', err)
      })
    ).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE && k !== CDN_CACHE).map(k => caches.delete(k))
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const req = event.request
  const url = new URL(req.url)

  if (url.origin !== self.location.origin) {
    if (url.hostname === 'cdn.jsdelivr.net' && req.method === 'GET') {
      event.respondWith(cacheFirstCDN(req))
    }
    return
  }

  const p = url.pathname
  if (p.startsWith(BASE + 'content/') || p.startsWith(BASE + 'scenarios/')) {
    event.respondWith(networkFirst(req))
  } else if (req.method === 'GET') {
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
    const fallback = await caches.match(BASE + 'index.html')
    if (fallback) return fallback
    return new Response('Offline', { status: 503 })
  }
}

async function cacheFirstCDN(req) {
  const cached = await caches.match(req)
  if (cached) return cached
  try {
    const res = await fetch(req)
    if (res.ok) {
      const cache = await caches.open(CDN_CACHE)
      cache.put(req, res.clone())
    }
    return res
  } catch {
    const cached = await caches.match(req)
    if (cached) return cached
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
