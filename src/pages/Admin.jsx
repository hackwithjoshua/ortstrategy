import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, getDocs, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { FaPlus, FaEdit, FaTrash, FaEye, FaSignOutAlt, FaCheck, FaTimes,
  FaBold, FaItalic, FaHeading, FaListUl, FaListOl, FaQuoteRight, FaCode, FaImage } from 'react-icons/fa'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import ortLogo from '../assets/ort-logo.svg'
import styles from './Admin.module.css'

// ── Image compressor ──
function compressImage(file, maxWidth=1200, quality=0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, maxWidth / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

// ── Markdown toolbar ──
const TOOLBAR = [
  { icon: FaHeading, label: 'H2', wrap: '## ', block: true },
  { icon: FaHeading, label: 'H3', wrap: '### ', block: true, small: true },
  { icon: FaBold,    label: 'Bold',   wrap: '**' },
  { icon: FaItalic,  label: 'Italic', wrap: '*' },
  { icon: FaCode,    label: 'Inline Code', wrap: '`' },
  { icon: FaQuoteRight, label: 'Quote', wrap: '> ', block: true },
  { icon: FaListUl,  label: 'List',   wrap: '- ', block: true },
  { icon: FaListOl,  label: 'Numbered', wrap: '1. ', block: true },
]

function MarkdownEditor({ value, onChange }) {
  const ref = useRef(null)
  const imgInputRef = useRef(null)
  const [preview, setPreview] = useState(false)
  const [hasSelection, setHasSelection] = useState(false)
  const [grammar, setGrammar] = useState([])
  const [grammarOpen, setGrammarOpen] = useState(false)
  const [checking, setChecking] = useState(false)
  const [insertingImg, setInsertingImg] = useState(false)
  const grammarTimer = useRef(null)

  // ── Track selection ──
  const handleSelect = () => {
    const ta = ref.current
    if (!ta) return
    setHasSelection(ta.selectionStart !== ta.selectionEnd)
  }

  // ── Toggle inline wrap (bold/italic/code) ──
  const toggleWrap = (wrap) => {
    const ta = ref.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = value.slice(start, end)
    if (!selected) return

    // Check if selected text itself is wrapped: **text**
    const innerWrapped = selected.startsWith(wrap) && selected.endsWith(wrap) && selected.length > wrap.length * 2
    // Check if surrounding context is wrapped: |**text**|
    const outerWrapped = value.slice(start - wrap.length, start) === wrap && value.slice(end, end + wrap.length) === wrap

    let newText, newStart, newEnd
    if (innerWrapped) {
      const unwrapped = selected.slice(wrap.length, selected.length - wrap.length)
      newText = value.slice(0, start) + unwrapped + value.slice(end)
      newStart = start; newEnd = start + unwrapped.length
    } else if (outerWrapped) {
      newText = value.slice(0, start - wrap.length) + selected + value.slice(end + wrap.length)
      newStart = start - wrap.length; newEnd = newStart + selected.length
    } else {
      newText = value.slice(0, start) + wrap + selected + wrap + value.slice(end)
      newStart = start + wrap.length; newEnd = newStart + selected.length
    }
    onChange(newText)
    setTimeout(() => { ta.focus(); ta.selectionStart = newStart; ta.selectionEnd = newEnd }, 10)
  }

  // ── Toggle block prefix (H2, H3, quote, list) ──
  const togglePrefix = (prefix) => {
    const ta = ref.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    if (start === end) return
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const lineEnd = value.indexOf('\n', end - 1)
    const block = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd)
    const isOn = block.split('\n').every(l => l.startsWith(prefix))
    const toggled = block.split('\n').map(l => isOn ? l.slice(prefix.length) : prefix + l).join('\n')
    const newText = value.slice(0, lineStart) + toggled + (lineEnd === -1 ? '' : value.slice(lineEnd))
    onChange(newText)
    setTimeout(() => { ta.focus() }, 10)
  }

  const handleToolbar = (btn) => {
    if (btn.block) togglePrefix(btn.wrap)
    else toggleWrap(btn.wrap)
  }

  // ── Insert code block at cursor ──
  const insertCodeBlock = () => {
    const ta = ref.current
    if (!ta) return
    const pos = ta.selectionStart
    const snippet = '\n\`\`\`\npaste your code here\n\`\`\`\n'
    const newText = value.slice(0, pos) + snippet + value.slice(pos)
    onChange(newText)
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = pos + 5 }, 10)
  }

  // ── Insert inline image at cursor — compress hard to keep doc small ──
  const handleInlineImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setInsertingImg(true)
    try {
      const dataUrl = await compressImage(file, 1200, 0.88)
      const ta = ref.current
      const pos = ta ? ta.selectionStart : value.length
      const label = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      const snippet = `\n![${label}](${dataUrl})\n`
      onChange(value.slice(0, pos) + snippet + value.slice(pos))
      setPreview(true) // auto-switch to preview so user sees the image immediately
    } finally {
      setInsertingImg(false)
      e.target.value = ''
    }
  }

  // ── Keyboard shortcuts ──
  const handleKeyDown = (e) => {
    const mod = e.metaKey || e.ctrlKey
    if (!mod) return
    if (e.key === 'b') { e.preventDefault(); toggleWrap('**') }
    if (e.key === 'i') { e.preventDefault(); toggleWrap('*') }
    if (e.key === 'k') { e.preventDefault(); toggleWrap('`') }
  }

  // ── Grammar check via LanguageTool free API ──
  const stripMd = (md) => md
    .replace(/^#{1,6}\s/gm,'').replace(/\*\*(.+?)\*\*/g,'$1')
    .replace(/\*(.+?)\*/g,'$1').replace(/`(.+?)`/g,'$1')
    .replace(/^[-*]\s/gm,'').replace(/^>\s/gm,'')

  const checkGrammar = async (text) => {
    if (!text?.trim() || text.trim().length < 20) { setGrammar([]); return }
    setChecking(true)
    try {
      const body = new URLSearchParams({ text: stripMd(text), language: 'en-US', enabledOnly: 'false' })
      const res = await fetch('https://api.languagetool.org/v2/check', { method:'POST', body })
      const data = await res.json()
      setGrammar(data.matches?.filter(m => m.replacements?.length > 0) || [])
    } catch(e) { /* silent */ }
    finally { setChecking(false) }
  }

  const handleChange = (e) => {
    const v = e.target.value
    onChange(v)
    clearTimeout(grammarTimer.current)
    grammarTimer.current = setTimeout(() => checkGrammar(v), 2000)
  }

  // Apply a grammar fix
  const applyFix = (match) => {
    const fix = match.replacements[0]?.value
    if (!fix) return
    // Re-strip text to find real offset in original
    const plain = stripMd(value)
    const errorStr = plain.slice(match.offset, match.offset + match.length)
    onChange(value.replace(errorStr, fix))
    setGrammar(prev => prev.filter(m => m !== match))
  }

  const renderMd = (md) => (md || '')
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre class="md-code-block"><code>$1</code></pre>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img class="md-inline-img" src="$2" alt="$1" />')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code>$1</code>')
    .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/\n\n/g,'</p><p>')

  const grammarCount = grammar.length
  const errType = (m) => {
    const id = m.rule?.category?.id || ''
    if (id.includes('PUNCT') || id.includes('COMMA')) return 'punct'
    if (id.includes('SPELL') || id.includes('TYPO')) return 'spell'
    return 'grammar'
  }
  const TYPE_COLOR = { punct:'#f59e0b', spell:'#ef4444', grammar:'#8b5cf6' }
  const TYPE_LABEL = { punct:'Punctuation', spell:'Spelling', grammar:'Grammar' }

  return (
    <div className={styles.mdEditor}>
      {/* Toolbar */}
      <div className={styles.mdToolbar}>
        {TOOLBAR.map(btn => (
          <button
            key={btn.label}
            type="button"
            className={`${styles.toolbarBtn} ${!hasSelection ? styles.toolbarDisabled : ''}`}
            onClick={() => handleToolbar(btn)}
            title={hasSelection ? `${btn.label} (toggle)` : 'Select text first'}
          >
            <btn.icon style={{ fontSize: btn.small ? '0.65rem' : '0.8rem' }} />
            <span>{btn.label}</span>
          </button>
        ))}
        <div className={styles.toolbarSep} />
        <span className={styles.toolbarHint}>{hasSelection ? 'Click to toggle' : 'Select text'}</span>
        <div className={styles.toolbarSep} />
        {/* Code block — always available */}
        <button type="button" className={styles.toolbarBtn} onClick={insertCodeBlock} title="Insert code block">
          <FaCode style={{ fontSize:'0.8rem' }}/><span>Code Block</span>
        </button>
        {/* Inline image insert */}
        <input ref={imgInputRef} type="file" accept="image/*" onChange={handleInlineImage} style={{ display:'none' }}/>
        <button type="button" className={styles.toolbarBtn} onClick={() => imgInputRef.current?.click()} disabled={insertingImg} title="Insert image">
          <FaImage style={{ fontSize:'0.8rem' }}/><span>{insertingImg ? 'Compressing...' : 'Image'}</span>
        </button>
        <div style={{ marginLeft:'auto', display:'flex', gap:'6px', alignItems:'center' }}>
          {grammarCount > 0 && (
            <button
              type="button"
              className={`${styles.toolbarBtn} ${grammarOpen ? styles.toolbarActive : ''}`}
              onClick={() => setGrammarOpen(o => !o)}
              style={{ color: grammarOpen ? '#f59e0b' : '#f59e0b', gap:'5px' }}
            >
              ⚠️ <span>{grammarCount} issue{grammarCount > 1 ? 's' : ''}</span>
            </button>
          )}
          {checking && <span className={styles.toolbarHint}>Checking...</span>}
          <button type="button" className={`${styles.toolbarBtn} ${preview ? styles.toolbarActive : ''}`} onClick={() => setPreview(p => !p)}>
            <FaEye style={{ fontSize: '0.8rem' }} /><span>Preview</span>
          </button>
        </div>
      </div>

      {/* Grammar panel */}
      {grammarOpen && grammarCount > 0 && (
        <div className={styles.grammarPanel}>
          <p className={styles.grammarTitle}>Grammar & Style Suggestions</p>
          {grammar.map((m, i) => {
            const type = errType(m)
            const color = TYPE_COLOR[type]
            return (
              <div key={i} className={styles.grammarItem}>
                <span className={styles.grammarType} style={{ background:`${color}20`, color }}>{TYPE_LABEL[type]}</span>
                <div className={styles.grammarBody}>
                  <p className={styles.grammarMsg}>{m.message}</p>
                  <p className={styles.grammarContext}>
                    <span className={styles.grammarError}>"{m.context?.text?.slice(m.context.offset, m.context.offset + m.context.length)}"</span>
                    {m.replacements?.[0]?.value && (
                      <span> → <strong>{m.replacements[0].value}</strong></span>
                    )}
                  </p>
                </div>
                {m.replacements?.[0]?.value && (
                  <button type="button" className={styles.grammarFix} onClick={() => applyFix(m)}>Fix</button>
                )}
                <button type="button" className={styles.grammarDismiss} onClick={() => setGrammar(prev => prev.filter((_,j) => j !== i))}>✕</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Editor / Preview */}
      {preview ? (
        <div className={styles.mdPreview} dangerouslySetInnerHTML={{ __html: renderMd(value) }} />
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={handleChange}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          onKeyUp={handleSelect}
          onMouseUp={handleSelect}
          placeholder={'Start writing...\n\n## H2 heading  |  ### H3 heading\n\nHighlight text, then click Bold/Italic or use:\nCmd+B = bold   Cmd+I = italic   Cmd+K = code\n\n(Grammar suggestions appear automatically after you stop typing)'}
          rows={22}
          className={styles.contentArea}
          spellCheck={true}
        />
      )}
    </div>
  )
}

const CATEGORIES = ['DevOps','System Design','Security','Full Stack','Data Engineering','Company']

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
}

function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setErr('')
    try { await login(email, pass) }
    catch { setErr('Invalid email or password.') }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginOrbs}/>
      <motion.div className={styles.loginCard} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
        <img src={ortLogo} alt="ORT Strategy" className={styles.loginLogo}/>
        <h2 className={styles.loginTitle}>Admin Login</h2>
        <p className={styles.loginSub}>Sign in to manage blog posts</p>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@ortstrategy.com" required/>
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" required/>
          </div>
          {err && <p className={styles.loginErr}>{err}</p>}
          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? <span className={styles.btnSpinner}/> : 'Sign In'}
          </button>
        </form>
        <Link to="/" className={styles.loginBack}>← Back to site</Link>
      </motion.div>
    </div>
  )
}

function PostEditor({ post, onSave, onCancel }) {
  const { user } = useAuth()
  const imgRef = useRef(null)
  const [form, setForm] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    category: post?.category || 'Engineering',
    tags: post?.tags?.join(', ') || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    coverImage: post?.coverImage || '',
    published: post?.published ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const compressed = await compressImage(file, 1200, 0.8)
      set('coverImage', compressed)
    } finally { setUploading(false) }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleTitleChange = v => {
    set('title', v)
    if (!post) set('slug', slugify(v))
  }

  const handleSave = async () => {
    if (!form.title || !form.content) return
    setSaving(true)
    try {
      const data = {
        ...form,
        tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
        author: { name: user.displayName || 'Ort Strategy', email: user.email },
        updatedAt: serverTimestamp(),
      }
      if (!post) {
        data.publishedAt = serverTimestamp()
        await addDoc(collection(db,'posts'), data)
      } else {
        if (form.published && !post.published) data.publishedAt = serverTimestamp()
        await updateDoc(doc(db,'posts',post.id), data)
      }
      onSave()
    } catch(e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div className={styles.editor}>
      <div className={styles.editorHeader}>
        <h2>{post ? 'Edit Post' : 'New Post'}</h2>
        <div className={styles.editorActions}>
          <div className={styles.statusPill} style={{ background: form.published ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)', border: form.published ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-card)', color: form.published ? '#10b981' : 'var(--text-muted)' }}>
            <span className={styles.statusDot} style={{ background: form.published ? '#10b981' : 'rgba(255,255,255,0.3)', boxShadow: form.published ? '0 0 6px #10b981' : 'none' }} />
            {form.published ? 'Live' : 'Draft'}
          </div>
          <button
            className={form.published ? styles.unpublishBtn : styles.publishBtn}
            onClick={() => set('published', !form.published)}
            type="button"
          >
            {form.published ? 'Set as Draft' : '🚀 Publish'}
          </button>
          <button className={styles.cancelBtn} onClick={onCancel}><FaTimes/> Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? <span className={styles.btnSpinner}/> : <><FaCheck/> Save</>}
          </button>
        </div>
      </div>

      <div className={styles.editorGrid}>
        <div className={styles.editorMain}>
          <div className={styles.field}>
            <label>Title *</label>
            <input value={form.title} onChange={e=>handleTitleChange(e.target.value)} placeholder="Post title..."/>
          </div>
          <div className={styles.field}>
            <label>Content *</label>
            <MarkdownEditor value={form.content} onChange={v => set('content', v)} />
          </div>
        </div>

        <div className={styles.editorSide}>
          <div className={styles.sideSection}>
            <label>URL Slug</label>
            <input value={form.slug} onChange={e=>set('slug',e.target.value)} placeholder="post-url-slug"/>
          </div>
          <div className={styles.sideSection}>
            <label>Category</label>
            <select value={form.category} onChange={e=>set('category',e.target.value)}>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className={styles.sideSection}>
            <label>Tags <span className={styles.hint}>(comma separated)</span></label>
            <input value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="React, DevOps, Cloud"/>
          </div>
          <div className={styles.sideSection}>
            <label>Excerpt</label>
            <textarea value={form.excerpt} onChange={e=>set('excerpt',e.target.value)} placeholder="Short description shown in blog listing..." rows={3}/>
          </div>
          <div className={styles.sideSection}>
            <label>Cover Image</label>
            <input ref={imgRef} type="file" accept="image/*" onChange={handleImageUpload} className={styles.fileInput} />
            <button type="button" className={styles.uploadBtn} onClick={() => imgRef.current?.click()} disabled={uploading}>
              <FaImage /> {uploading ? 'Compressing...' : form.coverImage ? 'Change Image' : 'Upload Image'}
            </button>
            {form.coverImage && (
              <div className={styles.imagePreviewWrap}>
                <img src={form.coverImage} alt="cover preview" className={styles.imagePreview} />
                <button type="button" className={styles.removeImg} onClick={() => set('coverImage','')}>
                  <FaTimes /> Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminThemeToggle() {
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'
  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.93 }}
      style={{
        width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
        background: 'var(--bg-card)', border: '1px solid var(--border-card)',
        color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem', transition: 'all 0.2s',
      }}
      title="Toggle theme"
    >
      {isLight ? <FiMoon /> : <FiSun />}
    </motion.button>
  )
}

export default function Admin() {
  const { user, loading: authLoading, logout, isSuperAdmin } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)

  if (authLoading) return <div className={styles.page}><div className={styles.loadWrap}><div className={styles.spinner}/></div></div>
  if (!user) return <LoginPage/>

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const q = query(collection(db,'posts'), orderBy('publishedAt','desc'))
      const snap = await getDocs(q)
      setPosts(snap.docs.map(d=>({id:d.id,...d.data()})))
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user) fetchPosts() }, [user])

  const handleTogglePublish = async (post) => {
    await updateDoc(doc(db,'posts',post.id), {
      published: !post.published,
      ...((!post.published) ? { publishedAt: serverTimestamp() } : {})
    })
    fetchPosts()
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this post?')) return
    await deleteDoc(doc(db,'posts',id))
    fetchPosts()
  }

  const formatDate = ts => {
    if (!ts) return 'Draft'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
  }

  if (creating || editing) {
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <img src={ortLogo} alt="ORT Strategy" className={styles.barLogo}/>
          <button className={styles.logoutBtn} onClick={logout}><FaSignOutAlt/> Logout</button>
        </div>
        <PostEditor
          post={editing || null}
          onSave={() => { setEditing(null); setCreating(false); fetchPosts() }}
          onCancel={() => { setEditing(null); setCreating(false) }}
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.barLeft}>
          <img src={ortLogo} alt="ORT Strategy" className={styles.barLogo}/>
          <span className={styles.barTitle}>Blog Admin</span>
        </div>
        <div className={styles.barRight}>
          <span className={styles.userEmail}>{user.email}</span>
          <AdminThemeToggle />
          <Link to="/blog" className={styles.viewSiteBtn}><FaEye/> View Blog</Link>
          <button className={styles.logoutBtn} onClick={logout}><FaSignOutAlt/> Logout</button>
        </div>
      </div>

      <div className={styles.dashboard}>
        <div className={styles.dashHeader}>
          <div>
            <h1 className={styles.dashTitle}>Posts</h1>
            <p className={styles.dashSub}>{posts.length} total · {posts.filter(p=>p.published).length} published</p>
          </div>
          <button className={styles.newBtn} onClick={() => setCreating(true)}>
            <FaPlus/> New Post
          </button>
        </div>

        {loading ? (
          <div className={styles.loadWrap}><div className={styles.spinner}/></div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyDash}>
            <span>✍️</span>
            <h3>No posts yet</h3>
            <p>Create your first post to get started.</p>
            <button className={styles.newBtn} onClick={() => setCreating(true)}><FaPlus/> Create Post</button>
          </div>
        ) : (
          <div className={styles.postList}>
            {posts.map(post => (
              <motion.div key={post.id} className={styles.postRow} layout initial={{opacity:0}} animate={{opacity:1}}>
                <div className={styles.postInfo}>
                  <div className={styles.postStatus}>
                    <span className={`${styles.statusDot} ${post.published?styles.live:styles.draft}`}/>
                    <span className={styles.statusText}>{post.published ? 'Live' : 'Draft'}</span>
                  </div>
                  <div>
                    <p className={styles.postTitle}>{post.title}</p>
                    <p className={styles.postMeta}>{post.category} · {formatDate(post.publishedAt)}</p>
                  </div>
                </div>
                <div className={styles.postActions}>
                  <Link to={`/blog/${post.slug}`} className={styles.actionBtn} title="Preview"><FaEye/></Link>
                  <button className={styles.actionBtn} onClick={() => setEditing(post)} title="Edit"><FaEdit/></button>
                  <button
                    className={`${styles.actionBtn} ${post.published ? styles.unpublishActionBtn : styles.publishActionBtn}`}
                    onClick={() => handleTogglePublish(post)}
                    title={post.published ? 'Unpublish' : 'Publish'}
                  >
                    {post.published ? '⏸' : '🚀'}
                  </button>
                  {isSuperAdmin && (
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(post.id)} title="Delete"><FaTrash/></button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
