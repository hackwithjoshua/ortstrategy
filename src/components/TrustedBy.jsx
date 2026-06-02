import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useInView } from 'framer-motion'
import turingLogo from '../assets/Turing_Logo_Full_White.svg'
import gladeLogo from '../assets/gladefinance_logo.webp'
import steveLogo from '../assets/sirstevehq.png'
import styles from './TrustedBy.module.css'

const basePartners = [
  { name: 'Turing', logo: turingLogo, color: false, height: 28 },
  { name: 'Glade Finance', logo: gladeLogo, color: true, height: 22 },
  { name: 'SirSteveHQ', logo: steveLogo, color: true, height: 28 },
]

const partners = [...basePartners, ...basePartners, ...basePartners]

function LogoItem({ p }) {
  return (
    <div className={styles.logoItem}>
      <img
        src={p.logo}
        alt={p.name}
        className={`${styles.logoImg} ${p.color ? styles.logoImgColor : ''}`}
        style={{ height: `${p.height}px` }}
      />
    </div>
  )
}

export default function TrustedBy() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section className={styles.section} ref={ref}>
      <motion.p
        className={styles.label}
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        Trusted by leading companies
      </motion.p>

      <div className={styles.wrapper}>
        <motion.div
          className={styles.frame}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className={styles.card}>
            <div className={styles.track}>
              <div className={styles.fade} />
              <div className={styles.fadeRight} />
              <div className={styles.marquee}>
                <div className={styles.marqueeInner}>
                  {partners.map((p, i) => (
                    <LogoItem key={i} p={p} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
