import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes } from 'react-icons/fa'
import Logo from './Logo'
import styles from './Navbar.module.css'

const links = ['Home', 'About', 'Services', 'Projects', 'Testimonials', 'Contact']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id.toLowerCase())
    if (el) el.scrollIntoView({ behavior: 'smooth' })
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
        <Logo size={38} showText onClick={() => scrollTo('home')} />

        <ul className={styles.links}>
          {links.map((l) => (
            <li key={l}>
              <button className={styles.link} onClick={() => scrollTo(l)}>
                {l}
              </button>
            </li>
          ))}
        </ul>

        <motion.button
          className={styles.cta}
          onClick={() => scrollTo('Contact')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          Get Started
        </motion.button>

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
            {links.map((l) => (
              <button key={l} className={styles.mobileLink} onClick={() => scrollTo(l)}>
                {l}
              </button>
            ))}
            <button className={styles.mobileCta} onClick={() => scrollTo('Contact')}>
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
