import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const SITE_URL = 'https://www.ortstrategy.com'

// In CI env vars are injected directly; locally they live in .env.local / .env
function loadEnv() {
  // process.env already populated (CI / shell export) — use it directly
  if (process.env.VITE_FIREBASE_PROJECT_ID) return process.env

  // Local dev: parse .env.local or .env file
  try {
    const candidates = ['.env.local', '.env']
    const envFile = candidates.find(f => { try { readFileSync(resolve(process.cwd(), f)); return true } catch { return false } })
    if (!envFile) return {}
    const raw = readFileSync(resolve(process.cwd(), envFile), 'utf8')
    const vars = {}
    raw.split('\n').forEach(line => {
      const eq = line.indexOf('=')
      if (eq === -1) return
      const key = line.slice(0, eq).trim()
      const val = line.slice(eq + 1).trim()
      if (key) vars[key] = val
    })
    return vars
  } catch {
    return {}
  }
}

const env = loadEnv()
const PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID

if (!PROJECT_ID) {
  console.error('VITE_FIREBASE_PROJECT_ID not found in .env — skipping sitemap generation')
  process.exit(0)
}

const STATIC_PAGES = [
  { url: '/',                 priority: '1.0', changefreq: 'weekly'  },
  { url: '/blog',             priority: '0.9', changefreq: 'daily'   },
  { url: '/hire-engineers',   priority: '0.8', changefreq: 'monthly' },
  { url: '/work-policy',      priority: '0.4', changefreq: 'yearly'  },
  { url: '/privacy-policy',   priority: '0.3', changefreq: 'yearly'  },
  { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly'  },
]

async function fetchPublishedPosts() {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'posts' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'published' },
            op: 'EQUAL',
            value: { booleanValue: true },
          },
        },
        select: {
          fields: [
            { fieldPath: 'slug' },
            { fieldPath: 'publishedAt' },
          ],
        },
      },
    }),
  })

  if (!res.ok) throw new Error(`Firestore API returned ${res.status}`)

  const data = await res.json()
  return data
    .filter(r => r.document?.fields?.slug)
    .map(r => ({
      slug: r.document.fields.slug.stringValue,
      lastmod: r.document.updateTime?.split('T')[0] || new Date().toISOString().split('T')[0],
    }))
}

async function run() {
  console.log('Generating sitemap...')
  const today = new Date().toISOString().split('T')[0]

  let posts = []
  try {
    posts = await fetchPublishedPosts()
    console.log(`  Found ${posts.length} published post${posts.length !== 1 ? 's' : ''}`)
  } catch (e) {
    console.warn(`  Could not fetch posts (${e.message}) — sitemap will contain static pages only`)
  }

  const urlNodes = [
    ...STATIC_PAGES.map(p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),

    ...posts.map(p => `  <url>
    <loc>${SITE_URL}/blog/${p.slug}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes.join('\n')}
</urlset>`

  const outPath = resolve(process.cwd(), 'public/sitemap.xml')
  writeFileSync(outPath, xml, 'utf8')
  console.log(`  ✓ Written to public/sitemap.xml (${STATIC_PAGES.length} static + ${posts.length} blog URLs)`)
}

run()