import { Link } from 'react-router-dom'
import ortLogo from '../assets/ort-logo.svg'
import styles from './BlogFooter.module.css'

export default function BlogFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <img src={ortLogo} alt="ORT Strategy" className={styles.logo} />
          <p className={styles.copy}>
            © {new Date().getFullYear()} Ort Strategy Tech Services
          </p>
        </div>
        <div className={styles.links}>
          <Link to="/">Main Site</Link>
          <Link to="/hire-engineers">Hire Engineers</Link>
          <Link to="/privacy-policy">Privacy</Link>
          <a href="mailto:contact@ortstrategy.com">Contact</a>
        </div>
      </div>
    </footer>
  )
}
