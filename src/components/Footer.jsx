import { motion } from 'framer-motion'
import { FaLinkedin, FaGithub, FaTwitter, FaArrowUp, FaEnvelope } from 'react-icons/fa'
import Logo from './Logo'
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
            <Logo size={40} showText />
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
