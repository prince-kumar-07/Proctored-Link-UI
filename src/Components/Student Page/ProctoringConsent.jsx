import { useEffect, useRef, useState } from "react";
import styles from "./ProctoringConsent.module.css";
import { FiShield, FiVideo, FiMic, FiMonitor, FiAlertTriangle, FiLoader, FiCheck, FiWifiOff } from "react-icons/fi";

const DEVICE_ROWS = [
  { key: "camera", label: "Camera", Icon: FiVideo },
  { key: "mic", label: "Microphone", Icon: FiMic },
  { key: "screen", label: "Screen share", Icon: FiMonitor },
];

const RADIUS = 46;
const CIRC = 2 * Math.PI * RADIUS;

/**
 * One-time gate shown before the exam page becomes usable when live
 * proctoring is enabled (Route/ExamSecurityGuard.jsx). getDisplayMedia
 * (screen share) only works from a direct user gesture, so button
 * clicks here are what trigger useLiveProctoring's start()/enable*().
 *
 * Camera, mic and screen share are granted independently — if only one
 * is denied or cancelled, the other two stay granted and only that one
 * needs a retry, via its own button below, rather than the old
 * all-or-nothing flow where any single failure discarded everything
 * and forced starting over from scratch.
 *
 * A connection that can't be established at all (LiveKit unreachable or
 * unconfigured) no longer dead-ends here — onStart (ExamSecurityGuard's
 * startWithRetry) keeps retrying for up to connectTimeoutSec, shown as a
 * countdown ring, and once that runs out this hands off to onDegraded
 * rather than blocking the candidate indefinitely on an infrastructure
 * problem that isn't theirs to fix.
 */
export default function ProctoringConsent({
  status,
  errorMessage,
  devices,
  notConfigured = false,
  pendingDevice = null,
  retrying = false,
  secondsLeft = 0,
  connectTimeoutSec = 30,
  onStart,
  onDegraded,
  onEnableCamera,
  onEnableMic,
  onEnableScreenShare,
}) {
  const connecting = status === "connecting" || pendingDevice === "all";
  const attempted = status === "error" || devices.camera || devices.mic || devices.screen;

  // Brief hand-off shown once onStart gives up (either instantly, for a
  // hard NOT_CONFIGURED, or after the retry countdown below runs out)
  // before actually letting the candidate through — so this doesn't
  // just vanish without explanation.
  const [degrading, setDegrading] = useState(false);

  const enableFns = { camera: onEnableCamera, mic: onEnableMic, screen: onEnableScreenShare };

  const handlePrimaryClick = async () => {
    const ok = await onStart();
    if (!ok) setDegrading(true);
  };

  // Auto-attempt the connection the instant this gate mounts, rather
  // than making the candidate click first — connect() fails (and this
  // component's degrade hand-off kicks in) before ever touching a
  // gesture-requiring API like getDisplayMedia, so there's no technical
  // reason to wait for a click when the outcome is already known to be
  // NOT_CONFIGURED. The button stays as a manual retry/fallback for
  // whichever devices still need a real user gesture (screen share) once
  // a connection genuinely succeeds. Empty deps: this must fire exactly
  // once per mount, not every time onStart's identity changes.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    handlePrimaryClick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ExamSecurityGuard re-renders roughly every 1.5s regardless of
  // whether anything actually changed (checkEnvironment's interval
  // creates new array references even when a violation is absent), so
  // onDegraded is a fresh function identity almost every render. Reading
  // it through a ref — updated every render, but not a dependency —
  // means the handoff timer below is set once and actually fires,
  // instead of being cancelled and restarted before it ever gets there.
  const onDegradedRef = useRef(onDegraded);
  onDegradedRef.current = onDegraded;

  useEffect(() => {
    if (!degrading) return;
    const t = setTimeout(() => onDegradedRef.current?.(), 1800);
    return () => clearTimeout(t);
  }, [degrading]);

  if (degrading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.iconRing}>
            <FiWifiOff />
          </div>
          <h1 className={styles.title}>Continuing Without Live Proctoring</h1>
          <p className={styles.subtitle}>
            We couldn't establish a live camera/mic/screen connection. You're being let into the
            exam anyway — your exam administrator has been notified that this session ran without
            live monitoring.
          </p>
          <FiLoader className={`${styles.spin} ${styles.degradingSpinner}`} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconRing}>
          <FiShield />
        </div>

        <h1 className={styles.title}>Live Proctoring Session</h1>
        <p className={styles.subtitle}>
          This exam is monitored live. You'll need to share your camera, microphone and full
          screen before you can begin.
        </p>

        {retrying && (
          <div className={styles.retryRingWrap}>
            <svg className={styles.retryRingSvg} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={RADIUS} className={styles.retryRingTrack} />
              <circle cx="50" cy="50" r={RADIUS} className={styles.retryRingFill}
                style={{
                  strokeDasharray: CIRC,
                  strokeDashoffset: CIRC - (CIRC * secondsLeft) / connectTimeoutSec,
                }}
              />
            </svg>
            <div className={styles.retryRingCenter}>
              <span className={styles.retryRingNum}>{secondsLeft}</span>
              <span className={styles.retryRingUnit}>sec</span>
            </div>
          </div>
        )}

        {retrying && (
          <p className={styles.retryNote}>
            Having trouble connecting — retrying automatically. If this doesn't resolve in time
            you'll be let into the exam without live proctoring.
          </p>
        )}

        <div className={styles.requirements}>
          {DEVICE_ROWS.map(({ key, label, Icon }) => {
            const granted = devices[key];
            const pending = pendingDevice === key;
            return (
              <div key={key} className={`${styles.reqItem} ${granted ? styles.reqItemGranted : ""}`}>
                <Icon /> {label}
                {granted ? (
                  <FiCheck className={styles.reqCheck} />
                ) : attempted ? (
                  <button
                    type="button"
                    className={styles.grantBtn}
                    onClick={() => enableFns[key]?.()}
                    disabled={connecting || pending}
                  >
                    {pending ? <FiLoader className={styles.spin} /> : "Grant"}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {status === "error" && !retrying && (
          <div className={styles.errorBox}>
            <FiAlertTriangle /> {notConfigured ? "Live proctoring isn't configured yet." : (errorMessage || "Something went wrong — please try again.")}
          </div>
        )}

        <button className={styles.startBtn} onClick={handlePrimaryClick} disabled={connecting || retrying}>
          {(connecting || retrying) ? <FiLoader className={styles.spin} /> : <FiShield />}
          {retrying ? `Retrying… ${secondsLeft}s` : connecting ? "Connecting…" : attempted ? "Retry All" : "Start Secure Proctoring Session"}
        </button>

        <p className={styles.footer}>
          <FiShield /> Your session is only visible to proctors assigned to this exam.
        </p>
      </div>
    </div>
  );
}
