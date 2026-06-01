import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaLinkedin, FaGithub, FaTwitter, FaArrowUp, FaEnvelope } from 'react-icons/fa'
import Logo from './Logo'
import styles from './Footer.module.css'

const footerLinks = {
  Services: ['DevOps Engineering', 'System Design', 'Security Consultation', 'Full Stack Development', 'Cloud Architecture'],
  Company: ['About Us', 'Our Work', 'Testimonials', { label: 'Hire Engineers', href: '/hire-engineers', internal: true }, { label: 'Blog', href: 'https://blog.ortstrategy.com/' }],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy-policy', internal: true },
    { label: 'Terms of Service', href: '/terms-of-service', internal: true },
    'Cookie Policy',
  ],
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
              {[
                { Icon: FaLinkedin, href: 'https://linkedin.com/company/ort-strategy' },
                { Icon: FaGithub, href: '#' },
                { Icon: FaTwitter, href: '#' },
              ].map(({ Icon, href }, i) => (
                <motion.a key={i} href={href} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} whileHover={{ y: -3, scale: 1.1 }}>
                  <Icon />
                </motion.a>
              ))}
            </div>
            <a href="mailto:contact@ortstrategy.com" className={styles.email}>
              <FaEnvelope />
              contact@ortstrategy.com
            </a>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className={styles.col}>
              <h4 className={styles.colTitle}>{group}</h4>
              <ul className={styles.colLinks}>
                {links.map(link => {
                  const label = typeof link === 'object' ? link.label : link
                  const href = typeof link === 'object' ? link.href : '#'
                  const internal = typeof link === 'object' && link.internal
                  const isExternal = href.startsWith('http')
                  return (
                    <li key={label}>
                      {internal ? (
                        <Link to={href} className={styles.colLink}>{label}</Link>
                      ) : (
                        <a
                          href={href}
                          className={styles.colLink}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                        >
                          {label}
                        </a>
                      )}
                    </li>
                  )
                })}
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
