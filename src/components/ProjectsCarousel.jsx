import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from 'react-icons/fa'
import oswImg from '../assets/osw-turing.png'
import oswVideo from '../assets/osw-demo.mp4'
import gladeImg from '../assets/gladefinance.png'
import gladeVideo from '../assets/gladefinance.mp4'
import styles from './ProjectsCarousel.module.css'

const projects = [
  {
    id: 1,
    title: 'CloudNest Platform',
    category: 'DevOps & Cloud',
    desc: 'Multi-tenant SaaS infrastructure on AWS with zero-downtime deployments, auto-scaling, and 99.99% uptime SLA.',
    color1: '#1d6bf3',
    color2: '#00c8ff',
    accent: '#4f8ef7',
    tags: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD'],
    mockBg: 'linear-gradient(135deg, #0a1628 0%, #0f2044 100%)',
    link: null,
  },
  {
    id: 2,
    title: 'OSW — Turing',
    category: 'AI Model Training Data',
    url: 'osw.turing.com',
    link: 'https://osw.turing.com',
    desc: 'OS-World benchmark platform that evaluates state-of-the-art AI models on real desktop tasks — opening apps, building spreadsheets, navigating UIs — across Linux, macOS and Windows environments.',
    color1: '#f59e0b',
    color2: '#fbbf24',
    accent: '#d97706',
    tags: ['AI/ML', 'Data Labelling', 'Linux', 'macOS', 'Windows'],
    mockBg: 'linear-gradient(135deg, #1a1205 0%, #2e1e08 100%)',
    image: oswImg,
    video: oswVideo,
  },
  {
    id: 3,
    title: 'SecureVault Dashboard',
    category: 'Security Consultation',
    desc: 'Enterprise-grade security audit dashboard with real-time threat detection, SIEM integration, and compliance reporting.',
    color1: '#7c3aed',
    color2: '#c084fc',
    accent: '#a855f7',
    tags: ['SIEM', 'SOC2', 'React', 'Node.js'],
    mockBg: 'linear-gradient(135deg, #1a0a28 0%, #2d1054 100%)',
    link: null,
  },
  {
    id: 4,
    title: 'TradeFlow System',
    category: 'System Design',
    desc: 'High-frequency trading platform processing 2M events/sec with microsecond latency and distributed consensus.',
    color1: '#10b981',
    color2: '#34d399',
    accent: '#059669',
    tags: ['Kafka', 'gRPC', 'Redis', 'Go'],
    mockBg: 'linear-gradient(135deg, #061a12 0%, #0a2e1e 100%)',
    link: null,
  },
  {
    id: 5,
    title: 'HealthPulse App',
    category: 'Full Stack Development',
    desc: 'HIPAA-compliant telehealth platform connecting 50k+ patients with real-time video consultation and AI diagnostics.',
    color1: '#ef4444',
    color2: '#f87171',
    accent: '#dc2626',
    tags: ['Next.js', 'WebRTC', 'Python', 'PostgreSQL'],
    mockBg: 'linear-gradient(135deg, #1a0505 0%, #2e0808 100%)',
    link: null,
  },
  {
    id: 6,
    title: 'Gladefinance',
    category: 'Full Stack + Blockchain',
    url: 'gladefinance.co',
    link: 'https://gladefinance.co',
    desc: 'Global Trade Financing Infrastructure powered by Stablecoin & AI. The all-in-one platform for importers, exporters, and financial institutions — delivering AI-driven financing, instant payments, yield, and spend management.',
    color1: '#10b981',
    color2: '#34d399',
    accent: '#059669',
    tags: ['Stablecoin', 'AI', 'Trade Finance', 'Payments', 'DeFi'],
    mockBg: 'linear-gradient(135deg, #021a10 0%, #052e1a 100%)',
    image: gladeImg,
    video: gladeVideo,
    link: 'https://gladefinance.co',
  },
]

function MockScreen({ project, isActive }) {
  const videoRef = useRef(null)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setShowVideo(false)
      if (videoRef.current) videoRef.current.pause()
      return
    }
    // if project has both image and video — show image first for 3s
    if (project.image && project.video) {
      setShowVideo(false)
      const timer = setTimeout(() => setShowVideo(true), 3000)
      return () => clearTimeout(timer)
    }
    // video only — play immediately
    if (project.video) setShowVideo(true)
  }, [isActive, project.image, project.video])

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    if (showVideo && isActive) {
      vid.currentTime = 0
      vid.play().catch(() => {})
    } else {
      vid.pause()
    }
  }, [showVideo, isActive])

  if (project.video || project.image) {
    return (
      <div className={styles.screen} style={{ background: project.mockBg }}>
        <div className={styles.screenBar}>
          <div className={styles.dots}>
            <span style={{ background: '#ff5f57' }} />
            <span style={{ background: '#ffbd2e' }} />
            <span style={{ background: '#28c840' }} />
          </div>
          <div className={styles.urlBar}>
            <span style={{ color: project.color1 }}>●</span> {project.url || 'project.ort.io'}
          </div>
        </div>
        <div className={styles.mediaWrap}>
          {/* Image layer */}
          {project.image && (
            <motion.img
              src={project.image}
              alt={project.title}
              className={styles.mediaItem}
              animate={{ opacity: showVideo ? 0 : 1 }}
              transition={{ duration: 0.6 }}
            />
          )}
          {/* Video layer */}
          {project.video && (
            <motion.video
              ref={videoRef}
              src={project.video}
              className={styles.mediaItem}
              animate={{ opacity: showVideo ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              loop
              muted
              playsInline
              preload={isActive ? 'auto' : 'none'}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.screen} style={{ background: project.mockBg }}>
      <div className={styles.screenBar}>
        <div className={styles.dots}>
          <span style={{ background: '#ff5f57' }} />
          <span style={{ background: '#ffbd2e' }} />
          <span style={{ background: '#28c840' }} />
        </div>
        <div className={styles.urlBar}>
          <span style={{ color: `${project.color1}` }}>●</span> {project.title.toLowerCase().replace(/\s/g, '')}.ort.io
        </div>
      </div>
      <div className={styles.screenBody}>
        <div className={styles.mockNav} style={{ borderBottom: `1px solid ${project.color1}22` }}>
          <div className={styles.mockLogo} style={{ background: `linear-gradient(135deg, ${project.color1}, ${project.color2})` }} />
          {[1,2,3,4].map(i => (
            <div key={i} className={styles.mockNavItem} style={{ background: `${project.color1}20`, width: `${40 + i*10}px` }} />
          ))}
          <div className={styles.mockBtn} style={{ background: `linear-gradient(135deg, ${project.color1}, ${project.color2})` }} />
        </div>
        <div className={styles.mockHero} style={{ background: `radial-gradient(ellipse at top left, ${project.color1}20, transparent 60%)` }}>
          <div className={styles.mockH1} style={{ background: `linear-gradient(90deg, ${project.color1}, ${project.color2})` }} />
          <div className={styles.mockH2} style={{ background: `${project.color1}30` }} />
          <div className={styles.mockH3} style={{ background: `${project.color1}20` }} />
          <div className={styles.mockActions}>
            <div className={styles.mockPrimary} style={{ background: `linear-gradient(135deg, ${project.color1}, ${project.color2})` }} />
            <div className={styles.mockSecondary} style={{ border: `1px solid ${project.color1}60` }} />
          </div>
        </div>
        <div className={styles.mockCards}>
          {[1,2,3].map(i => (
            <div key={i} className={styles.mockCard} style={{ border: `1px solid ${project.color1}25` }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${project.color1}40`, marginBottom: 8 }} />
              <div style={{ height: 7, width: '60%', background: `${project.color1}50`, borderRadius: 4, marginBottom: 6 }} />
              <div style={{ height: 5, width: '80%', background: `${project.accent}25`, borderRadius: 4, marginBottom: 4 }} />
              <div style={{ height: 5, width: '70%', background: `${project.accent}20`, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProjectsCarousel() {
  const [current, setCurrent] = useState(0)
  const [dir, setDir] = useState(1)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  const prev = () => { setDir(-1); setCurrent(c => (c - 1 + projects.length) % projects.length) }
  const next = () => { setDir(1); setCurrent(c => (c + 1) % projects.length) }
  const goTo = (i) => { setDir(i > current ? 1 : -1); setCurrent(i) }

  const p = projects[current]

  return (
    <section id="projects" className={styles.section}>
      <div className={styles.container} ref={ref}>
        <div className={styles.header}>
          <motion.span className={styles.label} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}>
            Our Work
          </motion.span>
          <motion.h2 className={styles.heading} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            Projects We're{' '}
            <span className={styles.grad}>Proud Of</span>
          </motion.h2>
          <motion.p className={styles.sub} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
            Real solutions. Real impact. Delivered on time and beyond expectations.
          </motion.p>
        </div>

        <div className={styles.carouselWrap}>
          <div className={styles.carousel}>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={p.id}
                className={styles.slide}
                custom={dir}
                initial={{ opacity: 0, x: dir * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -dir * 60 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <div className={styles.slideLeft}>
                  <div className={styles.category} style={{ color: p.color1, background: `${p.color1}15`, border: `1px solid ${p.color1}30` }}>
                    {p.category}
                  </div>
                  <h3 className={styles.projectTitle}>{p.title}</h3>
                  <p className={styles.projectDesc}>{p.desc}</p>
                  <div className={styles.tags}>
                    {p.tags.map(t => (
                      <span key={t} className={styles.tag} style={{ background: `${p.color1}15`, border: `1px solid ${p.color1}30`, color: p.color1 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  {p.link ? (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewBtn}
                      style={{ background: `linear-gradient(135deg, ${p.color1}, ${p.color2})` }}
                    >
                      View Live Project <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} />
                    </a>
                  ) : (
                    <button className={styles.viewBtn} style={{ background: `linear-gradient(135deg, ${p.color1}, ${p.color2})` }}>
                      View Case Study <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} />
                    </button>
                  )}
                </div>

                <div className={styles.slideRight}>
                  <motion.div
                    className={styles.screenWrap}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.3 }}
                    style={{ '--shadow': p.color1 }}
                  >
                    <MockScreen project={p} isActive={true} />
                    <div className={styles.screenGlow} style={{ background: `radial-gradient(ellipse at bottom, ${p.color1}30, transparent 70%)` }} />
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={styles.controls}>
            <button className={styles.arrow} onClick={prev}>
              <FaChevronLeft />
            </button>
            <div className={styles.dots2}>
              {projects.map((proj, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === current ? styles.activeDot : ''}`}
                  onClick={() => goTo(i)}
                  style={i === current ? { background: `linear-gradient(135deg, ${p.color1}, ${p.color2})`, width: '28px' } : {}}
                />
              ))}
            </div>
            <button className={styles.arrow} onClick={next}>
              <FaChevronRight />
            </button>
          </div>

          <div className={styles.thumbs}>
            {projects.map((proj, i) => (
              <motion.button
                key={proj.id}
                className={`${styles.thumb} ${i === current ? styles.activeThumb : ''}`}
                onClick={() => goTo(i)}
                whileHover={{ y: -3 }}
                style={i === current ? { border: `2px solid ${proj.color1}` } : {}}
              >
                <span className={styles.thumbDot} style={{ background: `linear-gradient(135deg, ${proj.color1}, ${proj.color2})` }} />
                <span className={styles.thumbLabel}>{proj.title}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
