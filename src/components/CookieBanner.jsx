import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './CookieBanner.module.css'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('ort-cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  const accept = (type) => {
    localStorage.setItem('ort-cookie-consent', type)
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.banner}
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        >
          <div className={styles.inner}>
            <div className={styles.left}>
              <div className={styles.iconWrap}>
                <span className={styles.cookieIcon}>🍪</span>
              </div>
              <div className={styles.text}>
                <p className={styles.title}>We use cookies</p>
                <p className={styles.desc}>
                  We use essential cookies to keep the site working and optional cookies to improve your experience.
                  Read our{' '}
                  <Link to="/privacy-policy" className={styles.link}>Privacy Policy</Link>
                  {' '}for details.
                </p>
              </div>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.essential}
                onClick={() => accept('essential')}
              >
                Essential Only
              </button>
              <button
                className={styles.acceptAll}
                onClick={() => accept('all')}
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
