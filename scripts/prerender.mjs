import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'

const SITE = 'https://www.ortstrategy.com'
const DEFAULT_IMG = `${SITE}/og-image.png`

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

// ── HTML escape helper ────────────────────────────────────────────────────────
const esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ── Convert stored markdown + @img tokens → plain crawlable HTML ─────────────
function markdownToNoscriptHtml(md) {
  if (!md) return ''
  return md
    // Strip image tokens (@img:ID and standard markdown images)
    .replace(/!\[[^\]]*\]\(@img:[^)]+\)/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // Markdown links → <a> tags (external open in new tab)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\[([^\]]+)\]\((\/[^)]*)\)/g, '<a href="$2">$1</a>')
    // ATX headings
    .replace(/^#{4,6}\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Unordered list items
    .replace(/^[-*+]\s+(.+)$/gm, '<li>$1</li>')
    // Ordered list items
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Blockquote
    .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
    // Horizontal rule
    .replace(/^[-*_]{3,}$/gm, '<hr>')
    // Wrap consecutive <li> runs in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    // Non-empty lines that aren't already block tags become paragraphs
    .replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>')
    // Collapse excess blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

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
            { fieldPath: 'publishedAt' }, { fieldPath: 'content' },
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
        content:   f.content?.stringValue || '',
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
    description: 'Hire pre-vetted software engineers and DevOps specialists through OrtStrategy. React, Node.js, Python, AWS, Kubernetes. Matched within 48 hours. 98% client retention rate.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Hire Engineers — OrtStrategy',
      provider: { '@type': 'Organization', name: 'OrtStrategy', url: 'https://www.ortstrategy.com' },
      description: 'Pre-vetted software engineers and DevOps specialists matched to your team within 48 hours. React, Node.js, Python, AWS, Kubernetes and more. 98% client retention rate.',
      url: 'https://www.ortstrategy.com/hire-engineers',
      serviceType: 'Software Engineering Staffing',
      areaServed: 'Worldwide',
    },
    noscript: `<main>
      <h1>Hire Engineers Who Ship — OrtStrategy</h1>
      <p>Stop wasting months on bad hires. OrtStrategy gives you battle-tested engineers, vetted for skill, communication, and reliability. Pre-vetted software engineers matched to your team within 48 hours. 98% client retention rate.</p>
      <h2>How It Works</h2>
      <ol>
        <li><strong>Tell Us What You Need</strong> — Share your tech stack, team size, timezone, and engagement type. Takes 5 minutes.</li>
        <li><strong>Meet Your Matches</strong> — Within 48 hours we present pre-vetted engineers that fit your exact requirements. No wasted interviews.</li>
        <li><strong>Trial &amp; Onboard</strong> — Start with a paid trial week. If it is not a fit, we replace at no cost. Zero risk.</li>
      </ol>
      <h2>Engagement Types</h2>
      <ul>
        <li><strong>Part-Time</strong> — 20 hrs/week, dedicated engineer</li>
        <li><strong>Full-Time</strong> — Senior engineer embedded in your team, working your hours, in your timezone</li>
        <li><strong>Team</strong> — Full engineering squad for complex products</li>
      </ul>
      <h2>Tech Stacks</h2>
      <p>Our engineers cover the full modern stack: React, React Native, Node.js, Python, Go, AWS, Google Cloud, Kubernetes, Docker, Terraform, PostgreSQL, MongoDB, and more.</p>
      <h2>Hire Engineers Through OrtStrategy</h2>
      <p>Submit your requirements at ortstrategy.com/hire-engineers and we will match you with the right engineer within 48 hours.</p>
    </main>`,
  },
  {
    path: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'OrtStrategy Privacy Policy — how we collect, use, and protect your personal data. We are committed to transparency, security, and your right to privacy.',
    noscript: `<main>
      <h1>OrtStrategy Privacy Policy</h1>
      <p>OrtStrategy Tech Services is committed to protecting your privacy. This policy explains what personal data we collect, why we collect it, and how we protect it. We collect only the data necessary to provide our services — such as contact information submitted through our website forms — and we never sell your data to third parties. You have the right to access, correct, or request deletion of your data at any time by contacting us at contact@ortstrategy.com.</p>
    </main>`,
  },
  {
    path: 'terms-of-service',
    title: 'Terms of Service',
    description: 'OrtStrategy Terms of Service — the terms that govern your use of our website, platform, and engineering services.',
    noscript: `<main>
      <h1>OrtStrategy Terms of Service</h1>
      <p>These Terms of Service govern your access to and use of the OrtStrategy website and services. By using our platform, you agree to these terms. OrtStrategy provides technology strategy, DevOps consulting, system design, and software engineering services subject to these terms. We reserve the right to update these terms as our services evolve. Continued use of our services constitutes acceptance of any updates.</p>
    </main>`,
  },
  {
    path: 'work-policy',
    title: 'Work Policy',
    description: 'OrtStrategy Work Policy — our standards for delivery, communication, confidentiality, professionalism, and quality for all engineers and team members.',
    noscript: `<main>
      <h1>OrtStrategy Work Policy</h1>
      <p>OrtStrategy Tech Services operates as a remote-first, results-driven technology firm. This Work Policy sets out the standards expected of every member of the OrtStrategy network — employees, contractors, and placed engineers alike.</p>
      <h2>Delivery Over Presence</h2>
      <p>We measure performance by the quality and timeliness of output, not hours logged. Every team member is trusted to manage their own schedule provided commitments are met and clients are served to the highest standard.</p>
      <h2>Communication Standards</h2>
      <p>Clear and proactive communication is non-negotiable. All team members must be responsive within agreed hours, attend scheduled meetings prepared, proactively flag blockers before they become problems, and communicate professionally in all interactions.</p>
      <h2>Confidentiality</h2>
      <p>All client information, project details, and technical architecture encountered during any engagement must be treated as strictly confidential during the engagement and indefinitely after it concludes. Breach of confidentiality is grounds for immediate termination.</p>
      <h2>Professionalism and Quality</h2>
      <p>Every member is expected to conduct themselves with integrity, take ownership of their work, and deliver to the highest quality standard. We do not ship work we are not proud of.</p>
    </main>`,
  },
]

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('Pre-rendering routes...')
  const base = readFileSync(resolve(process.cwd(), 'dist/index.html'), 'utf8')

  // Static routes
  for (const route of STATIC_ROUTES) {
    let html = inject(base, {
      title: route.title,
      description: route.description,
      canonical: `${SITE}/${route.path}`,
      jsonLd: route.jsonLd,
    })
    // Inject noscript body content so Googlebot sees real text for snippet generation
    if (route.noscript) {
      html = html.replace('</body>', `\n  <noscript>\n    ${route.noscript}\n  </noscript>\n</body>`)
    }
    write(resolve(process.cwd(), `dist/${route.path}/index.html`), html)
    console.log(`  ✓ /${route.path}`)
  }

  // Blog posts
  const posts = await fetchPosts()
  for (const post of posts) {
    const canonical = `${SITE}/blog/${post.slug}`
    let html = inject(base, {
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
    const bodyHtml = markdownToNoscriptHtml(post.content)
    const noscript = `<noscript>
    <article>
      <h1>${esc(post.title)}</h1>
      ${post.category ? `<p><strong>Category:</strong> ${esc(post.category)}</p>` : ''}
      ${post.author ? `<p><strong>By</strong> ${esc(post.author)}${post.publishedAt ? ` · ${post.publishedAt}` : ''}</p>` : ''}
      ${post.excerpt ? `<p>${esc(post.excerpt)}</p>` : ''}
      ${bodyHtml}
    </article>
  </noscript>`
    html = html.replace('</body>', `\n  ${noscript}\n</body>`)
    write(resolve(process.cwd(), `dist/blog/${post.slug}/index.html`), html)
    console.log(`  ✓ /blog/${post.slug}`)
  }

  // Inject static content + links into the blog index so Googlebot has real
  // visible text to use as the search snippet and links to follow to posts.
  if (posts.length) {
    const blogIndexPath = resolve(process.cwd(), 'dist/blog/index.html')
    let blogHtml = readFileSync(blogIndexPath, 'utf8')

    // Visible intro paragraph Google can use as the search description
    const intro = `\n  <noscript>\n    <main>\n      <h1>OrtStrategy Blog — Engineering Insights &amp; Deep Dives</h1>\n      <p>Engineering insights, deep dives, and stories from the OrtStrategy team covering DevOps, cloud architecture, security consulting, system design, full stack development, and AI/ML. Written by practising engineers.</p>\n      <ul>\n${posts.map(p => `        <li><a href="${SITE}/blog/${p.slug}">${p.title}</a>${p.excerpt ? ` — ${p.excerpt}` : ''}</li>`).join('\n')}\n      </ul>\n    </main>\n  </noscript>`
    blogHtml = blogHtml.replace('</body>', `${intro}\n</body>`)
    write(blogIndexPath, blogHtml)
    console.log(`  ✓ injected ${posts.length} crawler links + description into /blog`)
  }

  console.log(`  Done — ${STATIC_ROUTES.length} static + ${posts.length} blog routes pre-rendered`)
}

run()
