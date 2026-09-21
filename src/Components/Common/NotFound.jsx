import { Link } from "react-router-dom"; // or use your router's Link
import styles from "./NotFound.module.css";
import { motion as Motion, useReducedMotion } from "framer-motion";

export default function NotFound() {
  const reduce = useReducedMotion();

  return (
    <div className={styles.page}>
      <Motion.div
        className={styles.container}
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={reduce ? false : { opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.iconWrapper}>
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="url(#grad)" strokeWidth="2" />
            <path
              d="M9 9L15 15M15 9L9 15"
              stroke="url(#grad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="grad" x1="2" y1="2" x2="22" y2="22">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Page Not Found</h2>

        <p className={styles.message}>
          The page you're looking for doesn't exist or has been moved.
          <br />
          Let's get you back on track.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.btnPrimary}>
            Return to Home
          </Link>

          <Link to="/docs" className={styles.btnOutline}>
            View Documentation
          </Link>
        </div>

        <div className={styles.hint}>
          <span>Need help?</span>
          <a href="mailto:support@proctoredlink.com" className={styles.link}>
            Contact Support
          </a>
        </div>
      </Motion.div>
    </div>
  );
}