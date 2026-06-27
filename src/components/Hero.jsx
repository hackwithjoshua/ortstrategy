import { motion } from 'framer-motion'
import { FaArrowRight, FaPlay } from 'react-icons/fa'
import styles from './Hero.module.css'

const techBadges = ['DevOps', 'System Design', 'Security', 'Full Stack', 'Cloud', 'AI/ML']

export default function Hero() {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className={styles.hero}>
      <div className={styles.orbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      <div className={styles.container}>
        <motion.div
          className={styles.badge}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className={styles.badgeDot} />
          Trusted Tech Partner for Modern Businesses
        </motion.div>

        <motion.h1
          className={styles.headline}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
        >
          We Build the{' '}
          <span className={styles.highlight}>Digital Future</span>
          <br />
          Your Business Deserves
        </motion.h1>

        <motion.p
          className={styles.sub}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          OrtStrategy delivers world-class DevOps, Security Consultation,
          System Design, and Full Stack Development — transforming ambitious
          ideas into scalable, secure digital products.
        </motion.p>

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
        >
          <motion.button
            className={styles.primary}
            onClick={() => scrollTo('contact')}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(29,107,243,0.7)' }}
            whileTap={{ scale: 0.97 }}
          >
            Start Your Project <FaArrowRight className={styles.btnIcon} />
          </motion.button>
          <motion.button
            className={styles.secondary}
            onClick={() => scrollTo('projects')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className={styles.playBtn}><FaPlay /></span>
            View Our Work
          </motion.button>
        </motion.div>

        <motion.div
          className={styles.badges}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          {techBadges.map((b, i) => (
            <motion.span
              key={b}
              className={styles.techBadge}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + i * 0.08, duration: 0.4 }}
            >
              {b}
            </motion.span>
          ))}
        </motion.div>
      </div>

      <motion.div
        className={styles.scroll}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className={styles.scrollLine} />
        <span>Scroll to explore</span>
      </motion.div>

      <div className={styles.grid} />
    </section>
  )
}
