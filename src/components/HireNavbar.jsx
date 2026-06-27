import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes } from 'react-icons/fa'
import { FiSun, FiMoon } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import ortLogo from '../assets/ort-logo.png'
import { useTheme } from '../context/ThemeContext'
import styles from './HireNavbar.module.css'

const links = [
  { label: 'Process', id: 'process' },
  { label: 'Tech Stacks', id: 'tech-stacks' },
  { label: 'Our Talent', id: 'our-talent' },
  { label: 'Engagement Models', id: 'engagement-models' },
  { label: 'Contact', id: 'hire-form' },
]

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'
  return (
    <motion.button className={styles.toggle} onClick={toggle} whileTap={{ scale: 0.93 }} aria-label="Toggle theme">
      <motion.div
        className={styles.toggleTrack}
        animate={{ background: isLight ? 'rgba(29,107,243,0.12)' : 'rgba(255,255,255,0.08)' }}
        transition={{ duration: 0.3 }}
      >
        <FiMoon className={`${styles.toggleIcon} ${styles.moon}`} />
        <FiSun className={`${styles.toggleIcon} ${styles.sun}`} />
        <motion.div
          className={styles.toggleThumb}
          animate={{ x: isLight ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        />
      </motion.div>
    </motion.button>
  )
}

export default function HireNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <motion.nav
      className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className={styles.container}>
        <Link to="/" className={styles.logoWrap}>
          <img src={ortLogo} alt="ORT Strategy" className={styles.logoImg} />
        </Link>

        <ul className={styles.links}>
          {links.map(l => (
            <li key={l.id}>
              <button className={styles.link} onClick={() => scrollTo(l.id)}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <ThemeToggle />
          <Link to="/" className={styles.backBtn}>
            ← Back to OrtStrategy
          </Link>
          <motion.button
            className={styles.cta}
            onClick={() => scrollTo('hire-form')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Hire Now
          </motion.button>
        </div>

        <button className={styles.hamburger} onClick={() => setOpen(o => !o)}>
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.mobile}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {links.map(l => (
              <button key={l.id} className={styles.mobileLink} onClick={() => scrollTo(l.id)}>
                {l.label}
              </button>
            ))}
            <Link to="/" className={styles.mobileBack}>← Back to OrtStrategy</Link>
            <div className={styles.mobileBottom}>
              <ThemeToggle />
              <button className={styles.mobileCta} onClick={() => scrollTo('hire-form')}>
                Hire Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
