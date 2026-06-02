import { motion } from 'framer-motion'
import styles from './RegBanner.module.css'

export default function RegBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.inner}>
        {/* Beating pulse icon */}
        <span className={styles.iconWrap}>
          <motion.span
            className={styles.ring}
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 1.4, ease: 'easeOut', repeat: Infinity }}
          />
          <span className={styles.dot} />
        </span>

        <span className={styles.text}>
          <span className={styles.verified}>Verified Registered Business</span>
          <span className={styles.divider}>|</span>
          <span className={styles.reg}>CAC Registration No.</span>
          <span className={styles.num}>9140616</span>
        </span>
      </div>
    </div>
  )
}
