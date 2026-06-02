import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '../firebase'
import { FaArrowLeft, FaTwitter, FaLinkedin, FaLink } from 'react-icons/fa'
import BlogNavbar from '../components/BlogNavbar'
import BlogFooter from '../components/BlogFooter'
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

function renderContent(content) {
  if (!content) return ''
  return content
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
    .replace(/^(?!<[hublc])/gm, '<p>')
    .replace(/(?<![>])$/gm, '</p>')
    .replace(/<p><\/p>/g, '')
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
