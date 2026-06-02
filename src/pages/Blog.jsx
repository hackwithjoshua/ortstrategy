import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import BlogNavbar from '../components/BlogNavbar'
import BlogFooter from '../components/BlogFooter'
import styles from './Blog.module.css'

const GRADIENTS = [
  'linear-gradient(135deg,#1d6bf3 0%,#00c8ff 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#c084fc 100%)',
  'linear-gradient(135deg,#10b981 0%,#34d399 100%)',
  'linear-gradient(135deg,#f97316 0%,#fbbf24 100%)',
  'linear-gradient(135deg,#ef4444 0%,#f87171 100%)',
  'linear-gradient(135deg,#0ea5e9 0%,#38bdf8 100%)',
]

const CAT_COLORS = {
  DevOps:'#1d6bf3', Security:'#7c3aed', 'System Design':'#00c8ff',
  'Full Stack':'#10b981', 'Data Engineering':'#f97316', Company:'#f59e0b',
}

const readTime = content => Math.max(1, Math.ceil((content?.split(' ').length || 0) / 200))

const formatDate = ts => {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function FeaturedCard({ post }) {
  const gradient = GRADIENTS[0]
  const color = CAT_COLORS[post.category] || '#1d6bf3'
  return (
    <motion.article
      className={styles.featuredCard}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Link to={`/blog/${post.slug}`} className={styles.featuredLink}>
        <div className={styles.featuredCover} style={{ background: post.coverImage ? `url(${post.coverImage}) center/cover` : gradient }}>
          <div className={styles.featuredOverlay} />
          <div className={styles.featuredMeta}>
            <span className={styles.catPill} style={{ background:`${color}25`, color, border:`1px solid ${color}50` }}>
              {post.category || 'Engineering'}
            </span>
            <span className={styles.featuredLabel}>Featured Post</span>
          </div>
          <div className={styles.featuredText}>
            <h2 className={styles.featuredTitle}>{post.title}</h2>
            <p className={styles.featuredExcerpt}>{post.excerpt}</p>
            <div className={styles.featuredAuthor}>
              <div className={styles.avatar} style={{ background: gradient }}>
                {post.author?.name?.[0]?.toUpperCase() || 'O'}
              </div>
              <span>{post.author?.name || 'Ort Strategy'}</span>
              <span className={styles.sep}>·</span>
              <span>{formatDate(post.publishedAt)}</span>
              <span className={styles.sep}>·</span>
              <span>{readTime(post.content)} min read</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

function PostCard({ post, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const gradient = GRADIENTS[i % GRADIENTS.length]
  const color = CAT_COLORS[post.category] || '#1d6bf3'
  return (
    <motion.article
      ref={ref}
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: (i % 3) * 0.08, duration: 0.5 }}
    >
      <Link to={`/blog/${post.slug}`} className={styles.cardLink}>
        <div className={styles.cardCover} style={{ background: post.coverImage ? `url(${post.coverImage}) center/cover` : gradient }}>
          <span className={styles.catPill} style={{ background:`${color}22`, color, border:`1px solid ${color}44` }}>
            {post.category || 'Engineering'}
          </span>
        </div>
        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{post.title}</h3>
          <p className={styles.cardExcerpt}>{post.excerpt}</p>
          {post.tags?.length > 0 && (
            <div className={styles.tagRow}>
              {post.tags.slice(0,3).map(t => <span key={t} className={styles.tag}>{t}</span>)}
            </div>
          )}
          <div className={styles.cardMeta}>
            <div className={styles.authorWrap}>
              <div className={styles.avatarSm} style={{ background: gradient }}>
                {post.author?.name?.[0]?.toUpperCase() || 'O'}
              </div>
              <span className={styles.authorName}>{post.author?.name || 'Ort Strategy'}</span>
            </div>
            <div className={styles.metaRight}>
              <span>{formatDate(post.publishedAt)}</span>
              <span className={styles.sep}>·</span>
              <span>{readTime(post.content)} min</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('All')

  useEffect(() => {
    ;(async () => {
      try {
        const q = query(collection(db,'posts'), where('published','==',true))
        const snap = await getDocs(q)
        const data = snap.docs.map(d => ({ id:d.id, ...d.data() }))
        data.sort((a,b) => {
          const ta = a.publishedAt?.toDate?.() || new Date(0)
          const tb = b.publishedAt?.toDate?.() || new Date(0)
          return tb - ta
        })
        setPosts(data)
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    })()
  }, [])

  const cats = ['All', ...new Set(posts.map(p => p.category).filter(Boolean))]
  const visible = cat === 'All' ? posts : posts.filter(p => p.category === cat)
  const [featured, ...rest] = visible

  return (
    <div className={styles.page}>
      <BlogNavbar />
      <main className={styles.main}>

        {/* Hero strip */}
        <div className={styles.heroStrip}>
          <div className={styles.container}>
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity:0, y:20 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay:0.1, duration:0.5 }}
            >
              The Ort Strategy Blog
            </motion.h1>
            <motion.p
              className={styles.heroSub}
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              transition={{ delay:0.25 }}
            >
              Engineering insights, deep dives, and stories from the team.
            </motion.p>
          </div>
        </div>

        <div className={styles.container}>
          {/* Category filters */}
          {cats.length > 2 && (
            <div className={styles.filters}>
              {cats.map(c => (
                <button key={c} className={`${styles.filterBtn} ${cat===c?styles.active:''}`} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className={styles.center}><div className={styles.spinner}/></div>
          ) : visible.length === 0 ? (
            <div className={styles.empty}>
              <span>✍️</span>
              <h3>No posts yet</h3>
              <p>Great content is on its way.</p>
            </div>
          ) : (
            <>
              {featured && <FeaturedCard post={featured} />}
              {rest.length > 0 && (
                <div className={styles.grid}>
                  {rest.map((p, i) => <PostCard key={p.id} post={p} i={i} />)}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <BlogFooter />
    </div>
  )
}
