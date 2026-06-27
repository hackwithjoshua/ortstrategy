import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import styles from './Testimonials.module.css'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'CTO, NovaTech Solutions',
    avatar: 'SM',
    color: '#1d6bf3',
    rating: 5,
    text: "OrtStrategy completely transformed our DevOps culture. We went from monthly releases to deploying 15+ times a day. Their Kubernetes setup and CI/CD pipelines are world-class. I can't recommend them highly enough.",
  },
  {
    id: 2,
    name: 'James Okafor',
    role: 'Founder, FinEdge Capital',
    avatar: 'JO',
    color: '#10b981',
    rating: 5,
    text: "The security consultation they provided was eye-opening. They found critical vulnerabilities in our fintech platform before they became real problems. Their SOC2 compliance roadmap saved us months of pain.",
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'VP Engineering, HealthBridge',
    avatar: 'PS',
    color: '#7c3aed',
    rating: 5,
    text: "We needed a system that could handle 10x growth overnight. Ort Strategy designed our entire distributed architecture from scratch. Six months in, we hit that scale and everything just... worked. Incredible.",
  },
  {
    id: 4,
    name: 'Marcus Webb',
    role: 'CEO, RetailSync',
    avatar: 'MW',
    color: '#f59e0b',
    rating: 5,
    text: "The full stack team built our entire e-commerce platform in 3 months. The UI is stunning, the backend is rock solid, and they've been excellent partners for ongoing improvements. Best tech investment we've made.",
  },
  {
    id: 5,
    name: 'Amina Hassan',
    role: 'Head of Product, LogiCo',
    avatar: 'AH',
    color: '#ef4444',
    rating: 5,
    text: "From initial architecture design to deployment, Ort Strategy was with us every step. They don't just write code — they think about your business and deliver solutions that actually solve the right problems.",
  },
  {
    id: 6,
    name: 'David Chen',
    role: 'Director of Engineering, CloudPeak',
    avatar: 'DC',
    color: '#00c8ff',
    rating: 5,
    text: "Their DevOps expertise alone is worth every penny. Infrastructure costs down 40%, deployment time down 90%, and our team is finally spending time on features instead of fighting fires. Game changer.",
  },
]

function Stars() {
  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map(i => <FaStar key={i} style={{ color: '#fbbf24' }} />)}
    </div>
  )
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [dir, setDir] = useState(1)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    const timer = setInterval(() => {
      setDir(1)
      setCurrent(c => (c + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => { setDir(-1); setCurrent(c => (c - 1 + testimonials.length) % testimonials.length) }
  const next = () => { setDir(1); setCurrent(c => (c + 1) % testimonials.length) }

  const getVisible = () => {
    const indices = []
    for (let i = 0; i < 3; i++) {
      indices.push((current + i) % testimonials.length)
    }
    return indices
  }

  return (
    <section id="testimonials" className={styles.section}>
      <div className={styles.container} ref={ref}>
        <div className={styles.header}>
          <motion.span className={styles.label} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}>
            Testimonials
          </motion.span>
          <motion.h2 className={styles.heading} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            Trusted by Teams{' '}
            <span className={styles.grad}>That Ship</span>
          </motion.h2>
          <motion.p className={styles.sub} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
            Don't take our word for it — hear from the builders we've partnered with.
          </motion.p>
        </div>

        <div className={styles.carousel}>
          <div className={styles.cards}>
            {getVisible().map((idx, pos) => {
              const t = testimonials[idx]
              return (
                <motion.div
                  key={`${idx}-${pos}`}
                  className={`${styles.card} ${pos === 1 ? styles.featured : ''}`}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -6 }}
                  style={{ '--accent': t.color }}
                >
                  <div className={styles.cardTop}>
                    <FaQuoteLeft className={styles.quote} />
                    <Stars />
                  </div>
                  <p className={styles.testimonialText}>{t.text}</p>
                  <div className={styles.author}>
                    <div className={styles.avatar} style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className={styles.name}>{t.name}</p>
                      <p className={styles.role}>{t.role}</p>
                    </div>
                  </div>
                  {pos === 1 && (
                    <div className={styles.featuredGlow} style={{ background: `radial-gradient(ellipse at top, ${t.color}18, transparent 70%)` }} />
                  )}
                </motion.div>
              )
            })}
          </div>

          <div className={styles.controls}>
            <button className={styles.arrow} onClick={prev}><FaChevronLeft /></button>
            <div className={styles.dots}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === current ? styles.activeDot : ''}`}
                  onClick={() => { setDir(i > current ? 1 : -1); setCurrent(i) }}
                />
              ))}
            </div>
            <button className={styles.arrow} onClick={next}><FaChevronRight /></button>
          </div>
        </div>
      </div>
    </section>
  )
}
