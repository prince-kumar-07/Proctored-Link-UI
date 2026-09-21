import React, { useEffect, useState } from "react";
import styles from "./ExamTerminated.module.css";
import {
  FiShield, FiAlertTriangle, FiArrowLeft,
  FiMail, FiUsers, FiMonitor, FiEye,
  FiMaximize, FiCopy, FiCamera, FiX
} from "react-icons/fi";

const REASONS = [
  { Icon: FiUsers,    text: "Multiple faces detected in frame"           },
  { Icon: FiMonitor,  text: "Tab switching or window focus lost"          },
  { Icon: FiCopy,     text: "Unauthorized copy / paste activity"          },
  { Icon: FiEye,      text: "Suspicious eye movement pattern detected"    },
  { Icon: FiMaximize, text: "Full-screen lockdown violation"              },
  { Icon: FiCamera,   text: "Camera feed interrupted or obstructed"       },
];

export default function ExamTerminated() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

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
          <div className={styles.iconRingInner}>
            <FiX className={styles.iconX} />
          </div>
          <div className={styles.orbitDot} />
          <div className={styles.orbitDot2} />
        </div>

        {/* ── TAG ── */}
        <div className={styles.tag}>
          <FiShield className={styles.tagIcon} />
          Session Terminated
        </div>

        {/* ── TITLE ── */}
        <h1 className={styles.title}>
          Exam<br />
          <span className={styles.titleAccent}>Terminated</span>
        </h1>

        <p className={styles.subtitle}>
          Your session has been forcefully ended due to a detected violation
          of exam conduct rules or security policy. This incident has been logged.
        </p>

        {/* ── REASONS CARD ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiAlertTriangle className={styles.cardHeaderIcon} />
            <span className={styles.cardHeaderTitle}>Possible Reasons</span>
            <span className={styles.cardHeaderCount}>{REASONS.length} triggers</span>
          </div>

          <div className={styles.reasonGrid}>
            {REASONS.map(({ Icon, text }, i) => (
              <div
                key={i}
                className={styles.reasonItem}
                style={{ animationDelay: `${0.15 + i * 0.07}s` }}
              >
                <span className={styles.reasonIcon}><Icon /></span>
                <span className={styles.reasonText}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── WARNING STRIP ── */}
        <div className={styles.warnStrip}>
          <FiAlertTriangle className={styles.warnStripIcon} />
          <p className={styles.warnStripText}>
            Repeated violations may result in permanent disqualification and reporting
            to your organization or institution.
          </p>
        </div>

        {/* ── DIVIDER ── */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>What's next?</span>
          <span className={styles.dividerLine} />
        </div>

        {/* ── ACTIONS ── */}
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => window.location.href = "/"}>
            <FiArrowLeft className={styles.btnIcon} />
            Return Home
          </button>
          <a className={styles.btnOutline} href="mailto:support@proctoredlink.com">
            <FiMail className={styles.btnIcon} />
            Contact Support
          </a>
        </div>

        {/* ── FOOTER ── */}
        <p className={styles.footer}>
          <FiShield className={styles.footerIcon} />
          All exam sessions are monitored and recorded for security purposes.
        </p>

      </div>
    </div>
  );
}