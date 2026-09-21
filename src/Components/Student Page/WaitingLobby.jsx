import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./WaitingLobby.module.css";
import {
  FiUser, FiMail, FiShield, FiBook,
  FiMaximize, FiMinimize, FiAlertTriangle,
  FiClock, FiLock, FiUnlock
} from "react-icons/fi";

export default function WaitingLobby() {
  // Previously hardcoded default props ("Prince Tiwari", a fixed test
  // name, ...) and the route never passed real ones, so every candidate
  // saw the same fake details. This is the same session data ExamAuth
  // already fetched and stored via ValidateExamToken.
  const { examStudentData } = useSelector((state) => state.Students) || {};
  const studentName  = examStudentData?.studentName  || "—";
  const email        = examStudentData?.email        || "—";
  const organization = examStudentData?.organization || "—";
  const testName     = examStudentData?.testName     || "—";

  // Set by ValidateExamAccessKey before navigating here (see
  // Services/Oprations/Exam.js) — configured per exam in the Assign Exam
  // form, default 10s if left blank there. Previously this was just a
  // hardcoded 10, disconnected from anything the organisation set.
  const totalSeconds = useSelector((state) => state.Question?.meta?.waitingLobbyDurationSec) || 10;

  const navigate = useNavigate();

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  // Reflects whatever the browser is actually doing, not a flag this
  // component invents — ExamPreCheck's "Start Proctored Exam" action
  // already requests fullscreen, so a candidate arriving here is
  // typically already in it and should see that immediately rather
  // than being asked to turn on "Lockdown Mode" a second time.
  const [lockdown, setLockdown] = useState(() => !!document.fullscreenElement);

  useEffect(() => {
    const onFullscreenChange = () => setLockdown(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      // Previously this just called a default onTimeUp() that did
      // console.log("Time up → starting exam") and nothing else — the
      // countdown reaching zero had no actual effect on navigation.
      navigate("/assessment/questions-page");
      return;
    }
    const timer = setInterval(() => { setSecondsLeft(prev => prev - 1); }, 1000);
    return () => clearInterval(timer);
    // `navigate` is stable across renders (react-router memoizes it), so
    // this only re-runs when the countdown itself changes.
  }, [secondsLeft, navigate]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    // No need to setLockdown here anymore — the fullscreenchange
    // listener above is the single source of truth for this state.
  }

  const formatTime = (total) => {
    const m = Math.floor(total / 60).toString().padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Previously hardcoded against a 300s (5min) assumption regardless of
  // the actual countdown length, so the ring always looked nearly empty
  // from the very first frame once totalSeconds stopped being 300 — now
  // scales to whatever this exam is actually configured for. Same for
  // the "urgent" (red) threshold: fixed at 60s, it used to make even a
  // short 10s lobby appear "urgent" for its entire duration.
  const pct       = secondsLeft / totalSeconds;
  const RADIUS    = 88;
  const CIRC      = 2 * Math.PI * RADIUS;
  const offset    = CIRC - CIRC * pct;
  const isUrgent  = secondsLeft <= Math.max(1, Math.round(totalSeconds * 0.2));

  const INFO_ROWS = [
    { Icon: FiUser,   label: "Name",         value: studentName  },
    { Icon: FiMail,   label: "Email",         value: email        },
    { Icon: FiShield, label: "Organization",  value: organization },
    { Icon: FiBook,   label: "Test",          value: testName     },
  ];

  return (
    <div className={styles.page}>
      {/* Atmosphere */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.grain} />
      <div className={styles.gridLines} aria-hidden="true">
        {[...Array(6)].map((_, i) => <div key={i} className={styles.gridLine} />)}
      </div>

      <div className={styles.container}>

        {/* ── HEADER ── */}
        <div className={styles.header}>
          <div className={styles.topBadge}>
            <span className={styles.topBadgeDot} />
            <FiClock className={styles.topBadgeIcon} />
            Waiting Room
          </div>
          <h1 className={styles.title}>
            Exam Waiting<br />
            <span className={styles.titleAccent}>Room</span>
          </h1>
          <p className={styles.subtitle}>
            Your proctored exam will begin automatically. Please stay on this screen.
          </p>
        </div>

        {/* ── TWO COLUMNS ── */}
        <div className={styles.twoCol}>

          {/* LEFT — info card */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardHeaderDot} />
              <span className={styles.cardHeaderLabel}>Candidate Details</span>
            </div>
            <div className={styles.infoList}>
              {INFO_ROWS.map(({ Icon, label, value }) => (
                <div key={label} className={styles.infoRow}>
                  <div className={styles.infoRowLeft}>
                    <span className={styles.infoIcon}><Icon /></span>
                    <span className={styles.infoLabel}>{label}</span>
                  </div>
                  <span className={styles.infoValue}>{value}</span>
                </div>
              ))}
            </div>

            {/* Lockdown toggle inside info card */}
            <div className={styles.lockdownRow}>
              <div className={styles.lockdownLeft}>
                <span className={`${styles.lockIcon} ${lockdown ? styles.lockIconOn : ""}`}>
                  {lockdown ? <FiLock /> : <FiUnlock />}
                </span>
                <div>
                  <p className={styles.lockLabel}>Lockdown Mode</p>
                  <p className={styles.lockSub}>{lockdown ? "Fullscreen active" : "Enter fullscreen to lock"}</p>
                </div>
              </div>
              {/* toggle switch — unchanged logic */}
              <label className={styles.switch}>
                <input type="checkbox" checked={lockdown} onChange={toggleFullscreen} />
                <span className={styles.slider} />
              </label>
            </div>

            <button className={`${styles.fullscreenBtn} ${lockdown ? styles.fullscreenBtnActive : ""}`}
              onClick={toggleFullscreen}>
              {lockdown
                ? <><FiMinimize className={styles.fsIcon} /> Exit Fullscreen</>
                : <><FiMaximize className={styles.fsIcon} /> Enter Fullscreen Lockdown</>}
            </button>
          </div>

          {/* RIGHT — timer card */}
          <div className={styles.timerCard}>
            <div className={styles.timerCardHeader}>
              <span className={styles.cardHeaderDot} style={{ background: isUrgent ? "#f87171" : "var(--accent)" }} />
              <span className={styles.cardHeaderLabel}>
                {isUrgent ? "Exam starting soon!" : "Exam starts in"}
              </span>
            </div>

            <div className={styles.ringWrap}>
              <svg className={styles.ringSvg} viewBox="0 0 200 200">
                {/* subtle tick marks */}
                {[...Array(60)].map((_, i) => {
                  const angle  = (i / 60) * 360 - 90;
                  const rad    = (angle * Math.PI) / 180;
                  const len    = i % 5 === 0 ? 10 : 5;
                  const r1     = 100 - 14;
                  const r2     = r1 - len;
                  return (
                    <line key={i}
                      x1={100 + r1 * Math.cos(rad)} y1={100 + r1 * Math.sin(rad)}
                      x2={100 + r2 * Math.cos(rad)} y2={100 + r2 * Math.sin(rad)}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={i % 5 === 0 ? 2 : 1}
                    />
                  );
                })}
                {/* track */}
                <circle cx="100" cy="100" r={RADIUS} className={styles.ringTrack} />
                {/* progress */}
                <circle cx="100" cy="100" r={RADIUS}
                  className={styles.ringProgress}
                  style={{
                    strokeDasharray:  CIRC,
                    strokeDashoffset: offset,
                    stroke: isUrgent ? "#f87171" : "var(--accent)",
                    filter: isUrgent
                      ? "drop-shadow(0 0 8px rgba(248,113,113,0.6))"
                      : "drop-shadow(0 0 8px rgba(245,158,11,0.55))",
                  }}
                />
              </svg>

              <div className={styles.timerCenter}>
                <span className={`${styles.timerText} ${isUrgent ? styles.timerUrgent : ""}`}>
                  {formatTime(secondsLeft)}
                </span>
                <span className={styles.timerSub}>remaining</span>
                {isUrgent && (
                  <span className={styles.urgentPill}>
                    <FiAlertTriangle className={styles.urgentIcon} /> Almost time!
                  </span>
                )}
              </div>
            </div>

            {/* progress bar strip */}
            <div className={styles.timerBar}>
              <div className={styles.timerBarFill}
                style={{
                  width: `${pct * 100}%`,
                  background: isUrgent
                    ? "linear-gradient(90deg,#f87171,#fca5a5)"
                    : "linear-gradient(90deg,#f59e0b,#fbbf24)",
                }}
              />
            </div>
            <p className={styles.timerNote}>
              {secondsLeft > 0
                ? `Auto-starts in ${formatTime(secondsLeft)}`
                : "Launching your exam…"}
            </p>
          </div>
        </div>

        {/* ── FOOTER WARNING ── */}
        <div className={styles.footerWarning}>
          <FiAlertTriangle className={styles.footerIcon} />
          <p>
            Do not close this tab, switch applications, or leave this screen.
            Your session is monitored — any violation may result in disqualification.
          </p>
        </div>

      </div>
    </div>
  );
}