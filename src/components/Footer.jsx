import { motion } from 'framer-motion'
import { FaLinkedin, FaGithub, FaTwitter, FaArrowUp, FaEnvelope } from 'react-icons/fa'
import styles from './Footer.module.css'

const footerLinks = {
  Services: ['DevOps Engineering', 'System Design', 'Security Consultation', 'Full Stack Development', 'Cloud Architecture'],
  Company: ['About Us', 'Our Work', 'Testimonials', 'Careers', 'Blog'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
}

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className={styles.footer}>
      <div className={styles.topLine} />
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                <polygon points="16,2 30,28 2,28" fill="none" stroke="url(#gf)" strokeWidth="2.5" strokeLinejoin="round"/>
                <polygon points="16,10 24,26 8,26" fill="url(#gf)" opacity="0.4"/>
                <defs>
                  <linearGradient id="gf" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1d6bf3"/>
                    <stop offset="100%" stopColor="#00c8ff"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className={styles.logoText}>ORT <span>Strategy</span></span>
            </div>
            <p className={styles.tagline}>
              Engineering the digital future, one scalable solution at a time.
              We build tech that lasts.
            </p>
            <div className={styles.social}>
              {[FaLinkedin, FaGithub, FaTwitter].map((Icon, i) => (
                <motion.a key={i} href="#" className={styles.socialBtn} whileHover={{ y: -3, scale: 1.1 }}>
                  <Icon />
                </motion.a>
              ))}
            </div>
            <a href="mailto:hello@ortstrategy.com" className={styles.email}>
              <FaEnvelope />
              hello@ortstrategy.com
            </a>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className={styles.col}>
              <h4 className={styles.colTitle}>{group}</h4>
              <ul className={styles.colLinks}>
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className={styles.colLink}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {new Date().getFullYear()} Ort Strategy Tech Services. All rights reserved.
            Built with precision, deployed with confidence.
          </p>
          <motion.button
            className={styles.backTop}
            onClick={scrollTop}
            whileHover={{ y: -3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowUp />
            Back to top
          </motion.button>
        </div>
      </div>
    </footer>
  )
}
