import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { FaRocket, FaShieldAlt, FaLightbulb, FaUsers } from 'react-icons/fa'
import styles from './About.module.css'

const values = [
  { icon: FaRocket, title: 'Speed & Precision', desc: 'We ship fast without sacrificing quality. Every line of code is intentional.' },
  { icon: FaShieldAlt, title: 'Security First', desc: 'Security is baked in from day one, not patched on at the end.' },
  { icon: FaLightbulb, title: 'Innovation Driven', desc: 'We stay ahead of the curve, bringing cutting-edge solutions to every project.' },
  { icon: FaUsers, title: 'Client Partnership', desc: 'Your success is our mission. We work alongside you as a true technology partner.' },
]

function ValueCard({ icon: Icon, title, desc, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      className={styles.card}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.12, duration: 0.6 }}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      <div className={styles.iconWrap}>
        <Icon className={styles.icon} />
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </motion.div>
  )
}

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.top} ref={ref}>
          <motion.div
            className={styles.label}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            About Us
          </motion.div>
          <motion.h2
            className={styles.heading}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Engineering Excellence,{' '}
            <span className={styles.grad}>Delivered at Scale</span>
          </motion.h2>
          <motion.p
            className={styles.body}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            OrtStrategy is a premier technology services firm built by engineers,
            for builders. We combine deep technical expertise with strategic thinking
            to design, build, and scale digital products that matter. From startups
            to enterprises, we've helped dozens of teams move faster, ship smarter,
            and stay secure.
          </motion.p>
        </div>

        <div className={styles.cards}>
          {values.map((v, i) => (
            <ValueCard key={v.title} {...v} i={i} />
          ))}
        </div>

        <motion.div
          className={styles.banner}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <div className={styles.bannerContent}>
            <p className={styles.bannerLabel}>Our Mission</p>
            <h3 className={styles.bannerText}>
              To turn complex technical challenges into competitive advantages
              for every client we serve.
            </h3>
          </div>
          <div className={styles.bannerDeco}>
            <div className={styles.ring} />
            <div className={styles.ring2} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
