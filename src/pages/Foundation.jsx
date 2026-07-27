import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  FaGraduationCap, FaHeartbeat, FaLaptop, FaHandHoldingHeart,
  FaHandsHelping, FaGlobeAfrica, FaArrowLeft, FaArrowRight,
  FaHeart, FaUsers, FaEnvelope,
} from 'react-icons/fa'
import { FiSun, FiMoon } from 'react-icons/fi'
import ortLogo from '../assets/ort-logo.png'
import { useTheme } from '../context/ThemeContext'
import { setSEO } from '../utils/seo'
import styles from './Foundation.module.css'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <motion.button
      className={styles.themeBtn}
      onClick={toggle}
      whileTap={{ scale: 0.92 }}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
    </motion.button>
  )
}

const PILLARS = [
  {
    icon: FaGraduationCap,
    title: 'Education & Scholarships',
    desc: 'Funding tech education for underserved youth, coding bootcamps, university grants, and mentorship programmes that open doors that were never meant to be shut.',
    color: '#1d6bf3',
  },
  {
    icon: FaHeartbeat,
    title: 'Healthcare Access',
    desc: 'Building digital health tools and connecting clinics in underserved communities to telemedicine, medical records, and life-saving resources.',
    color: '#00c8ff',
  },
  {
    icon: FaLaptop,
    title: 'Digital Inclusion',
    desc: 'Providing devices, internet access, and digital literacy training to families cut off from the online world, because connectivity is not a luxury.',
    color: '#7c3aed',
  },
  {
    icon: FaHandHoldingHeart,
    title: 'Food & Livelihood',
    desc: 'Supporting food security programmes and empowering families through sustainable, tech-enabled livelihoods that create lasting independence.',
    color: '#f87171',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Apply or Nominate',
    desc: 'Submit your story or nominate a community in need. No application is too small, every single life matters to us.',
    icon: FaEnvelope,
  },
  {
    num: '02',
    title: 'We Review & Connect',
    desc: 'Our team reviews every application and partners with local organisations to understand the true need on the ground.',
    icon: FaUsers,
  },
  {
    num: '03',
    title: 'Impact Delivered',
    desc: 'Resources, training, devices, and direct support are deployed to those who need it most, measurably and transparently.',
    icon: FaHandsHelping,
  },
]

function PillarCard({ pillar, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = pillar.icon
  return (
    <motion.div
      ref={ref}
      className={styles.pillarCard}
      style={{ '--card-clr': pillar.color }}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.pillarBar} />
      <div className={styles.pillarIcon}><Icon size={26} /></div>
      <h3 className={styles.pillarTitle}>{pillar.title}</h3>
      <p className={styles.pillarDesc}>{pillar.desc}</p>
    </motion.div>
  )
}

function StepCard({ step, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = step.icon
  return (
    <motion.div
      ref={ref}
      className={styles.stepCard}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.13, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.stepGhost}>{step.num}</div>
      <div className={styles.stepTop}>
        <span className={styles.stepNumPill}>{step.num}</span>
        <div className={styles.stepIconWrap}><Icon size={18} /></div>
      </div>
      <h3 className={styles.stepTitle}>{step.title}</h3>
      <p className={styles.stepDesc}>{step.desc}</p>
    </motion.div>
  )
}

export default function Foundation() {
  useEffect(() => {
    setSEO({
      title: 'OrtStrategy Foundation, Technology as a Force for Good',
      description: 'The OrtStrategy Foundation channels the power of engineering and innovation to uplift communities, bridge the digital divide, and create opportunity for those who need it most.',
      path: '/foundation',
    })
  }, [])

  return (
    <div className={styles.page}>

      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link to="/" className={styles.navBack}>
            <FaArrowLeft size={11} />
            <span className={styles.navBackLabel}>OrtStrategy</span>
          </Link>
        </div>

        <Link to="/foundation" className={styles.navBrand}>
          <img src={ortLogo} alt="OrtStrategy" className={styles.navLogo} />
          <span className={styles.navFoundation}>Foundation</span>
        </Link>

        <div className={styles.navRight}>
          <ThemeToggle />
          <a
            href="mailto:contact@ortstrategy.com?subject=Foundation, Apply for Support"
            className={styles.navCta}
          >
            <span className={styles.navCtaLabel}>Apply for Support</span>
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroOrb1} />
        <div className={styles.heroOrb2} />
        <div className={styles.heroOrb3} />
        <div className={styles.heroGrid} />

        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className={styles.heroBadge}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <span className={styles.heroBadgeDot} />
            OrtStrategy Foundation
            <FaHeart size={11} className={styles.heroBadgeHeart} />
          </motion.div>

          <div className={styles.logoWrap}>
            <div className={styles.logoGlow} />
            <div className={styles.logoRing} />
            <img src={ortLogo} alt="OrtStrategy Foundation" className={styles.heroLogoImg} />
          </div>

          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Technology as a
            <br />
            <span className={styles.heroGrad}>Force for Good</span>
          </motion.h1>

          <motion.p
            className={styles.heroSub}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            We channel the power of engineering and innovation to uplift communities,
            bridge the digital divide, and create lasting opportunity for those who need it most.
          </motion.p>

          <motion.div
            className={styles.heroCtas}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
          >
            <a
              href="mailto:contact@ortstrategy.com?subject=Foundation, Apply for Support"
              className={styles.ctaPrimary}
            >
              Apply for Support <FaArrowRight size={13} />
            </a>
            <a
              href="mailto:contact@ortstrategy.com?subject=Foundation, Partner With Us"
              className={styles.ctaOutline}
            >
              Partner With Us
            </a>
          </motion.div>
        </motion.div>

        <div className={styles.scrollHint}>
          <div className={styles.scrollLine} />
          <span>Explore</span>
        </div>
      </section>

      {/* ── HEARTBEAT DIVIDER ── */}
      <div className={styles.hbDivider} aria-hidden="true">
        <svg viewBox="0 0 900 60" className={styles.hbSvg} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="hbGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="25%" stopColor="#1d6bf3" />
              <stop offset="50%" stopColor="#00c8ff" />
              <stop offset="75%" stopColor="#1d6bf3" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polyline
            className={styles.hbLine}
            points="0,30 200,30 240,30 260,8 275,52 290,16 310,44 330,30 540,30 560,30 580,10 595,50 610,18 628,42 646,30 900,30"
            stroke="url(#hbGrad)"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* ── MISSION ── */}
      <section className={styles.mission}>
        <div className={styles.missionInner}>
          <motion.p
            className={styles.eyebrow}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Our Mission
          </motion.p>
          <motion.blockquote
            className={styles.missionQuote}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
          >
            "Nobody should be left behind by the digital age."
          </motion.blockquote>
          <motion.p
            className={styles.missionBody}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Every engineer we place, every system we build, every company we help scale,
            a portion of that effort feeds directly into the Foundation. Because progress
            that doesn't lift others is incomplete.
          </motion.p>
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section className={styles.pillars}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Areas of Impact</p>
            <h2 className={styles.sectionTitle}>Where We Show Up</h2>
            <p className={styles.sectionSub}>Four focus areas where technology changes the most lives.</p>
          </div>
          <div className={styles.pillarsGrid}>
            {PILLARS.map((p, i) => <PillarCard key={p.title} pillar={p} i={i} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.howSection}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>How It Works</p>
            <h2 className={styles.sectionTitle}>From Need to Impact</h2>
            <p className={styles.sectionSub}>A transparent, human-first process that puts people before paperwork.</p>
          </div>
          <div className={styles.stepsGrid}>
            {STEPS.map((s, i) => <StepCard key={s.num} step={s} i={i} />)}
          </div>
        </div>
      </section>

      {/* ── FOUNDER QUOTE ── */}
      <section className={styles.founderSection}>
        <div className={styles.founderGlow} />
        <div className={styles.founderInner}>
          <div className={styles.quoteMarkBig}>&ldquo;</div>
          <motion.blockquote
            className={styles.founderQuote}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
          >
            At OrtStrategy, we build technology that moves business forward. The Foundation
            exists because we believe that power must be shared. If our work creates wealth,
            some of that wealth must create opportunity for those who couldn't access the table.
          </motion.blockquote>
          <motion.div
            className={styles.founderAttrib}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <img src="/joshua-okorie.jpg" alt="Joshua Okorie" className={styles.founderAvatar} />
            <div>
              <p className={styles.founderName}>Joshua Okorie</p>
              <p className={styles.founderRole}>Founder & CEO, OrtStrategy</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── GET INVOLVED ── */}
      <section className={styles.involve}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Get Involved</p>
            <h2 className={styles.sectionTitle}>Every Action Matters</h2>
            <p className={styles.sectionSub}>Three ways to be part of the change, pick the one that fits you.</p>
          </div>
          <div className={styles.involveGrid}>

            <motion.div
              className={styles.involveCard}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <div className={styles.involveIconBlue}><FaHandHoldingHeart size={30} /></div>
              <h3 className={styles.involveTitle}>Donate</h3>
              <p className={styles.involveDesc}>Any contribution, large or small, directly funds education, devices, and healthcare access for real people in real communities.</p>
              <a
                href="mailto:contact@ortstrategy.com?subject=Foundation, Donation"
                className={`${styles.involveBtn} ${styles.involveBtnBlue}`}
              >
                Make a Donation <FaArrowRight size={11} />
              </a>
            </motion.div>

            <motion.div
              className={`${styles.involveCard} ${styles.involveFeatured}`}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.11 }}
            >
              <div className={styles.involveIconCyan}><FaHandsHelping size={30} /></div>
              <h3 className={styles.involveTitle}>Volunteer</h3>
              <p className={styles.involveDesc}>Engineers, designers, doctors, educators, your skills are needed. A few hours a month directly changes someone's trajectory forever.</p>
              <a
                href="mailto:contact@ortstrategy.com?subject=Foundation, Volunteer"
                className={`${styles.involveBtn} ${styles.involveBtnGrad}`}
              >
                Join as a Volunteer <FaArrowRight size={11} />
              </a>
            </motion.div>

            <motion.div
              className={styles.involveCard}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.22 }}
            >
              <div className={styles.involveIconViolet}><FaGlobeAfrica size={30} /></div>
              <h3 className={styles.involveTitle}>Partner</h3>
              <p className={styles.involveDesc}>NGOs, corporations, and community organisations, let's multiply impact together. We're open to all forms of meaningful partnership.</p>
              <a
                href="mailto:contact@ortstrategy.com?subject=Foundation, Partnership"
                className={`${styles.involveBtn} ${styles.involveBtnViolet}`}
              >
                Become a Partner <FaArrowRight size={11} />
              </a>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className={styles.finalCta}>
        <div className={styles.finalOrb1} />
        <div className={styles.finalOrb2} />
        <motion.div
          className={styles.finalInner}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75 }}
        >
          <h2 className={styles.finalTitle}>Ready to be part of the change?</h2>
          <p className={styles.finalSub}>
            Whether you need support, want to give it, or want to amplify it,
            reach out today. No bureaucracy. Just people helping people.
          </p>
          <motion.a
            href="mailto:contact@ortstrategy.com?subject=OrtStrategy Foundation"
            className={styles.finalBtn}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Contact the Foundation <FaArrowRight size={14} />
          </motion.a>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <Link to="/" className={styles.footerLogoLink}>
          <img src={ortLogo} alt="OrtStrategy" className={styles.footerLogoImg} />
        </Link>
        <p className={styles.footerText}>
          OrtStrategy Foundation, a humanitarian initiative by{' '}
          <Link to="/" className={styles.footerA}>OrtStrategy Tech Services</Link>
        </p>
        <a href="mailto:contact@ortstrategy.com" className={styles.footerA}>
          contact@ortstrategy.com
        </a>
      </footer>

    </div>
  )
}
