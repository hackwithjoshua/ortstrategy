import { useRef, useState, useEffect } from 'react'
import { setSEO } from '../utils/seo'
import emailjs from '@emailjs/browser'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaArrowRight, FaCheckCircle, FaCode,
  FaDatabase, FaProjectDiagram, FaBrain, FaReact, FaNodeJs,
  FaPython, FaDocker, FaAws, FaChevronLeft, FaWindows
} from 'react-icons/fa'
import {
  SiKubernetes, SiTerraform, SiGo, SiRust, SiNextdotjs,
  SiPostgresql, SiMongodb, SiRedis, SiTypescript,
  SiPulumi, SiGooglecloud, SiOpenjdk,
  SiPhp, SiLaravel, SiSpring, SiCplusplus, SiKotlin,
  SiFlutter, SiGraphql, SiDjango, SiDotnet, SiVuedotjs,
  SiAngular, SiSwift, SiApachekafka
} from 'react-icons/si'
import HireNavbar from '../components/HireNavbar'
import RegBanner from '../components/RegBanner'
import Footer from '../components/Footer'
import ParticleBackground from '../components/ParticleBackground'
import styles from './HireEngineers.module.css'

const stats = [
  { value: '48h', label: 'Average time to match' },
  { value: '100%', label: 'Pre-vetted talent' },
  { value: '50+', label: 'Engineers available' },
  { value: '98%', label: 'Client retention rate' },
]

const steps = [
  {
    num: '01',
    title: 'Tell Us What You Need',
    desc: 'Share your tech stack, team size, timezone, and engagement type. Takes 5 minutes.',
    icon: FaProjectDiagram,
  },
  {
    num: '02',
    title: 'Meet Your Matches',
    desc: 'Within 48 hours we present pre-vetted engineers that fit your exact requirements. No wasted interviews.',
    icon: FaBrain,
  },
  {
    num: '03',
    title: 'Trial & Onboard',
    desc: 'Start with a no-risk 2-week trial. If you\'re happy, we kick off the engagement.',
    icon: FaCheckCircle,
  },
]

const engagements = [
  {
    title: 'Part-Time',
    hours: '20 hrs/week',
    desc: 'Perfect for startups that need senior expertise without full-time commitment.',
    features: [
      'Dedicated engineer',
      'Daily standups',
      'Weekly reports',
      'Slack access',
    ],
    cta: 'Start Part-Time',
    highlight: false,
  },
  {
    title: 'Full-Time',
    hours: '40 hrs/week',
    desc: 'A senior engineer embedded in your team, working your hours, in your timezone.',
    features: [
      'Full team integration',
      'Your tools & processes',
      'Timezone aligned',
      'Dedicated Slack & standups',
      '2-week trial period',
    ],
    cta: 'Hire Full-Time',
    highlight: true,
  },
  {
    title: 'Team',
    hours: 'Custom squad',
    desc: 'Need a full engineering team? We build and manage dedicated squads for complex products.',
    features: [
      'Frontend + Backend + DevOps',
      'Tech lead included',
      'Sprint planning & delivery',
      'Dedicated project manager',
      'Weekly executive reports',
    ],
    cta: 'Build a Team',
    highlight: false,
  },
]

const stacks = [
  { icon: FaReact, name: 'React' },
  { icon: FaReact, name: 'React Native' },
  { icon: SiNextdotjs, name: 'Next.js' },
  { icon: SiTypescript, name: 'TypeScript' },
  { icon: SiVuedotjs, name: 'Vue.js' },
  { icon: SiAngular, name: 'Angular' },
  { icon: SiFlutter, name: 'Flutter' },
  { icon: FaNodeJs, name: 'Node.js' },
  { icon: FaPython, name: 'Python' },
  { icon: SiDjango, name: 'Django' },
  { icon: SiOpenjdk, name: 'Java' },
  { icon: SiSpring, name: 'Spring Boot' },
  { icon: SiPhp, name: 'PHP' },
  { icon: SiLaravel, name: 'Laravel' },
  { icon: SiCplusplus, name: 'C++' },
  { icon: SiKotlin, name: 'Kotlin' },
  { icon: SiSwift, name: 'Swift' },
  { icon: SiDotnet, name: '.NET' },
  { icon: SiGo, name: 'Go' },
  { icon: SiRust, name: 'Rust' },
  { icon: SiGraphql, name: 'GraphQL' },
  { icon: FaDocker, name: 'Docker' },
  { icon: SiKubernetes, name: 'Kubernetes' },
  { icon: SiTerraform, name: 'Terraform' },
  { icon: SiPulumi, name: 'Pulumi' },
  { icon: FaAws, name: 'AWS / CDK' },
  { icon: SiGooglecloud, name: 'Google Cloud' },
  { icon: FaWindows, name: 'Azure' },
  { icon: SiApachekafka, name: 'Kafka' },
  { icon: SiPostgresql, name: 'PostgreSQL' },
  { icon: SiMongodb, name: 'MongoDB' },
  { icon: SiRedis, name: 'Redis' },
  { icon: FaDatabase, name: 'Data Eng' },
]

const profiles = [
  {
    role: 'Senior Full Stack Engineer',
    exp: '7 years',
    stack: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    rate: 'Available',
    tz: 'UTC / EST',
    color: '#1d6bf3',
  },
  {
    role: 'DevOps / Platform Engineer',
    exp: '6 years',
    stack: ['Kubernetes', 'Terraform', 'AWS', 'Go'],
    rate: 'Available',
    tz: 'UTC / WAT',
    color: '#00c8ff',
  },
  {
    role: 'Data Engineer',
    exp: '5 years',
    stack: ['Python', 'Spark', 'dbt', 'Snowflake'],
    rate: 'Available',
    tz: 'EST / CST',
    color: '#7c3aed',
  },
  {
    role: 'Security Engineer',
    exp: '8 years',
    stack: ['SIEM', 'AWS Security', 'Python', 'SOC2'],
    rate: 'Available',
    tz: 'UTC / GMT',
    color: '#10b981',
  },
]


function StatCard({ value, label, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      className={styles.statCard}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.1, duration: 0.5 }}
    >
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </motion.div>
  )
}

function StepCard({ step, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={styles.stepCard}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.15, duration: 0.6 }}
      whileHover={{ y: -6 }}
    >
      <div className={styles.stepNum}>{step.num}</div>
      <div className={styles.stepIcon}>
        <step.icon />
      </div>
      <h3>{step.title}</h3>
      <p>{step.desc}</p>
      {i < steps.length - 1 && <div className={styles.stepArrow}><FaArrowRight /></div>}
    </motion.div>
  )
}

function EngagementCard({ e, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={`${styles.engCard} ${e.highlight ? styles.engHighlight : ''}`}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.12, duration: 0.6 }}
      whileHover={{ y: -8 }}
    >
      {e.highlight && <div className={styles.popularBadge}>Most Popular</div>}
      <div className={styles.engHours}>{e.hours}</div>
      <h3 className={styles.engTitle}>{e.title}</h3>
      <p className={styles.engDesc}>{e.desc}</p>
      <ul className={styles.engFeatures}>
        {e.features.map(f => (
          <li key={f}>
            <FaCheckCircle className={styles.engCheck} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        className={`${styles.engBtn} ${e.highlight ? styles.engBtnPrimary : styles.engBtnSecondary}`}
        onClick={() => document.getElementById('hire-form')?.scrollIntoView({ behavior: 'smooth' })}
      >
        {e.cta} <FaArrowRight style={{ fontSize: '0.75rem' }} />
      </button>
    </motion.div>
  )
}

function ProfileCard({ p, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={styles.profileCard}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.1, duration: 0.6 }}
      whileHover={{ y: -6 }}
    >
      <div className={styles.profileAvatar} style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}88)` }}>
        <FaCode style={{ fontSize: '1.4rem', color: '#fff' }} />
      </div>
      <div className={styles.profileInfo}>
        <h4>{p.role}</h4>
        <div className={styles.profileMeta}>
          <span>{p.exp} exp</span>
          <span className={styles.dot}>·</span>
          <span>{p.tz}</span>
        </div>
        <div className={styles.profileStack}>
          {p.stack.map(s => (
            <span key={s} className={styles.profileTag} style={{ color: p.color, borderColor: `${p.color}40`, background: `${p.color}10` }}>
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.profileStatus}>
        <span className={styles.availDot} />
        {p.rate}
      </div>
    </motion.div>
  )
}

export default function HireEngineers() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  useEffect(() => {
    setSEO({
      title: 'Hire Engineers — Pre-Vetted Tech Talent',
      description: 'Hire pre-vetted software engineers, DevOps specialists, and tech talent through OrtStrategy. Fast matching, flexible engagement, proven results.',
      keywords: 'hire engineers, hire software developers, DevOps engineers for hire, tech talent, pre-vetted engineers, software outsourcing, OrtStrategy',
      path: '/hire-engineers',
    })
  }, [])

  const scrollToForm = () => {
    document.getElementById('hire-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <ParticleBackground />
      <RegBanner />
      <HireNavbar />
      <main className={styles.main}>

        {/* ── Hero ── */}
        <section className={styles.hero} ref={heroRef}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroGrid} />

          <div className={styles.heroContent}>
            <motion.div
              className={styles.heroBadge}
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              <span className={styles.heroBadgeDot} />
              Pre-vetted engineers. Zero fluff. Real results.
            </motion.div>

            <motion.h1
              className={styles.heroHeadline}
              initial={{ opacity: 0, y: 40 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              Hire Engineers Who{' '}
              <span className={styles.heroGrad}>Ship.</span>
            </motion.h1>

            <motion.p
              className={styles.heroSub}
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
            >
              Stop wasting months on bad hires. Ort Strategy gives you
              battle-tested engineers, vetted for skill, communication, and
              delivery, embedded in your team and shipping within days.
            </motion.p>

            <motion.div
              className={styles.heroActions}
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.65 }}
            >
              <motion.button
                className={styles.heroPrimary}
                onClick={scrollToForm}
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(29,107,243,0.7)' }}
                whileTap={{ scale: 0.97 }}
              >
                Request an Engineer <FaArrowRight style={{ fontSize: '0.8rem' }} />
              </motion.button>
              <Link to="/" className={styles.heroBack}>
                <FaChevronLeft style={{ fontSize: '0.8rem' }} /> Back to main site
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            {stats.map((s, i) => <StatCard key={s.label} {...s} i={i} />)}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="process" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.pill}>Process</span>
              <h2>From Request to <span className={styles.grad}>Shipping in Days</span></h2>
              <p>No 3-month search. No wasted interviews. We do the vetting so you don't have to.</p>
            </div>
            <div className={styles.stepsGrid}>
              {steps.map((s, i) => <StepCard key={s.num} step={s} i={i} />)}
            </div>
          </div>
        </section>

        {/* ── Tech Stacks ── */}
        <section id="tech-stacks" className={`${styles.section} ${styles.stackSection}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.pill}>Tech Stacks</span>
              <h2>Whatever You're <span className={styles.grad}>Building With</span></h2>
              <p>Our engineers cover the full modern stack: frontend, backend, data, cloud, and security.</p>
            </div>
            <div className={styles.stackGrid}>
              {stacks.map((s, i) => (
                <motion.div
                  key={s.name}
                  className={styles.stackItem}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  whileHover={{ y: -4, scale: 1.08 }}
                >
                  <s.icon className={styles.stackIcon} />
                  <span>{s.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Engineer Profiles ── */}
        <section id="our-talent" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.pill}>Our Talent</span>
              <h2>Engineers <span className={styles.grad}>Ready to Ship</span></h2>
              <p>A look at the talent in our network. Tell us your needs and we'll match you precisely.</p>
            </div>
            <div className={styles.profilesGrid}>
              {profiles.map((p, i) => <ProfileCard key={p.role} p={p} i={i} />)}
            </div>
          </div>
        </section>

        {/* ── Engagement Models ── */}
        <section id="engagement-models" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.pill}>Engagement Models</span>
              <h2>Choose How You <span className={styles.grad}>Want to Work</span></h2>
              <p>Flexible engagements built around your team, budget, and pace.</p>
            </div>
            <div className={styles.engGrid}>
              {engagements.map((e, i) => <EngagementCard key={e.title} e={e} i={i} />)}
            </div>
          </div>
        </section>

        {/* ── Contact Form ── */}
        <section className={styles.section} id="hire-form">
          <div className={styles.container}>
            <div className={styles.formWrap}>
              <div className={styles.formLeft}>
                <span className={styles.pill}>Get Started</span>
                <h2>Request an <span className={styles.grad}>Engineer Today</span></h2>
                <p>Fill in your requirements and we'll come back to you within 24 hours with matched profiles.</p>
                <a href="mailto:hireengineers@ortstrategy.com" className={styles.contactEmail}>
                  hireengineers@ortstrategy.com
                </a>
                <ul className={styles.formPerks}>
                  {['No upfront commitment', '2-week trial period', 'Timezone-aligned matching', 'Cancel anytime'].map(p => (
                    <li key={p}><FaCheckCircle className={styles.perkCheck} />{p}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.formRight}>
                <HireForm />
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer email="hireengineers@ortstrategy.com" />
    </>
  )
}

function HireForm() {
  const [form, setForm] = useState({ company:'', name:'', email:'', engagement:'', role:'', message:'' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setStatus(null)
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_HIRE_TEMPLATE_ID,
        {
          name: form.name,
          email: form.email,
          company: form.company,
          engagement: form.engagement || 'Not specified',
          role: form.role,
          message: form.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      setStatus('success')
      setForm({ company:'', name:'', email:'', engagement:'', role:'', message:'' })
    } catch { setStatus('error') }
    finally { setLoading(false) }
  }

  return (
    <form className={styles.hireForm} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label>Company Name *</label>
          <input type="text" value={form.company} onChange={e=>set('company',e.target.value)} placeholder="Acme Inc." required />
        </div>
        <div className={styles.formField}>
          <label>Your Name *</label>
          <input type="text" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="John Doe" required />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label>Work Email *</label>
          <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="john@acme.com" required />
        </div>
        <div className={styles.formField}>
          <label>Engagement Type</label>
          <select value={form.engagement} onChange={e=>set('engagement',e.target.value)}>
            <option value="">Select...</option>
            <option>Part-Time (20 hrs/week)</option>
            <option>Full-Time (40 hrs/week)</option>
            <option>Full Team / Squad</option>
          </select>
        </div>
      </div>
      <div className={styles.formField}>
        <label>Tech Stack / Role Needed *</label>
        <input type="text" value={form.role} onChange={e=>set('role',e.target.value)} placeholder="e.g. Senior React + Node.js engineer" required />
      </div>
      <div className={styles.formField}>
        <label>Tell Us More</label>
        <textarea rows={4} value={form.message} onChange={e=>set('message',e.target.value)} placeholder="Describe the role, project context, team size, and any specific requirements..." />
      </div>

      {status === 'success' && (
        <div className={styles.successMsg}>
          Request sent! We will get back to you within 24 hours.
        </div>
      )}
      {status === 'error' && (
        <div className={styles.errorMsg}>
          Something went wrong. Email us directly at hireengineers@ortstrategy.com
        </div>
      )}

      <motion.button
        type="submit"
        className={styles.submitBtn}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
      >
        {loading ? <span className={styles.spinner} /> : <>Send Request. We'll Respond in 24 Hours <FaArrowRight style={{ fontSize: '0.8rem' }} /></>}
      </motion.button>
    </form>
  )
}
