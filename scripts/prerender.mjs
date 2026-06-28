import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'

const SITE = 'https://www.ortstrategy.com'
const DEFAULT_IMG = `${SITE}/ort-logo.png`

// ── Load .env / .env.local ──────────────────────────────────────────────────
function loadEnv() {
  if (process.env.VITE_FIREBASE_PROJECT_ID) return process.env
  try {
    const candidates = ['.env.local', '.env']
    const envFile = candidates.find(f => { try { readFileSync(resolve(process.cwd(), f)); return true } catch { return false } })
    if (!envFile) return {}
    const raw = readFileSync(resolve(process.cwd(), envFile), 'utf8')
    const vars = {}
    raw.split('\n').forEach(line => {
      const eq = line.indexOf('=')
      if (eq === -1) return
      vars[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
    })
    return vars
  } catch { return {} }
}

const env = loadEnv()
const PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID

// ── Fetch all published posts from Firestore REST API ───────────────────────
async function fetchPosts() {
  if (!PROJECT_ID) return []
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'posts' }],
          where: { fieldFilter: { field: { fieldPath: 'published' }, op: 'EQUAL', value: { booleanValue: true } } },
          select: { fields: [
            { fieldPath: 'slug' }, { fieldPath: 'title' },
            { fieldPath: 'excerpt' }, { fieldPath: 'coverImage' },
            { fieldPath: 'category' }, { fieldPath: 'author' },
            { fieldPath: 'publishedAt' },
          ]},
        },
      }),
    })
    const data = await res.json()
    return data.filter(r => r.document?.fields?.slug).map(r => {
      const f = r.document.fields
      return {
        slug:      f.slug?.stringValue || '',
        title:     f.title?.stringValue || '',
        excerpt:   f.excerpt?.stringValue || '',
        coverImage: f.coverImage?.stringValue || '',
        category:  f.category?.stringValue || '',
        author:    f.author?.mapValue?.fields?.name?.stringValue || 'OrtStrategy',
        publishedAt: r.document.updateTime?.split('T')[0] || '',
      }
    })
  } catch(e) {
    console.warn('  Could not fetch posts for prerender:', e.message)
    return []
  }
}

// ── Inject meta into base HTML ───────────────────────────────────────────────
function inject(html, { title, description, canonical, ogType = 'website', image = DEFAULT_IMG, jsonLd }) {
  const fullTitle = `${title} | OrtStrategy`
  const esc = s => s.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const ldTag = jsonLd
    ? `\n    <script type="application/ld+json">\n    ${JSON.stringify(jsonLd, null, 2)}\n    </script>`
    : ''

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/,   `$1${esc(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/,  `$1${esc(fullTitle)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/,`$1${esc(description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/,    `$1${canonical}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/,  `$1${image || DEFAULT_IMG}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/,   `$1${ogType}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/,  `$1${esc(fullTitle)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/,`$1${esc(description)}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/,  `$1${image || DEFAULT_IMG}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/,          `$1${canonical}$2`)
    .replace(/(<\/head>)/, `${ldTag}\n  $1`)
}

// ── Write file, creating directories as needed ───────────────────────────────
function write(outPath, content) {
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, content, 'utf8')
}

// ── Static routes ─────────────────────────────────────────────────────────────
const STATIC_ROUTES = [
  {
    path: 'blog',
    title: 'Blog — Engineering Insights & Deep Dives',
    description: 'Engineering insights, deep dives, and stories from the OrtStrategy team. DevOps, security, system design, and more.',
  },
  {
    path: 'hire-engineers',
    title: 'Hire Engineers — Pre-Vetted Tech Talent',
    description: 'Hire pre-vetted software engineers, DevOps specialists, and tech talent through OrtStrategy. Fast matching, flexible engagement.',
  },
  {
    path: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'OrtStrategy Privacy Policy — how we collect, use, and protect your information.',
  },
  {
    path: 'terms-of-service',
    title: 'Terms of Service',
    description: 'OrtStrategy Terms of Service — the terms that govern your use of our platform and services.',
  },
  {
    path: 'work-policy',
    title: 'Work Policy',
    description: 'OrtStrategy Work Policy — our standards and practices for client engagements.',
  },
]

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('Pre-rendering routes...')
  const base = readFileSync(resolve(process.cwd(), 'dist/index.html'), 'utf8')

  // Static routes
  for (const route of STATIC_ROUTES) {
    const html = inject(base, {
      title: route.title,
      description: route.description,
      canonical: `${SITE}/${route.path}`,
    })
    write(resolve(process.cwd(), `dist/${route.path}/index.html`), html)
    console.log(`  ✓ /${route.path}`)
  }

  // Blog posts
  const posts = await fetchPosts()
  for (const post of posts) {
    const canonical = `${SITE}/blog/${post.slug}`
    const html = inject(base, {
      title: post.title,
      description: post.excerpt || post.title,
      canonical,
      ogType: 'article',
      image: post.coverImage || DEFAULT_IMG,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt || '',
        image: post.coverImage || DEFAULT_IMG,
        datePublished: post.publishedAt,
        author: { '@type': 'Person', name: post.author },
        publisher: {
          '@type': 'Organization',
          name: 'OrtStrategy',
          logo: { '@type': 'ImageObject', url: `${SITE}/ort-logo.png` },
        },
        url: canonical,
      },
    })
    write(resolve(process.cwd(), `dist/blog/${post.slug}/index.html`), html)
    console.log(`  ✓ /blog/${post.slug}`)
  }

  console.log(`  Done — ${STATIC_ROUTES.length} static + ${posts.length} blog routes pre-rendered`)
}

run()
