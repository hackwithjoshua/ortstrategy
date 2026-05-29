import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import styles from './Stats.module.css'

const stats = [
  { value: 50, suffix: '+', label: 'Projects Delivered' },
  { value: 30, suffix: '+', label: 'Happy Clients' },
  { value: 99, suffix: '%', label: 'Client Satisfaction' },
  { value: 5, suffix: '+', label: 'Years Experience' },
]

function Counter({ value, suffix, label, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1800
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * value))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(value)
    }
    const timer = setTimeout(() => requestAnimationFrame(step), i * 150)
    return () => clearTimeout(timer)
  }, [inView, value, i])

  return (
    <motion.div
      ref={ref}
      className={styles.stat}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.1, duration: 0.6 }}
    >
      <span className={styles.value}>
        {count}{suffix}
      </span>
      <span className={styles.label}>{label}</span>
    </motion.div>
  )
}

export default function Stats() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.inner}>
          {stats.map((s, i) => (
            <Counter key={s.label} {...s} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
