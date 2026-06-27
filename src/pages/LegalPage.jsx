import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ortLogo from '../assets/ort-logo.png'
import { useTheme } from '../context/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'
import RegBanner from '../components/RegBanner'
import styles from './LegalPage.module.css'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'
  return (
    <motion.button className={styles.toggle} onClick={toggle} whileTap={{ scale: 0.93 }}>
      <motion.div
        className={styles.toggleTrack}
        animate={{ background: isLight ? 'rgba(29,107,243,0.12)' : 'rgba(255,255,255,0.08)' }}
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

export default function LegalPage({ title, lastUpdated, children }) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className={styles.page}>
      <RegBanner />
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link to="/"><img src={ortLogo} alt="ORT Strategy" className={styles.logoImg} /></Link>
          <div className={styles.navRight}>
            <ThemeToggle />
            <Link to="/" className={styles.backBtn}>← Back to OrtStrategy</Link>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <motion.span
              className={styles.pill}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Legal
            </motion.span>
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.h1>
            <motion.p
              className={styles.updated}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Last updated: {lastUpdated}
            </motion.p>
          </div>

          <motion.div
            className={styles.content}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>© {new Date().getFullYear()} Ort Strategy Tech Services. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <a href="mailto:contact@ortstrategy.com">contact@ortstrategy.com</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
