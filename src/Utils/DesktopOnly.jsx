import { useEffect, useState } from "react";
import styles from "./DesktopOnly.module.css";
import { FiMonitor, FiShield, FiRotateCw, FiAlertTriangle } from "react-icons/fi";

export default function DesktopOnly({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  if (isMobile) {
    return (
      <div className={styles.page}>
        {/* ── Atmosphere ── */}
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.grain} />
        <div className={styles.gridLines} aria-hidden="true">
          {[...Array(6)].map((_, i) => <div key={i} className={styles.gridLine} />)}
        </div>

        <div className={styles.container}>

          {/* ── ICON ── */}
          <div className={styles.iconRing}>
            <div className={styles.iconRingOuter} />
            <div className={styles.iconRingInner}>
              <FiMonitor className={styles.monitorIcon} />
            </div>
            <div className={styles.orbitDot}  />
            <div className={styles.orbitDot2} />
          </div>

          {/* ── TAG ── */}
          <div className={styles.tag}>
            <span className={styles.tagDot} />
            <FiShield className={styles.tagIcon} />
            Desktop Required
          </div>

          {/* ── TITLE ── */}
          <h2 className={styles.title}>
            Switch to<br />
            <span className={styles.titleAccent}>Desktop</span>
          </h2>

          {/* ── MESSAGE ── */}
          <p className={styles.message}>
            This platform is optimized for desktop and larger screens to ensure
            the best proctoring experience, clear dashboard visibility, and full
            security features.
          </p>

          <p className={styles.secondary}>
            Please open ProctoredLink on a laptop or desktop computer.
          </p>

          {/* ── DIVIDER ── */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>
              <FiAlertTriangle className={styles.dividerIcon} />
              Quick tip
            </span>
            <span className={styles.dividerLine} />
          </div>

          {/* ── HINT ── */}
          <div className={styles.hint}>
            <span className={styles.hintIcon}><FiRotateCw /></span>
            <p className={styles.hintText}>
              <span className={styles.hintLabel}>Tip: </span>
              If you're on a tablet, try rotating to landscape or enabling
              "Desktop site" in your browser.
            </p>
          </div>

          {/* ── FOOTER ── */}
          <p className={styles.footer}>
            <FiShield className={styles.footerIcon} />
            ProctoredLink — Secure. Fair. Trusted.
          </p>

        </div>
      </div>
    );
  }

  return children;
}