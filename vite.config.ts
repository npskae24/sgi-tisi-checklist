import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

const BASE = '/sgi-tisi-checklist/'

function listFiles(dir: string, prefix = ''): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name)
    const rel = `${prefix}${name}`
    if (statSync(abs).isDirectory()) out.push(...listFiles(abs, `${rel}/`))
    else if (name !== 'sw.js') out.push(BASE + rel)
  }
  return out
}

function hashNames(names: string[]): string {
  let hash = 5381
  for (const name of names) {
    for (let i = 0; i < name.length; i++) hash = ((hash << 5) + hash + name.charCodeAt(i)) >>> 0
  }
  return hash.toString(36)
}

/** Precache the built files so the second load works offline. No Workbox. */
function emitSw(): Plugin {
  return {
    name: 'emit-sw',
    apply: 'build',
    closeBundle() {
      const dist = join(process.cwd(), 'dist')
      const files = [BASE, ...listFiles(dist)]
      const cache = `sgi-${hashNames(files)}`
      const shell = `${BASE}index.html`
      const js = `const CACHE=${JSON.stringify(cache)};
const PRECACHE=${JSON.stringify(files)};
const SHELL=${JSON.stringify(shell)};
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  )
})
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  if (new URL(req.url).origin !== self.location.origin) return
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(req, copy))
        }
        return res
      })
      .catch(async () => {
        const hit = await caches.match(req)
        if (hit) return hit
        if (req.mode === 'navigate') {
          const shellHit = await caches.match(SHELL)
          if (shellHit) return shellHit
        }
        return new Response('offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      }),
  )
})
`
      writeFileSync(join(dist, 'sw.js'), js)
    },
  }
}

export default defineConfig({
  base: BASE,
  plugins: [emitSw()],
})
