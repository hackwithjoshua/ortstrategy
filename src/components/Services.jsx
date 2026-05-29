import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  FaServer, FaProjectDiagram, FaShieldAlt, FaCode,
  FaCheckCircle, FaDatabase
} from 'react-icons/fa'
import styles from './Services.module.css'

const services = [
  {
    id: 'devops',
    icon: FaServer,
    color: '#1d6bf3',
    glow: 'rgba(29,107,243,0.3)',
    title: 'DevOps Engineering',
    tagline: 'Ship faster, break less, scale effortlessly.',
    desc: 'We architect and automate your entire delivery pipeline from code commit to production. Multi-cloud IaC, container orchestration, and cloud-native deployments built to last.',
    features: [
      'CI/CD Pipeline Design & Automation',
      'Kubernetes, Docker & Helm Orchestration',
      'IaC: Terraform, Pulumi, OpenTofu, CDK & CFN',
      'Kustomize (Kubernetes native config management)',
      'Monitoring, Alerting & Observability',
      'Cloud Cost Optimisation & FinOps',
    ],
  },
  {
    id: 'data-engineering',
    icon: FaDatabase,
    color: '#f97316',
    glow: 'rgba(249,115,22,0.3)',
    title: 'Data Engineering',
    tagline: 'From raw data to production-grade intelligence.',
    desc: 'We design and build the data infrastructure your organisation needs to move fast. Pipelines, warehouses, lakes, and model-training datasets crafted for reliability and scale.',
    features: [
      'ETL/ELT Pipeline Design (dbt, Airflow, Prefect)',
      'Data Warehouse Architecture (Snowflake, BigQuery)',
      'Stream Processing: Kafka, Flink, Spark',
      'Data Lake Design & Governance',
      'ML Model Training Data Collection & Labelling',
      'IaC Training: Terraform, Pulumi, CDK, CFN, OpenTofu, Kustomize',
    ],
  },
  {
    id: 'system-design',
    icon: FaProjectDiagram,
    color: '#00c8ff',
    glow: 'rgba(0,200,255,0.3)',
    title: 'System Design',
    tagline: 'Architecture that scales from day one.',
    desc: 'From microservices to event-driven systems, we design architectures built to handle millions of users. We document, model, and validate every decision so your team can execute with confidence.',
    features: [
      'Distributed System Architecture',
      'Database Design & Sharding Strategy',
      'API Design: REST, GraphQL & gRPC',
      'Event-Driven & Microservices Patterns',
      'Technical Roadmaps & Architecture Decision Records',
    ],
  },
  {
    id: 'security',
    icon: FaShieldAlt,
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.3)',
    title: 'Security Consultation',
    tagline: 'Protect what you built before attackers find it.',
    desc: 'We embed security into every layer of your stack. Threat modelling, penetration testing guidance, compliance frameworks, and secure SDLC practices that keep your business safe and your data protected.',
    features: [
      'Security Architecture Review',
      'OWASP Threat Modelling',
      'SAST/DAST Integration in CI',
      'Compliance: SOC2, ISO 27001, GDPR',
      'Incident Response Planning',
    ],
  },
  {
    id: 'fullstack',
    icon: FaCode,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.3)',
    title: 'Full Stack Development',
    tagline: 'Beautiful frontends. Powerful backends. Zero compromise.',
    desc: 'We craft end-to-end digital products from pixel-perfect UIs to battle-tested APIs. Our full-stack teams move fast, write clean code, and deliver features that delight users and scale with your growth.',
    features: [
      'React, Next.js & Modern Frontend',
      'Node.js, Go, Python Backends',
      'REST, GraphQL & Realtime APIs',
      'PostgreSQL, MongoDB, Redis',
      'Mobile-Responsive PWAs',
    ],
  },
]

function ServiceCard({ s, i, total }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [hovered, setHovered] = useState(false)

  // Last two cards expand to the left so they don't overflow the viewport
  const expandDir = i >= total - 2 ? 'right' : 'left'

  return (
    <motion.div
      ref={ref}
      className={styles.cardWrapper}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.1, duration: 0.6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ '--accent': s.color, '--glow': s.glow }}
    >
      {/* Compressed always-visible card */}
      <div className={`${styles.card} ${hovered ? styles.cardActive : ''}`}
        style={{ borderColor: hovered ? `${s.color}50` : undefined }}
      >
        <div className={styles.iconBox} style={{ background: `${s.color}20`, boxShadow: `0 6px 20px ${s.glow}` }}>
          <s.icon style={{ color: s.color, fontSize: '1.2rem' }} />
        </div>
        <h3 className={styles.cardTitle}>{s.title}</h3>
        <p className={styles.tagline} style={{ color: s.color }}>{s.tagline}</p>

        <div className={styles.hoverHint}>
          <span style={{ background: `${s.color}20`, color: s.color }}>Hover to explore</span>
        </div>

        {hovered && (
          <div className={styles.cardGlow}
            style={{ background: `radial-gradient(ellipse at top, ${s.color}18, transparent 70%)` }}
          />
        )}
      </div>

      {/* Full expanded panel — floats on top, no layout shift */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className={styles.expanded}
            style={{
              [expandDir === 'right' ? 'right' : 'left']: 0,
              borderColor: `${s.color}40`,
              boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${s.color}30`,
            }}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className={styles.expandedTop}>
              <div className={styles.iconBox} style={{ background: `${s.color}20`, boxShadow: `0 6px 20px ${s.glow}` }}>
                <s.icon style={{ color: s.color, fontSize: '1.2rem' }} />
              </div>
              <div>
                <h3 className={styles.expandedTitle}>{s.title}</h3>
                <p className={styles.expandedTagline} style={{ color: s.color }}>{s.tagline}</p>
              </div>
            </div>

            <p className={styles.expandedDesc}>{s.desc}</p>

            <ul className={styles.expandedFeatures}>
              {s.features.map(f => (
                <li key={f}>
                  <FaCheckCircle style={{ color: s.color, flexShrink: 0, fontSize: '0.75rem' }} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className={styles.expandedGlow}
              style={{ background: `radial-gradient(ellipse at top left, ${s.color}15, transparent 70%)` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Services() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section id="services" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header} ref={ref}>
          <motion.span
            className={styles.label}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
          >
            What We Do
          </motion.span>
          <motion.h2
            className={styles.heading}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            Services Built for the{' '}
            <span className={styles.grad}>Modern Tech Stack</span>
          </motion.h2>
          <motion.p
            className={styles.sub}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            Five core disciplines. One unified team. Infinite potential.
          </motion.p>
        </div>

        <div className={styles.grid}>
          {services.map((s, i) => (
            <ServiceCard key={s.id} s={s} i={i} total={services.length} />
          ))}
        </div>
      </div>
    </section>
  )
}
