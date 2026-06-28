const SITE = 'https://www.ortstrategy.com'
const DEFAULT_IMG = `${SITE}/og-image.png`
const DEFAULT_DESC = 'OrtStrategy delivers expert DevOps, system design, security consulting, and full stack engineering solutions. Scale your technology with confidence.'

function setTag(selector, attr, content) {
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const [key, val] = attr.split('=')
    el.setAttribute(key, val.replace(/"/g, ''))
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = url
}

function setJsonLd(data) {
  let el = document.querySelector('script[data-seo="ld"]')
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute('data-seo', 'ld')
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export function setSEO({ title, description, keywords, path, image, type = 'website', jsonLd } = {}) {
  const fullTitle = title ? `${title} | OrtStrategy` : 'OrtStrategy | Technology Strategy & Engineering'
  const desc = description || DEFAULT_DESC
  const url = `${SITE}${path || '/'}`
  const img = image || DEFAULT_IMG

  document.title = fullTitle

  setTag('meta[name="description"]',       'name=description',       desc)
  setTag('meta[name="robots"]',            'name=robots',            'index, follow')
  if (keywords) setTag('meta[name="keywords"]', 'name=keywords', keywords)

  setTag('meta[property="og:title"]',       'property=og:title',       fullTitle)
  setTag('meta[property="og:description"]', 'property=og:description', desc)
  setTag('meta[property="og:url"]',         'property=og:url',         url)
  setTag('meta[property="og:image"]',       'property=og:image',       img)
  setTag('meta[property="og:type"]',        'property=og:type',        type)

  setTag('meta[name="twitter:card"]',        'name=twitter:card',        'summary_large_image')
  setTag('meta[name="twitter:title"]',       'name=twitter:title',       fullTitle)
  setTag('meta[name="twitter:description"]', 'name=twitter:description', desc)
  setTag('meta[name="twitter:image"]',       'name=twitter:image',       img)

  setCanonical(url)

  if (jsonLd) setJsonLd(jsonLd)
}
