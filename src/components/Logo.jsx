import { motion } from 'framer-motion'
import styles from './Logo.module.css'

export default function Logo({ size = 44, showText = true, onClick }) {
  return (
    <motion.div
      className={styles.lockup}
      onClick={onClick}
      whileHover="hover"
      initial="rest"
      animate="rest"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className={styles.markWrap}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.svg}
        >
          <defs>
            <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1d6bf3" />
              <stop offset="100%" stopColor="#00c8ff" />
            </linearGradient>
            <linearGradient id="lg2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00c8ff" />
              <stop offset="100%" stopColor="#1d6bf3" />
            </linearGradient>
            <filter id="centerGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Outer diamond ── */}
          <motion.path
            d="M24 1 L47 24 L24 47 L1 24 Z"
            stroke="url(#lg1)"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              rest: { opacity: 1 },
              hover: { opacity: 1, filter: 'drop-shadow(0 0 4px rgba(0,200,255,0.6))' },
            }}
            transition={{ duration: 0.3 }}
          />

          {/* ── Connector spokes: outer vertices → inner diamond ── */}
          {[
            [24, 1, 24, 13],
            [47, 24, 35, 24],
            [24, 47, 24, 35],
            [1, 24, 13, 24],
          ].map(([x1, y1, x2, y2], i) => (
            <motion.line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="url(#lg1)"
              strokeWidth="1"
              strokeLinecap="round"
              variants={{
                rest: { opacity: 0.45 },
                hover: { opacity: 0.85 },
              }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            />
          ))}

          {/* ── Inner diamond ── */}
          <motion.path
            d="M24 13 L35 24 L24 35 L13 24 Z"
            stroke="url(#lg2)"
            strokeWidth="1.2"
            fill="rgba(29,107,243,0.08)"
            strokeLinejoin="round"
            variants={{
              rest: { rotate: 0, opacity: 1 },
              hover: { rotate: 45, opacity: 1 },
            }}
            style={{ transformOrigin: '24px 24px' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />

          {/* ── Inner cross (subtle axis lines) ── */}
          <line x1="24" y1="13" x2="24" y2="35" stroke="url(#lg1)" strokeWidth="0.5" opacity="0.2" />
          <line x1="13" y1="24" x2="35" y2="24" stroke="url(#lg1)" strokeWidth="0.5" opacity="0.2" />

          {/* ── Inner diamond corner nodes ── */}
          {[[24, 13], [35, 24], [24, 35], [13, 24]].map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={cx} cy={cy} r="1.6"
              fill="url(#lg1)"
              filter="url(#nodeGlow)"
              variants={{
                rest: { opacity: 0.6, scale: 1 },
                hover: { opacity: 1, scale: 1.3 },
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            />
          ))}

          {/* ── Outer corner nodes ── */}
          {[[24, 1], [47, 24], [24, 47], [1, 24]].map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={cx} cy={cy} r="2.2"
              fill="url(#lg1)"
              filter="url(#nodeGlow)"
              variants={{
                rest: { opacity: 0.9, scale: 1 },
                hover: { opacity: 1, scale: 1.2 },
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            />
          ))}

          {/* ── Centre node (pulsing) ── */}
          <motion.circle
            cx="24" cy="24" r="4.5"
            fill="url(#lg1)"
            filter="url(#centerGlow)"
            animate={{ scale: [1, 1.18, 1], opacity: [1, 0.75, 1] }}
            transition={{ duration: 2.6, ease: 'easeInOut', repeat: Infinity }}
          />
          <circle cx="24" cy="24" r="2.2" fill="#fff" opacity="0.9" />

          {/* ── Outer ping ring (auto-animates) ── */}
          <motion.circle
            cx="24" cy="24" r="7"
            stroke="url(#lg1)"
            strokeWidth="0.7"
            fill="none"
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 2.6, ease: 'easeOut', repeat: Infinity }}
            style={{ transformOrigin: '24px 24px' }}
          />
        </svg>
      </div>

      {showText && (
        <div className={styles.wordmark}>
          <span className={styles.ort}>ORT</span>
          <span className={styles.divider} />
          <div className={styles.textStack}>
            <span className={styles.strategy}>Strategy</span>
            <span className={styles.tech}>Tech Services</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
