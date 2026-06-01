import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import emailjs from '@emailjs/browser'
import {
  FaPaperPlane, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaLinkedin, FaGithub, FaTwitter, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa'
import styles from './Contact.module.css'

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const services = [
  'DevOps Engineering',
  'System Design',
  'Security Consultation',
  'Full Stack Development',
  'Cloud Architecture',
  'Other',
]

export default function Contact() {
  const ref = useRef(null)
  const formRef = useRef(null)
  const inView = useInView(ref, { once: true })
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', subject: '', message: '' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    setStatus(null)
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.service || 'Not specified',
          subject: form.subject,
          message: form.message,
        },
        EMAILJS_PUBLIC_KEY
      )
      setStatus('success')
      setForm({ name: '', email: '', phone: '', service: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (name) =>
    `${styles.input} ${focused === name ? styles.focused : ''}`

  return (
    <section id="contact" className={styles.section}>
      <div className={styles.container} ref={ref}>
        <div className={styles.header}>
          <motion.span className={styles.label} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}>
            Contact Us
          </motion.span>
          <motion.h2 className={styles.heading} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            Ready to Build{' '}
            <span className={styles.grad}>Something Great?</span>
          </motion.h2>
          <motion.p className={styles.sub} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
            Tell us about your project and we'll get back to you within 24 hours.
          </motion.p>
        </div>

        <div className={styles.content}>
          <motion.div
            className={styles.info}
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className={styles.infoTop}>
              <h3>Let's Talk Strategy</h3>
              <p>Whether you're starting from scratch or scaling an existing product, we're here to help you navigate the technical path forward.</p>
            </div>

            <div className={styles.contacts}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}><FaEnvelope /></div>
                <div>
                  <p className={styles.contactLabel}>Email</p>
                  <p className={styles.contactValue}>contact@ortstrategy.com</p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}><FaPhone /></div>
                <div>
                  <p className={styles.contactLabel}>Phone</p>
                  <p className={styles.contactValue}>+234-9118279968</p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}><FaMapMarkerAlt /></div>
                <div>
                  <p className={styles.contactLabel}>Location</p>
                  <p className={styles.contactValue}>Remote-first · Worldwide</p>
                </div>
              </div>
            </div>

            <div className={styles.social}>
              <p className={styles.socialLabel}>Follow Our Journey</p>
              <div className={styles.socialLinks}>
                {[FaLinkedin, FaGithub, FaTwitter].map((Icon, i) => (
                  <motion.a key={i} href="#" className={styles.socialBtn} whileHover={{ y: -3, scale: 1.1 }}>
                    <Icon />
                  </motion.a>
                ))}
              </div>
            </div>

            <div className={styles.availability}>
              <span className={styles.availDot} />
              <span>Currently accepting new projects</span>
            </div>
          </motion.div>

          <motion.div
            className={styles.formWrap}
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    placeholder="John Doe"
                    className={inputClass('name')}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    placeholder="john@company.com"
                    className={inputClass('email')}
                    required
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    onFocus={() => setFocused('phone')}
                    onBlur={() => setFocused(null)}
                    placeholder="+1 (555) 000-0000"
                    className={inputClass('phone')}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Service Needed</label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    onFocus={() => setFocused('service')}
                    onBlur={() => setFocused(null)}
                    className={`${inputClass('service')} ${styles.select}`}
                  >
                    <option value="">Select a service...</option>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  onFocus={() => setFocused('subject')}
                  onBlur={() => setFocused(null)}
                  placeholder="Tell us about your project in one line"
                  className={inputClass('subject')}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Message *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  placeholder="Describe your project, goals, timeline, and any specific requirements..."
                  className={`${inputClass('message')} ${styles.textarea}`}
                  rows={5}
                  required
                />
              </div>

              {status === 'success' && (
                <motion.div
                  className={styles.successMsg}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FaCheckCircle />
                  <span>Message sent! We'll get back to you within 24 hours.</span>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  className={styles.errorMsg}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FaExclamationCircle />
                  <span>Something went wrong. Please email us directly at contact@ortstrategy.com</span>
                </motion.div>
              )}

              <motion.button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <span className={styles.spinner} />
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message — Let's Build Together
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
