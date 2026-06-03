import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '../firebase'
import { FaArrowLeft, FaTwitter, FaLinkedin, FaLink } from 'react-icons/fa'
import BlogNavbar from '../components/BlogNavbar'
import BlogFooter from '../components/BlogFooter'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'
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

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function renderContent(content) {
  if (!content) return ''

  // Step 1: Extract code blocks and images into placeholders FIRST
  // so subsequent markdown transforms don't corrupt them
  const blocks = []
  let processed = content.replace(/```([\w+#.-]*)\n?([\s\S]*?)```/g, (_, rawLang, code) => {
    const lang = (rawLang || '').toLowerCase().trim()
    const prismLang = PRISM_ALIAS[lang] || lang
    const displayName = LANG_NAMES[lang] || (lang ? lang.toUpperCase() : 'CODE')
    const escaped = escapeHtml(code.trim())
    const html = `<div class="blog-code-wrap"><div class="blog-code-header"><span class="blog-code-lang">${displayName}</span></div><pre class="blog-code-block language-${prismLang || 'text'}"><code class="language-${prismLang || 'text'}">${escaped}</code></pre></div>`
    blocks.push(html)
    return `\x00BLOCK${blocks.length - 1}\x00`
  })

  // Extract inline images too
  processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    blocks.push(`<img class="blog-inline-img" src="${src}" alt="${escapeHtml(alt)}" />`)
    return `\x00BLOCK${blocks.length - 1}\x00`
  })

  // Step 2: Apply markdown transforms safely
  processed = processed
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
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

  // Step 3: Strip any <p> tags wrapping block-level placeholders
  processed = processed
    .replace(/<p>\s*(\x00BLOCK\d+\x00)\s*<\/p>/g, '$1')
    .replace(/<\/p>\s*(\x00BLOCK\d+\x00)/g, '</p>$1')
    .replace(/(\x00BLOCK\d+\x00)\s*<p>/g, '$1<p>')

  // Step 4: Restore code blocks and images
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

  useEffect(() => {
    ;(async () => {
      try {
        const q = query(collection(db,'posts'), where('slug','==',slug), limit(1))
        const snap = await getDocs(q)
        if (snap.empty) { navigate('/blog'); return }
        const data = { id: snap.docs[0].id, ...snap.docs[0].data() }
        setPost(data)
        // fetch related posts
        const rq = query(collection(db,'posts'), where('published','==',true), where('category','==',data.category), limit(3))
        const rsnap = await getDocs(rq)
        setRelated(rsnap.docs.map(d => ({ id:d.id, ...d.data() })).filter(p => p.slug !== slug))
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    })()
  }, [slug])

  // Syntax highlighting after post content renders
  useEffect(() => {
    if (!post) return
    const timer = setTimeout(() => {
      document.querySelectorAll('pre.blog-code-block code').forEach(block => {
        try { hljs.highlightElement(block) } catch(e) {}
      })
    }, 100)
    return () => clearTimeout(timer)
  }, [post])

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
                  <p className={styles.authorName}>{post.author?.name || 'Ort Strategy'}</p>
                  <p className={styles.authorRole}>{post.author?.role || 'Ort Strategy Team'}</p>
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
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
            )}
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
            />
          </motion.article>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
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
              <h2 className={styles.relatedTitle}>More from <span className={styles.grad}>Ort Strategy</span></h2>
              <div className={styles.relatedGrid}>
                {related.slice(0,2).map(p => (
                  <Link key={p.id} to={`/blog/${p.slug}`} className={styles.relatedCard}>
                    <div className={styles.relatedCover} style={{ background: GRADIENTS[p.title?.length % GRADIENTS.length] }} />
                    <div className={styles.relatedBody}>
                      <span className={styles.relatedCat}>{p.category}</span>
                      <h3>{p.title}</h3>
                      <p>{p.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
      <BlogFooter />
    </>
  )
}
