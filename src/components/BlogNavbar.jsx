import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSun, FiMoon } from 'react-icons/fi'
import ortLogo from '../assets/ort-logo.svg'
import { useTheme } from '../context/ThemeContext'
import styles from './BlogNavbar.module.css'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'
  return (
    <motion.button className={styles.themeBtn} onClick={toggle} whileTap={{ scale: 0.93 }} aria-label="Toggle theme">
      {isLight ? <FiMoon /> : <FiSun />}
    </motion.button>
  )
}

export default function BlogNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link to="/" className={styles.logoWrap}>
            <img src={ortLogo} alt="ORT Strategy" className={styles.logo} />
          </Link>
          <span className={styles.divider} />
          <Link to="/blog" className={styles.blogLabel}>Blog</Link>
        </div>

        <div className={styles.right}>
          <ThemeToggle />
          <Link to="/" className={styles.siteLink}>Back to site</Link>
          <a href="/#contact" className={styles.ctaBtn}>Get in Touch</a>
        </div>
      </div>
    </motion.header>
  )
}
