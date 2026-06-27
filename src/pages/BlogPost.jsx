import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '../firebase'
import { FaArrowLeft, FaTwitter, FaLinkedin, FaLink } from 'react-icons/fa'
import BlogNavbar from '../components/BlogNavbar'
import BlogFooter from '../components/BlogFooter'
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/vs2015.css'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import java from 'highlight.js/lib/languages/java'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import dockerfile from 'highlight.js/lib/languages/dockerfile'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('java', java)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.configure({ ignoreUnescapedHTML: true })
import styles from './BlogPost.module.css'

const GRADIENTS = [
  'linear-gradient(135deg,#1d6bf3 0%,#00c8ff 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#c084fc 100%)',
  'linear-gradient(135deg,#10b981 0%,#34d399 100%)',
  'linear-gradient(135deg,#f97316 0%,#fbbf24 100%)',
]

const CAT_COLORS = {
  DevOps:'#1d6bf3', Security:'#7c3aed', 'System Design':'#00c8ff',
  'Full Stack':'#10b981', 'Data Engineering':'#f97316', Company:'#f59e0b',
}

const readTime = content => Math.max(1, Math.ceil((content?.split(' ').length || 0) / 200))

const formatDate = ts => {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })
}

const LANG_NAMES = {
  py:'Python', python:'Python', js:'JavaScript', javascript:'JavaScript',
  ts:'TypeScript', typescript:'TypeScript', jsx:'JSX', tsx:'TSX',
  java:'Java', cpp:'C++', 'c++':'C++', c:'C', cs:'C#', csharp:'C#',
  go:'Go', rust:'Rust', rs:'Rust', kotlin:'Kotlin', kt:'Kotlin',
  swift:'Swift', php:'PHP', ruby:'Ruby', rb:'Ruby',
  bash:'Shell', sh:'Shell', shell:'Shell', zsh:'Shell',
  html:'HTML', xml:'XML', css:'CSS', scss:'SCSS',
  sql:'SQL', json:'JSON', yaml:'YAML', yml:'YAML',
  docker:'Dockerfile', dockerfile:'Dockerfile',
  tf:'Terraform', hcl:'HCL', md:'Markdown',
}

const PRISM_ALIAS = {
  py:'python', js:'javascript', ts:'typescript', sh:'bash',
  shell:'bash', zsh:'bash', rs:'rust', kt:'kotlin', rb:'ruby',
  cs:'csharp', yml:'yaml', 'c++':'cpp', dockerfile:'docker',
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

function splitHtmlAtParagraph(html, n) {
  let count = 0, idx = 0
  while (count < n) {
    const next = html.indexOf('</p>', idx)
    if (next === -1) break
    idx = next + 4
    count++
  }
  return [html.slice(0, idx), html.slice(idx)]
}

function extractTOC(content) {
  if (!content) return []
  const out = []
  const re = /^(#{2,3})\s+(.+)$/gm
  let m
  while ((m = re.exec(content)) !== null) {
    const level = m[1].length
    const text = m[2].trim()
    out.push({ level, text, id: slugify(text) })
  }
  return out
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function renderContent(content) {
  if (!content) return ''

  const blocks = []
  let processed = content.replace(/```([\w+#.-]*)\n?([\s\S]*?)```/g, (_, rawLang, code) => {
    const lang = (rawLang || '').toLowerCase().trim()
    const prismLang = PRISM_ALIAS[lang] || lang
    const displayName = LANG_NAMES[lang] || (lang ? lang.toUpperCase() : 'CODE')
    const escaped = escapeHtml(code.trim())
    const html = `<div class="blog-code-wrap"><div class="blog-code-header"><span class="blog-code-lang">${displayName}</span><button class="blog-code-copy">Copy</button></div><pre class="blog-code-block language-${prismLang || 'text'}"><code class="language-${prismLang || 'text'}">${escaped}</code></pre></div>`
    blocks.push(html)
    return `\x00BLOCK${blocks.length - 1}\x00`
  })

  processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    blocks.push(`<img class="blog-inline-img" src="${src}" alt="${escapeHtml(alt)}" />`)
    return `\x00BLOCK${blocks.length - 1}\x00`
  })

  processed = processed
    .replace(/^### (.+)$/gm, (_, t) => `<h3 id="${slugify(t)}">${t}<a href="#${slugify(t)}" class="blog-heading-anchor">#</a></h3>`)
    .replace(/^## (.+)$/gm, (_, t) => `<h2 id="${slugify(t)}">${t}<a href="#${slugify(t)}" class="blog-heading-anchor">#</a></h2>`)
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hublcp\x00])/gm, '<p>')
    .replace(/(?<![>])$/gm, '</p>')
    .replace(/<p><\/p>/g, '')

  processed = processed
    .replace(/<p>\s*(\x00BLOCK\d+\x00)\s*<\/p>/g, '$1')
    .replace(/<\/p>\s*(\x00BLOCK\d+\x00)/g, '</p>$1')
    .replace(/(\x00BLOCK\d+\x00)\s*<p>/g, '$1<p>')

  processed = processed.replace(/\x00BLOCK(\d+)\x00/g, (_, i) => blocks[+i])

  return processed
}

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showBackTop, setShowBackTop] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [toc, setToc] = useState([])

  // Reading progress bar + back-to-top visibility
  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? (scrolled / total) * 100 : 0)
      setShowBackTop(scrolled > 500)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  // Fetch post + related
  useEffect(() => {
    ;(async () => {
      try {
        const q = query(collection(db,'posts'), where('slug','==',slug), limit(1))
        const snap = await getDocs(q)
        if (snap.empty) { navigate('/blog'); return }
        const data = { id: snap.docs[0].id, ...snap.docs[0].data() }
        setPost(data)
        setToc(extractTOC(data.content))
        const rq = query(collection(db,'posts'), where('published','==',true), where('category','==',data.category), limit(4))
        const rsnap = await getDocs(rq)
        setRelated(rsnap.docs.map(d => ({ id:d.id, ...d.data() })).filter(p => p.slug !== slug).slice(0, 3))
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    })()
  }, [slug])

  // Syntax highlight + copy button handlers
  useEffect(() => {
    if (!post) return
    const timer = setTimeout(() => {
      document.querySelectorAll('pre.blog-code-block code').forEach(block => {
        try { hljs.highlightElement(block) } catch(e) {}
      })
      document.querySelectorAll('.blog-code-copy').forEach(btn => {
        btn.onclick = () => {
          const pre = btn.closest('.blog-code-wrap')?.querySelector('pre')
          if (!pre) return
          navigator.clipboard.writeText(pre.textContent || '').then(() => {
            btn.textContent = 'Copied!'
            btn.classList.add('copied')
            setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied') }, 2000)
          }).catch(() => {})
        }
      })
    }, 100)
    return () => clearTimeout(timer)
  }, [post])

  // Active heading tracker for TOC
  useEffect(() => {
    if (!post || toc.length === 0) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-10% 0% -80% 0%', threshold: 0 }
    )
    toc.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [post, toc])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <>
      <BlogNavbar />
      <div className={styles.loadingWrap}><div className={styles.spinner}/></div>
    </>
  )
  if (!post) return null

  const gradient = GRADIENTS[post.title?.length % GRADIENTS.length] || GRADIENTS[0]
  const color = CAT_COLORS[post.category] || '#1d6bf3'
  const url = window.location.href

  return (
    <>
      <BlogNavbar />
      <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      <main className={styles.main}>

        {/* Hero */}
        <motion.section
          className={styles.hero}
          style={{ background: post.coverImage ? `url(${post.coverImage}) center/cover` : gradient }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <Link to="/blog" className={styles.back}>
              <FaArrowLeft /> Back to Blog
            </Link>
            <span className={styles.catBadge} style={{ color, background:`${color}25`, border:`1px solid ${color}50` }}>
              {post.category || 'Engineering'}
            </span>
            <h1 className={styles.heroTitle}>{post.title}</h1>
            <p className={styles.heroExcerpt}>{post.excerpt}</p>
            <div className={styles.heroMeta}>
              <div className={styles.author}>
                <div className={styles.avatar} style={{ background: gradient }}>
                  {post.author?.name?.[0]?.toUpperCase() || 'O'}
                </div>
                <div>
                  <p className={styles.authorName}>{post.author?.name || 'OrtStrategy'}</p>
                  <p className={styles.authorRole}>{post.author?.role || 'OrtStrategy Team'}</p>
                </div>
              </div>
              <div className={styles.heroMetaRight}>
                <span>{formatDate(post.publishedAt)}</span>
                <span className={styles.sep}>·</span>
                <span>{readTime(post.content)} min read</span>
              </div>
            </div>
          </div>
        </motion.section>

        <div className={styles.layout}>
          {/* Article */}
          <motion.article
            className={styles.article}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {post.tags?.length > 0 && (
              <div className={styles.tagRow}>
                {post.tags.map(t => (
                  <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`} className={styles.tag}>
                    {t}
                  </Link>
                ))}
              </div>
            )}

            {toc.length > 1 && (
              <div className={styles.mobileToc}>
                <p className={styles.mobileTocLabel}>On This Page</p>
                <nav className={styles.mobileTocNav}>
                  {toc.map(h => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`${styles.mobileTocLink} ${h.level === 3 ? styles.mobileTocSub : ''}`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {(() => {
              const [top, bottom] = splitHtmlAtParagraph(renderContent(post.content), 3)
              return (
                <>
                  <div className={styles.content} dangerouslySetInnerHTML={{ __html: top }} />
                  <div className={styles.readOtherWrap}>
                    <p className={styles.readOtherText}>Enjoying this? There's plenty more to read.</p>
                    <a
                      href="/blog"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.readOtherBtn}
                    >
                      Explore More Articles →
                    </a>
                  </div>
                  {bottom && <div className={styles.content} dangerouslySetInnerHTML={{ __html: bottom }} />}
                </>
              )
            })()}

            {/* Bottom share */}
            <div className={styles.bottomShare}>
              <p className={styles.bottomShareLabel}>Found this helpful? Share it.</p>
              <div className={styles.bottomShareBtns}>
                <a href={`https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className={`${styles.bottomShareBtn} ${styles.twitterBtn}`}>
                  <FaTwitter /> Share on Twitter
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={`${styles.bottomShareBtn} ${styles.linkedinBtn}`}>
                  <FaLinkedin /> Share on LinkedIn
                </a>
                <button className={`${styles.bottomShareBtn} ${copied ? styles.copiedBtn : styles.copyLinkBtn}`} onClick={copyLink}>
                  <FaLink /> {copied ? 'Link Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Author bio */}
            <div className={styles.authorBio}>
              <div className={styles.bioAvatar} style={{ background: gradient }}>
                {post.author?.name?.[0]?.toUpperCase() || 'O'}
              </div>
              <div className={styles.bioInfo}>
                <p className={styles.bioLabel}>Written by</p>
                <p className={styles.bioName}>{post.author?.name || 'OrtStrategy'}</p>
                <p className={styles.bioRole}>{post.author?.role || 'OrtStrategy Team'}</p>
              </div>
            </div>
          </motion.article>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            {toc.length > 1 && (
              <div className={`${styles.sideCard} ${styles.tocSideCard}`}>
                <p className={styles.sideLabel}>On This Page</p>
                <nav className={styles.toc}>
                  {toc.map(h => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`${styles.tocLink} ${h.level === 3 ? styles.tocSub : ''} ${activeId === h.id ? styles.tocActive : ''}`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            <div className={styles.sideCard}>
              <p className={styles.sideLabel}>Written by</p>
              <div className={styles.sideAuthor}>
                <div className={styles.sideAvatar} style={{ background: gradient }}>
                  {post.author?.name?.[0]?.toUpperCase() || 'O'}
                </div>
                <div>
                  <p className={styles.sideAuthorName}>{post.author?.name || 'Ort Strategy'}</p>
                  <p className={styles.sideAuthorRole}>{post.author?.role || 'Ort Strategy Team'}</p>
                </div>
              </div>
            </div>

            <div className={styles.sideCard}>
              <p className={styles.sideLabel}>Share</p>
              <div className={styles.shareRow}>
                <a href={`https://twitter.com/intent/tweet?url=${url}&text=${post.title}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn}>
                  <FaTwitter /> Twitter
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn}>
                  <FaLinkedin /> LinkedIn
                </a>
                <button className={styles.shareBtn} onClick={copyLink}>
                  <FaLink /> {copied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className={styles.related}>
            <div className={styles.relatedContainer}>
              <div className={styles.relatedHeader}>
                <h2 className={styles.relatedTitle}>Related <span className={styles.grad}>Articles</span></h2>
                <Link to="/blog" className={styles.relatedViewAll}>View all posts →</Link>
              </div>
              <div className={styles.relatedGrid}>
                {related.map((p, i) => {
                  const rGrad = GRADIENTS[p.title?.length % GRADIENTS.length]
                  const rColor = CAT_COLORS[p.category] || '#1d6bf3'
                  return (
                    <Link key={p.id} to={`/blog/${p.slug}`} className={styles.relatedCard}>
                      <div
                        className={styles.relatedCover}
                        style={{ background: p.coverImage ? `url(${p.coverImage}) center/cover no-repeat` : rGrad }}
                      >
                        <div className={styles.relatedCoverOverlay} />
                        <span className={styles.relatedCatBadge} style={{ background:`${rColor}28`, color: rColor, border:`1px solid ${rColor}55` }}>
                          {p.category}
                        </span>
                      </div>
                      <div className={styles.relatedBody}>
                        <h3 className={styles.relatedPostTitle}>{p.title}</h3>
                        {p.excerpt && <p className={styles.relatedExcerpt}>{p.excerpt}</p>}
                        <div className={styles.relatedMeta}>
                          <div className={styles.relatedAvatar} style={{ background: rGrad }}>
                            {p.author?.name?.[0]?.toUpperCase() || 'O'}
                          </div>
                          <span className={styles.relatedAuthorName}>{p.author?.name || 'Ort Strategy'}</span>
                          <span className={styles.relatedSep}>·</span>
                          <span className={styles.relatedReadTime}>{readTime(p.content)} min read</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}

      </main>
      <BlogFooter />

      {showBackTop && (
        <button
          className={styles.backTop}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </>
  )
}
