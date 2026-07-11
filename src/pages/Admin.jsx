import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, getDocs, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { FaPlus, FaEdit, FaTrash, FaEye, FaSignOutAlt, FaCheck, FaTimes,
  FaBold, FaItalic, FaHeading, FaListUl, FaListOl, FaQuoteRight, FaCode, FaImage,
  FaList, FaTh, FaSearch } from 'react-icons/fa'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import ortLogo from '../assets/ort-logo.png'
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

// ── Image token helpers ──────────────────────────────────────────────────────

// Replace base64 data URLs in markdown with short @img:ID tokens
function tokenizeImages(md) {
  const map = {}
  const tokenized = (md || '').replace(
    /!\[([^\]]*)\]\((data:[^)]*)\)/g,
    (_, alt, src) => {
      const id = Math.random().toString(36).slice(2, 10)
      map[id] = { src, alt }
      return `![${alt}](@img:${id})`
    }
  )
  return { tokenized, map }
}

// Expand @img:ID tokens back to full base64 markdown
function expandTokens(text, map) {
  return text.replace(
    /!\[([^\]]*)\]\(@img:([a-z0-9]+)\)/g,
    (_, alt, id) => (map[id] ? `![${alt}](${map[id].src})` : '')
  )
}

// Render tokenized markdown to HTML for the contentEditable display area
// Images become real <img> elements; everything else is plain text with <br> for newlines
function tokenizedToEditHtml(text, map) {
  const parts = (text || '').split(/(!\[[^\]]*\]\(@img:[a-z0-9]+\))/g)
  return parts.map(part => {
    const m = part.match(/!\[([^\]]*)\]\(@img:([a-z0-9]+)\)/)
    if (m) {
      const [, alt, id] = m
      const img = map[id]
      if (!img) return ''
      const esc = s => s.replace(/"/g, '&quot;')
      return `<img src="${img.src}" alt="${esc(alt)}" data-id="${id}" contenteditable="false" class="${styles.editorImg}" />`
    }
    return part
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
  }).join('')
}

// Read the contentEditable innerHTML back into tokenized markdown
function editHtmlToTokenized(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  let out = ''
  const walk = (node) => {
    if (node.nodeType === 3) {
      out += node.textContent
    } else if (node.nodeName === 'IMG') {
      const id = node.getAttribute('data-id')
      const alt = node.getAttribute('alt') || ''
      if (id) out += `\n![${alt}](@img:${id})\n`
    } else if (node.nodeName === 'BR') {
      out += '\n'
    } else {
      const isBlock = /^(DIV|P|H[1-6]|LI|BLOCKQUOTE)$/.test(node.nodeName)
      if (isBlock && out.length > 0 && !out.endsWith('\n')) out += '\n'
      for (const c of node.childNodes) walk(c)
    }
  }
  for (const c of div.childNodes) walk(c)
  return out.replace(/\n{3,}/g, '\n\n')
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

function MarkdownEditor({ value, onChange, onOpenLibrary }) {
  const editorRef = useRef(null)
  const imgMap = useRef({})
  const imgInputRef = useRef(null)
  const grammarTimer = useRef(null)
  const [preview, setPreview] = useState(false)
  const [hasSelection, setHasSelection] = useState(false)
  const [grammar, setGrammar] = useState([])
  const [grammarOpen, setGrammarOpen] = useState(false)
  const [checking, setChecking] = useState(false)
  const [insertingImg, setInsertingImg] = useState(false)

  // Initialize editor on mount — key prop on <MarkdownEditor> forces remount on post switch
  useEffect(() => {
    const { tokenized, map } = tokenizeImages(value || '')
    imgMap.current = map
    if (editorRef.current) {
      editorRef.current.innerHTML = tokenizedToEditHtml(tokenized, map)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Track text selection inside the editor
  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection()
      setHasSelection(!!(sel && !sel.isCollapsed && editorRef.current?.contains(sel.anchorNode)))
    }
    document.addEventListener('selectionchange', handler)
    return () => document.removeEventListener('selectionchange', handler)
  }, [])

  // Read the current tokenized content from the editor DOM
  const getTokenized = () => editorRef.current ? editHtmlToTokenized(editorRef.current.innerHTML) : ''

  // Sync to parent whenever editor content changes
  const handleInput = () => {
    const tokenized = getTokenized()
    const expanded = expandTokens(tokenized, imgMap.current)
    onChange(expanded)
    clearTimeout(grammarTimer.current)
    grammarTimer.current = setTimeout(() => checkGrammar(expanded), 2000)
  }

  // ── Toolbar: inline wrap (bold / italic / code) ──
  const toggleWrap = (wrap) => {
    const sel = window.getSelection()
    if (!sel?.rangeCount) return
    const selected = sel.toString()
    if (!selected) return
    const isWrapped = selected.startsWith(wrap) && selected.endsWith(wrap) && selected.length > wrap.length * 2
    document.execCommand('insertText', false, isWrapped ? selected.slice(wrap.length, -wrap.length) : `${wrap}${selected}${wrap}`)
  }

  // ── Toolbar: block prefix (heading / list / quote) ──
  const togglePrefix = (prefix) => {
    const sel = window.getSelection()
    if (!sel?.rangeCount) return
    const selected = sel.toString()
    if (!selected) return
    const lines = selected.split('\n')
    const allPrefixed = lines.every(l => l.startsWith(prefix))
    document.execCommand('insertText', false, allPrefixed ? lines.map(l => l.slice(prefix.length)).join('\n') : lines.map(l => prefix + l).join('\n'))
  }

  const handleToolbar = (btn) => {
    editorRef.current?.focus()
    if (btn.block) togglePrefix(btn.wrap)
    else toggleWrap(btn.wrap)
  }

  // ── Insert code block ──
  const insertCodeBlock = () => {
    editorRef.current?.focus()
    document.execCommand('insertText', false, '\n```\npaste your code here\n```\n')
  }

  // ── Insert image element at cursor position ──
  const insertImgAtCursor = (src, alt, id) => {
    imgMap.current[id] = { src, alt }
    editorRef.current?.focus()
    const sel = window.getSelection()
    const el = document.createElement('img')
    el.src = src
    el.alt = alt
    el.setAttribute('data-id', id)
    el.contentEditable = 'false'
    el.className = styles.editorImg
    if (sel?.rangeCount) {
      const range = sel.getRangeAt(0)
      range.deleteContents()
      range.insertNode(el)
      range.setStartAfter(el)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    } else {
      editorRef.current?.appendChild(el)
    }
    handleInput()
  }

  // ── Inline image from file upload ──
  const handleInlineImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setInsertingImg(true)
    try {
      const src = await compressImage(file, 1200, 0.88)
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      const id = Math.random().toString(36).slice(2, 10)
      insertImgAtCursor(src, alt, id)
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

  // ── Grammar check ──
  const stripMd = (md) => (md || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/^#{1,6}\s/gm,'').replace(/\*\*(.+?)\*\*/g,'$1')
    .replace(/\*(.+?)\*/g,'$1').replace(/`(.+?)`/g,'$1')
    .replace(/^[-*]\s/gm,'').replace(/^>\s/gm,'')

  const checkGrammar = async (text) => {
    const plain = stripMd(text)
    if (!plain?.trim() || plain.trim().length < 20) { setGrammar([]); return }
    setChecking(true)
    try {
      const body = new URLSearchParams({ text: plain, language: 'en-US', enabledOnly: 'false' })
      const res = await fetch('https://api.languagetool.org/v2/check', { method:'POST', body })
      const data = await res.json()
      setGrammar(data.matches?.filter(m => m.replacements?.length > 0) || [])
    } catch { /* silent */ }
    finally { setChecking(false) }
  }

  const applyFix = (match) => {
    const fix = match.replacements[0]?.value
    if (!fix) return
    const expanded = expandTokens(getTokenized(), imgMap.current)
    const plain = stripMd(expanded)
    const errorStr = plain.slice(match.offset, match.offset + match.length)
    if (!errorStr) return
    const newExpanded = expanded.replace(errorStr, fix)
    const { tokenized, map } = tokenizeImages(newExpanded)
    Object.assign(imgMap.current, map)
    if (editorRef.current) editorRef.current.innerHTML = tokenizedToEditHtml(tokenized, imgMap.current)
    onChange(newExpanded)
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
        <button type="button" className={styles.toolbarBtn} onClick={insertCodeBlock} title="Insert code block">
          <FaCode style={{ fontSize:'0.8rem' }}/><span>Code Block</span>
        </button>
        <input ref={imgInputRef} type="file" accept="image/*" onChange={handleInlineImage} style={{ display:'none' }}/>
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={() => {
            if (onOpenLibrary) {
              onOpenLibrary((src) => {
                const id = Math.random().toString(36).slice(2, 10)
                insertImgAtCursor(src, 'image', id)
              })
            } else {
              imgInputRef.current?.click()
            }
          }}
          disabled={insertingImg}
          title="Insert image"
        >
          <FaImage style={{ fontSize:'0.8rem' }}/><span>{insertingImg ? 'Compressing...' : 'Image'}</span>
        </button>
        <div style={{ marginLeft:'auto', display:'flex', gap:'6px', alignItems:'center' }}>
          {grammarCount > 0 && (
            <button
              type="button"
              className={`${styles.toolbarBtn} ${grammarOpen ? styles.toolbarActive : ''}`}
              onClick={() => setGrammarOpen(o => !o)}
              style={{ color:'#f59e0b', gap:'5px' }}
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

      {/* Editor area — always in DOM so content survives preview toggle */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={styles.contentArea}
        style={{ display: preview ? 'none' : undefined }}
        data-placeholder="Start writing...&#10;&#10;## H2 heading  |  ### H3 heading&#10;&#10;Select text then click Bold/Italic, or use Cmd+B / Cmd+I / Cmd+K"
        spellCheck
      />
      {preview && (
        <div className={styles.mdPreview} dangerouslySetInnerHTML={{ __html: renderMd(value) }} />
      )}
    </div>
  )
}

const CATEGORIES = [
  'DevOps','System Design','Security','Full Stack','Data Engineering',
  'AI & Machine Learning','Cloud & Infrastructure','Opinion',
  'Business & Strategy','Engineering Culture','Product','Mobile',
  'Open Source','Tutorial','Case Study','Company',
]

const GRADIENTS = [
  'linear-gradient(135deg,#1d6bf3 0%,#00c8ff 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#c084fc 100%)',
  'linear-gradient(135deg,#10b981 0%,#34d399 100%)',
  'linear-gradient(135deg,#f97316 0%,#fbbf24 100%)',
]

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

function ImageLibraryModal({ userEmail, onSelect, onClose }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      try {
        const q = query(collection(db, 'posts'), where('author.email', '==', userEmail))
        const snap = await getDocs(q)
        const imgs = []
        snap.docs.forEach(d => {
          const data = d.data()
          if (data.coverImage) imgs.push({ src: data.coverImage, label: data.title || 'Cover' })
          const re = /!\[([^\]]*)\]\((data:image[^)]+)\)/g
          let m
          while ((m = re.exec(data.content || '')) !== null) {
            imgs.push({ src: m[2], label: m[1] || 'Inline image' })
          }
        })
        const seen = new Set()
        setImages(imgs.reverse().filter(img => {
          const key = img.src.slice(0, 80)
          if (seen.has(key)) return false
          seen.add(key)
          return true
        }))
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    })()
  }, [userEmail])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await compressImage(file, 1200, 0.88)
      onSelect(dataUrl)
    } finally { setUploading(false); e.target.value = '' }
  }

  return (
    <div className={styles.libraryOverlay} onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.libraryModal}>
        <div className={styles.libraryHeader}>
          <div>
            <h3 className={styles.libraryTitle}>Image Library</h3>
            <p className={styles.librarySub}>Upload a new image or pick from previously uploaded ones</p>
          </div>
          <button type="button" className={styles.libraryClose} onClick={onClose}><FaTimes /></button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display:'none' }} />
        <button type="button" className={styles.libraryUploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
          <FaImage /> {uploading ? 'Uploading...' : 'Upload from System'}
        </button>

        <div className={styles.librarySectionWrap}>
          <p className={styles.librarySectionLabel}>Recently Uploaded</p>
          {loading ? (
            <div className={styles.libraryLoading}><div className={styles.spinner} /></div>
          ) : images.length === 0 ? (
            <p className={styles.libraryEmpty}>No images uploaded yet. Use the button above to upload one.</p>
          ) : (
            <div className={styles.libraryGrid}>
              {images.map((img, i) => (
                <button key={i} type="button" className={styles.libraryItem} onClick={() => onSelect(img.src)} title={img.label}>
                  <img src={img.src} alt={img.label} className={styles.libraryImg} />
                  <span className={styles.libraryItemLabel}>{img.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PostEditor({ post, onSave, onCancel }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    category: post?.category || 'Engineering',
    tags: post?.tags?.join(', ') || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    coverImage: post?.coverImage || '',
    published: post?.published ?? false,
    authorName: post?.author?.name || '',
  })
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState('')
  const [libraryCallback, setLibraryCallback] = useState(null)
  const isAuthor = !post || !post.author?.email || post.author?.email === user.email

  const openLibrary = (cb) => setLibraryCallback(() => cb)
  const closeLibrary = () => setLibraryCallback(null)
  const handleLibrarySelect = (url) => { libraryCallback(url); closeLibrary() }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleTitleChange = v => {
    set('title', v)
    if (!post) set('slug', slugify(v))
  }

  const handleSave = async () => {
    if (!form.title || !form.content) return
    setSaving(true)
    try {
      const { authorName, ...formData } = form
      const data = {
        ...formData,
        tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
        author: {
          name: authorName.trim() || user.displayName || 'OrtStrategy',
          role: 'OrtStrategy Team',
          email: post?.author?.email || user.email,
        },
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
    } catch(e) {
      console.error(e)
      setSaveErr(`Save failed: ${e.message}`)
    } finally { setSaving(false) }
  }

  return (
    <>
    <div className={styles.editor}>
      {saveErr && (
        <div className={styles.actionErrBanner}>
          {saveErr}
          <button onClick={() => setSaveErr('')} className={styles.actionErrClose}>×</button>
        </div>
      )}
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
            <MarkdownEditor key={post?.id || 'new'} value={form.content} onChange={v => set('content', v)} onOpenLibrary={openLibrary} />
          </div>
        </div>

        <div className={styles.editorSide}>
          <div className={styles.sideSection}>
            <label>Author Name {!isAuthor && <span className={styles.lockedHint}>— only the original author can change this</span>}</label>
            <input
              value={form.authorName}
              onChange={e => set('authorName', e.target.value)}
              placeholder={user.displayName || 'OrtStrategy'}
              disabled={!isAuthor}
              style={!isAuthor ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            />
          </div>

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
            <button type="button" className={styles.uploadBtn} onClick={() => openLibrary(url => set('coverImage', url))}>
              <FaImage /> {form.coverImage ? 'Change Image' : 'Upload Image'}
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

    {libraryCallback && (
      <ImageLibraryModal
        userEmail={user.email}
        onSelect={handleLibrarySelect}
        onClose={closeLibrary}
      />
    )}
  </>
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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function MobileBlock() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
      background: 'var(--bg-page)', padding: '32px 24px', textAlign: 'center',
    }}>
      <img src={ortLogo} alt="Ort Strategy" style={{ height: 64, filter: 'brightness(0) invert(1)' }} />
      <div style={{ fontSize: '3rem' }}>🖥️</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>
        Desktop Only
      </h2>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 300, margin: 0 }}>
        The admin panel is not available on mobile devices. Please use a tablet or desktop to manage blog posts.
      </p>
    </div>
  )
}

const PAGE_SIZES = { list: 15, grid: 9 }

export default function Admin() {
  const isMobile = useIsMobile()
  const { user, loading: authLoading, logout, isSuperAdmin } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [expandedTitle, setExpandedTitle] = useState(null)
  const [actionErr, setActionErr] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [tab, setTab] = useState('posts')
  const [authorFilter, setAuthorFilter] = useState(null)

  // Client-side search + optional author filter — no extra DB reads, always instant
  const filteredPosts = useMemo(() => {
    let result = authorFilter ? posts.filter(p => p.author?.email === authorFilter) : posts
    const q = search.trim().toLowerCase()
    if (!q) return result
    return result.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.excerpt?.toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    )
  }, [posts, search, authorFilter])

  // Reset to first page whenever search query, view mode, or author filter changes
  useEffect(() => { setPage(0) }, [search, viewMode, authorFilter])

  const pageSize = PAGE_SIZES[viewMode]
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize))
  const pagePosts = filteredPosts.slice(page * pageSize, (page + 1) * pageSize)

  // Author-level stats computed from posts already in memory — zero extra DB reads
  const authorStats = useMemo(() => {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const map = {}
    for (const post of posts) {
      const name = post.author?.name || 'Unknown'
      const email = post.author?.email || 'unknown'
      if (!map[email]) map[email] = { name, email, total: 0, thisMonth: 0, lastMonth: 0, published: 0, draft: 0 }
      map[email].total++
      if (post.published) map[email].published++; else map[email].draft++
      const pd = post.publishedAt?.toDate?.() || null
      if (pd) {
        if (pd >= thisMonthStart) map[email].thisMonth++
        else if (pd >= lastMonthStart) map[email].lastMonth++
      }
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [posts])

  // Published post counts for the last 6 months
  const monthlyStats = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const start = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1)
      return {
        label: start.toLocaleDateString('en-US', { month: 'short' }),
        count: posts.filter(p => { const pd = p.publishedAt?.toDate?.() || null; return pd && pd >= start && pd < end && p.published }).length,
      }
    })
  }, [posts])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db,'posts'))
      const data = snap.docs.map(d=>({id:d.id,...d.data()}))
      data.sort((a,b) => {
        const ta = a.publishedAt?.toDate?.() || new Date(0)
        const tb = b.publishedAt?.toDate?.() || new Date(0)
        return tb - ta
      })
      setPosts(data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user) fetchPosts() }, [user])

  if (isMobile) return <MobileBlock />
  if (authLoading) return <div className={styles.page}><div className={styles.loadWrap}><div className={styles.spinner}/></div></div>
  if (!user) return <LoginPage/>

  const handleTogglePublish = async (post) => {
    setActionErr('')
    try {
      await updateDoc(doc(db,'posts',post.id), {
        published: !post.published,
        ...((!post.published) ? { publishedAt: serverTimestamp() } : {})
      })
      fetchPosts()
    } catch(e) {
      console.error(e)
      setActionErr(`Could not ${post.published ? 'unpublish' : 'publish'} post: ${e.message}`)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this post?')) return
    try {
      await deleteDoc(doc(db,'posts',id))
      fetchPosts()
    } catch(e) {
      console.error(e)
      setActionErr(`Could not delete post: ${e.message}`)
    }
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
          <Link to="/blog" className={styles.viewSiteBtn} target="_blank" rel="noopener noreferrer"><FaEye/> View Blog</Link>
          <button className={styles.logoutBtn} onClick={logout}><FaSignOutAlt/> Logout</button>
        </div>
      </div>

      <div className={styles.dashboard}>
        {actionErr && (
          <div className={styles.actionErrBanner}>
            {actionErr}
            <button onClick={() => setActionErr('')} className={styles.actionErrClose}>×</button>
          </div>
        )}
        <div className={styles.dashHeader}>
          <div>
            <h1 className={styles.dashTitle}>{tab === 'insights' ? 'Insights' : 'Posts'}</h1>
            <p className={styles.dashSub}>
              {posts.length} total · {posts.filter(p=>p.published).length} published
              {authorFilter && <> · filtered by <strong>{authorStats.find(a=>a.email===authorFilter)?.name}</strong></>}
            </p>
          </div>
          <div className={styles.dashHeaderRight}>
            {tab === 'posts' && (
              <>
                <div className={styles.searchWrap}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    className={styles.searchInput}
                    placeholder="Search posts..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className={styles.searchClear} onClick={() => setSearch('')} title="Clear"><FaTimes /></button>
                  )}
                </div>
                <div className={styles.viewToggle}>
                  <button className={`${styles.viewToggleBtn} ${viewMode==='list'?styles.viewToggleActive:''}`} onClick={()=>setViewMode('list')} title="List view"><FaList/></button>
                  <button className={`${styles.viewToggleBtn} ${viewMode==='grid'?styles.viewToggleActive:''}`} onClick={()=>setViewMode('grid')} title="Grid view"><FaTh/></button>
                </div>
              </>
            )}
            <button className={styles.newBtn} onClick={() => setCreating(true)}>
              <FaPlus/> New Post
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className={styles.tabBar}>
          <button className={`${styles.tabBtn} ${tab==='posts'?styles.tabBtnActive:''}`} onClick={() => setTab('posts')}>
            Posts
          </button>
          <button className={`${styles.tabBtn} ${tab==='insights'?styles.tabBtnActive:''}`} onClick={() => setTab('insights')}>
            📊 Insights
          </button>
          {authorFilter && (
            <button className={styles.filterTag} onClick={() => setAuthorFilter(null)}>
              By: {authorStats.find(a=>a.email===authorFilter)?.name} ×
            </button>
          )}
        </div>

        {tab === 'insights' ? (
          /* ── Insights tab ── */
          <div className={styles.insightsWrap}>
            {/* Summary cards */}
            <div className={styles.insightsSummary}>
              {[
                { label: 'Total Posts', value: posts.length, color: '#1d6bf3' },
                { label: 'Published', value: posts.filter(p=>p.published).length, color: '#10b981' },
                { label: 'Drafts', value: posts.filter(p=>!p.published).length, color: '#f59e0b' },
                { label: 'Authors', value: authorStats.length, color: '#8b5cf6' },
              ].map(s => (
                <div key={s.label} className={styles.summaryCard} style={{ borderTopColor: s.color }}>
                  <span className={styles.summaryNum} style={{ color: s.color }}>{s.value}</span>
                  <span className={styles.summaryLabel}>{s.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.insightsGrid}>
              {/* Author table */}
              <div className={styles.insightBox}>
                <p className={styles.insightBoxTitle}>Posts by Author</p>
                <div className={styles.authorTable}>
                  <div className={styles.authorHead}>
                    <span>Author</span>
                    <span>Total</span>
                    <span>This Month</span>
                    <span>Last Month</span>
                    <span>Live</span>
                    <span>Draft</span>
                  </div>
                  {authorStats.length === 0 ? (
                    <p className={styles.insightEmpty}>No posts yet.</p>
                  ) : authorStats.map(a => (
                    <div key={a.email} className={styles.authorRow}>
                      <div className={styles.authorCell}>
                        <div className={styles.authorAvatar}>{a.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className={styles.authorName}>{a.name}</p>
                          <p className={styles.authorEmail}>{a.email}</p>
                        </div>
                      </div>
                      <span className={`${styles.authorStat} ${styles.authorTotal}`}>{a.total}</span>
                      <span className={styles.authorStat}>{a.thisMonth}</span>
                      <span className={styles.authorStat}>{a.lastMonth}</span>
                      <span className={`${styles.authorStat} ${styles.authorLive}`}>{a.published}</span>
                      <span className={`${styles.authorStat} ${styles.authorDraft}`}>{a.draft}</span>
                      <button
                        className={styles.viewAuthorBtn}
                        onClick={() => { setAuthorFilter(a.email); setTab('posts') }}
                        title={`View ${a.name}'s posts`}
                      >
                        View →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly chart */}
              <div className={styles.insightBox}>
                <p className={styles.insightBoxTitle}>Published Posts — Last 6 Months</p>
                {(() => {
                  const max = Math.max(...monthlyStats.map(m => m.count), 1)
                  return (
                    <div className={styles.monthChart}>
                      {monthlyStats.map(m => (
                        <div key={m.label} className={styles.monthCol}>
                          <span className={styles.monthCount}>{m.count || ''}</span>
                          <div className={styles.monthBarWrap}>
                            <div
                              className={styles.monthBarFill}
                              style={{ height: `${Math.round((m.count / max) * 100)}%` }}
                            />
                          </div>
                          <span className={styles.monthLabel}>{m.label}</span>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Google Search Console — requires server-side integration */}
            <div className={styles.gscCard}>
              <p className={styles.insightBoxTitle}>Google Search Performance</p>
              <p className={styles.gscCardNote}>
                Search Console data (clicks, impressions, CTR, ranking position) requires a server-side integration.
                You can view live data directly at{' '}
                <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                  search.google.com/search-console
                </a>.
              </p>
            </div>
          </div>
        ) : (
          /* ── Posts tab ── */
          loading ? (
            <div className={styles.loadWrap}><div className={styles.spinner}/></div>
          ) : posts.length === 0 ? (
            <div className={styles.emptyDash}>
              <span>✍️</span>
              <h3>No posts yet</h3>
              <p>Create your first post to get started.</p>
              <button className={styles.newBtn} onClick={() => setCreating(true)}><FaPlus/> Create Post</button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className={styles.emptyDash}>
              <span>🔍</span>
              <h3>No results</h3>
              <p>No posts match {authorFilter ? `for this author` : `"${search}"`}</p>
              <button className={styles.newBtn} onClick={() => { setSearch(''); setAuthorFilter(null) }}>Clear filters</button>
            </div>
          ) : viewMode === 'list' ? (
            <>
              <div className={styles.postList}>
                {pagePosts.map(post => (
                  <motion.div key={post.id} className={styles.postRow} layout initial={{opacity:0}} animate={{opacity:1}}>
                    <div className={styles.postInfo}>
                      <div className={styles.postStatus}>
                        <span className={`${styles.statusDot} ${post.published?styles.live:styles.draft}`}/>
                        <span className={styles.statusText}>{post.published ? 'Live' : 'Draft'}</span>
                      </div>
                      <div>
                        <p className={styles.postTitle}>{post.title}</p>
                        <p className={styles.postMeta}>{post.category} · {formatDate(post.publishedAt)} · {post.author?.name || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className={styles.postActions}>
                      <Link to={`/blog/${post.slug}`} className={styles.actionBtn} title="Preview" target="_blank" rel="noopener noreferrer"><FaEye/></Link>
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
              {filteredPosts.length > pageSize && (
                <div className={styles.paginationBar}>
                  <span className={styles.pageCount}>
                    {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filteredPosts.length)} of {filteredPosts.length} posts
                  </span>
                  <div className={styles.pageBtns}>
                    <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 0}>← Prev</button>
                    <span className={styles.pageInfo}>Page {page + 1} of {totalPages}</span>
                    <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next →</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className={styles.postGrid}>
                {pagePosts.map(post => {
                  const grad = GRADIENTS[post.title?.length % GRADIENTS.length]
                  const isExpanded = expandedTitle === post.id
                  return (
                    <motion.div key={post.id} className={styles.gridCard} layout initial={{opacity:0}} animate={{opacity:1}}>
                      <div className={styles.gridCover} style={{ background: post.coverImage ? `url(${post.coverImage}) center/cover` : grad }}>
                        <div className={styles.gridCoverOverlay} />
                        <span className={`${styles.gridStatusDot} ${post.published ? styles.live : styles.draft}`} />
                        <span className={styles.gridCat}>{post.category}</span>
                      </div>
                      <div className={styles.gridBody}>
                        <p
                          className={`${styles.gridTitle} ${isExpanded ? styles.gridTitleExpanded : ''}`}
                          onClick={() => setExpandedTitle(isExpanded ? null : post.id)}
                          title={isExpanded ? 'Click to collapse' : 'Click to expand'}
                        >
                          {post.title}
                        </p>
                        <p className={styles.gridMeta}>{post.author?.name || 'Unknown'} · {formatDate(post.publishedAt)}</p>
                        <div className={styles.gridActions}>
                          <Link to={`/blog/${post.slug}`} className={styles.actionBtn} title="Preview" target="_blank" rel="noopener noreferrer"><FaEye/></Link>
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
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              {filteredPosts.length > pageSize && (
                <div className={styles.paginationBar}>
                  <span className={styles.pageCount}>
                    {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filteredPosts.length)} of {filteredPosts.length} posts
                  </span>
                  <div className={styles.pageBtns}>
                    <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 0}>← Prev</button>
                    <span className={styles.pageInfo}>Page {page + 1} of {totalPages}</span>
                    <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next →</button>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  )
}
