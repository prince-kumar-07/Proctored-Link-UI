import React, { useEffect, useState } from "react";
import styles from "./ExamSubmitted.module.css";
import { Link } from "react-router-dom";
import {
  FiShield, FiCheckCircle, FiArrowRight,
  FiHome, FiCpu, FiBarChart2, FiMail, FiClock
} from "react-icons/fi";

const NEXT_STEPS = [
  { Icon: FiCpu,       text: "AI + human review will evaluate the exam"  },
  { Icon: FiBarChart2, text: "Results will appear in your dashboard"      },
  { Icon: FiMail,      text: "You will receive an email notification"     },
  { Icon: FiClock,     text: "Processing time: 24–48 hours"              },
];

export default function ExamSubmitted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div className={styles.page}>
      {/* ── Atmosphere ── */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />
      <div className={styles.grain} />
      <div className={styles.gridLines} aria-hidden="true">
        {[...Array(6)].map((_, i) => <div key={i} className={styles.gridLine} />)}
      </div>

      <div className={`${styles.container} ${mounted ? styles.containerIn : ""}`}>

        {/* ── ICON ── */}
        <div className={styles.iconRing}>
          <div className={styles.iconRingOuter} />
          <div className={styles.iconRingMid}   />
          <div className={styles.iconRingInner}>
            <FiCheckCircle className={styles.checkIcon} />
          </div>
          <div className={styles.orbitDot}  />
          <div className={styles.orbitDot2} />
        </div>

        {/* ── TAG ── */}
        <div className={styles.tag}>
          <span className={styles.tagDot} />
          <FiShield className={styles.tagIcon} />
          Submission Confirmed
        </div>

        {/* ── TITLE ── */}
        <h1 className={styles.title}>
          Exam Submitted<br />
          <span className={styles.titleAccent}>Successfully</span>
        </h1>

        <p className={styles.subtitle}>
          Your responses have been securely recorded and encrypted.
        </p>

        {/* ── NEXT STEPS CARD ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardHeaderDot} />
            <span className={styles.cardHeaderTitle}>What Happens Next?</span>
            <span className={styles.cardHeaderBadge}>{NEXT_STEPS.length} steps</span>
          </div>

          <div className={styles.stepList}>
            {NEXT_STEPS.map(({ Icon, text }, i) => (
              <div
                key={i}
                className={styles.stepRow}
                style={{ animationDelay: `${0.2 + i * 0.08}s` }}
              >
                <span className={styles.stepNum}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.stepIcon}><Icon /></span>
                <span className={styles.stepText}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── THANK YOU ── */}
        <p className={styles.thankYou}>
          Thank you for completing the assessment. Good luck with your results!
        </p>

        {/* ── DIVIDER ── */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>You're all done</span>
          <span className={styles.dividerLine} />
        </div>

        {/* ── ACTIONS ──
            "Go to Dashboard" previously linked to /dashboard, which is
            behind PrivateRoute and requires an organisation login — a
            student who just finished an exam has no access to it. */}
        <div className={styles.actions}>
          <Link to="/" className={styles.btnPrimary}>
            <FiHome className={styles.btnIcon} />
            Return Home
            <FiArrowRight className={styles.btnArrow} />
          </Link>
          <a href="mailto:support@proctoredlink.com" className={styles.btnOutline}>
            <FiMail className={styles.btnIcon} />
            Contact Support
          </a>
        </div>

        {/* ── FOOTER ── */}
        <footer className={styles.footer}>
          <FiShield className={styles.footerIcon} />
          ProctoredLink — Secure. Fair. Trusted.
        </footer>

      </div>
    </div>
  );
}