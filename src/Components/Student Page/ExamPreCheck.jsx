import React, { useState, useEffect } from 'react';
import styles from './ExamPreCheck.module.css';
import {
  FiWifi, FiCamera, FiMic, FiMonitor,
  FiCheckCircle, FiXCircle, FiAlertCircle,
  FiLoader, FiShield, FiArrowRight, FiRefreshCw, FiMinusCircle
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

/* ── CHECK META — icons + labels ── */
const CHECK_META = {
  internet:   { Icon: FiWifi,     label: "Internet",      desc: "Network connectivity" },
  camera:     { Icon: FiCamera,   label: "Camera",        desc: "Video capture device" },
  microphone: { Icon: FiMic,      label: "Microphone",    desc: "Audio input device"   },
  screen:     { Icon: FiMonitor,  label: "Entire Screen", desc: "Full display capture" },
};

export default function ExamPreCheck() {
  // Set by ValidateExamAccessKey before navigating here (see
  // Services/Oprations/Exam.js) — already in Redux by the time this
  // page mounts. Camera/mic/screen access is only ever needed for a
  // live-proctored exam (Route/ExamSecurityGuard.jsx owns that gate
  // later); a non-proctored exam has no use for any of it here, so
  // those three checks are skipped outright rather than demanding
  // permissions the exam will never actually use.
  const proctoringRequired = useSelector((state) => state.Question?.meta?.proctoringRequired) === true;
  const requiredKeys = proctoringRequired ? ['internet', 'camera', 'microphone', 'screen'] : ['internet'];

  const [checks, setChecks] = useState({
    internet:   { status: 'pending', message: 'Checking connection...' },
    camera:     proctoringRequired ? { status: 'pending', message: 'Requesting camera...' }     : { status: 'skipped', message: 'Not required for this exam' },
    microphone: proctoringRequired ? { status: 'pending', message: 'Requesting microphone...' } : { status: 'skipped', message: 'Not required for this exam' },
    screen:     proctoringRequired ? { status: 'pending', message: 'Requesting screen share...' }: { status: 'skipped', message: 'Not required for this exam' },
  });

  const [allPassed, setAllPassed] = useState(false);
  const navigate = useNavigate()
  const { uniqueAccessToken } = useParams();

  const updateCheck = (key, status, message) => {
    setChecks((prev) => ({ ...prev, [key]: { status, message } }));
  };

  const checkInternet = async () => {
    try {
      const start = Date.now();
      await fetch('https://www.google.com/favicon.ico?_=' + Date.now(), { mode: 'no-cors' });
      const latency = Date.now() - start;
      updateCheck('internet', latency < 800 ? 'success' : 'warning',
        latency < 800 ? 'Stable & fast connection' : 'Connection is slow');
    } catch {
      updateCheck('internet', 'error', 'No internet detected');
    }
  };

  const checkCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      updateCheck('camera', 'success', 'Camera ready');
    } catch {
      updateCheck('camera', 'error', 'Camera access denied');
    }
  };

  const checkMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      updateCheck('microphone', 'success', 'Microphone ready');
    } catch {
      updateCheck('microphone', 'error', 'Microphone access denied');
    }
  };

  const checkScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const [track] = stream.getVideoTracks();

      // getDisplayMedia() succeeds whether the candidate shares their
      // entire screen, a single window, or a browser tab — the browser
      // treats all three as a granted permission. Proctoring needs the
      // whole screen, so the surface actually chosen has to be checked
      // before this counts as passing.
      // Chromium reports this via getSettings().displaySurface; browsers
      // that don't expose it leave `surface` undefined, and we let those
      // through rather than blocking on a signal we can't read.
      const surface = track.getSettings?.().displaySurface;
      stream.getTracks().forEach(t => t.stop());

      if (surface && surface !== 'monitor') {
        updateCheck(
          'screen',
          'error',
          'You shared a window/tab — choose "Entire Screen" instead',
        );
        return;
      }

      updateCheck('screen', 'success', 'Entire screen shared');
    } catch {
      updateCheck('screen', 'error', 'Screen sharing denied');
    }
  };

  useEffect(() => {
    const runAllChecks = async () => {
      const toRun = [checkInternet()];
      if (proctoringRequired) toRun.push(checkCamera(), checkMicrophone(), checkScreen());
      await Promise.all(toRun);
    };
    runAllChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const passed = requiredKeys.every(k => checks[k].status === 'success');
    setAllPassed(passed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checks]);

  const passedCount = requiredKeys.filter(k => checks[k].status === 'success').length;
  const totalCount  = requiredKeys.length;
  const progress    = (passedCount / totalCount) * 100;

  const handleStart = () => {
    if (!allPassed) return;

    // Must be called synchronously inside this click handler — the
    // Fullscreen API requires a direct user gesture, and awaiting
    // anything first (or deferring into a promise chain) causes some
    // browsers to reject the request. Previously nothing here ever
    // called it at all: the "screen" check above only confirms the
    // candidate SHARED their screen (getDisplayMedia), which is a
    // separate, unrelated browser API from actually locking the exam
    // tab into fullscreen.
    const el = document.documentElement;
    const req = el.requestFullscreen?.() || el.webkitRequestFullscreen?.();
    if (req && typeof req.catch === "function") req.catch(() => {});

    navigate(`/assessment/exam-instructions/${uniqueAccessToken}`);
  };

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

        {/* ── LEFT PANEL — title + progress ── */}
        <div className={styles.leftPanel}>
          <div className={styles.topBadge}>
            <span className={styles.topBadgeDot} />
            <FiShield className={styles.topBadgeIcon} />
            System Verification
          </div>

          <h1 className={styles.title}>
            Pre‑Exam<br />
            <span className={styles.titleAccent}>Verification</span>
          </h1>

          <p className={styles.subtitle}>
            {proctoringRequired
              ? "Grant all required permissions to ensure a secure and uninterrupted proctored exam experience."
              : "This exam isn't live-proctored — just checking your connection before you begin."}
          </p>

          {/* Progress ring */}
          <div className={styles.progressBlock}>
            <div className={styles.progressRing}>
              <svg viewBox="0 0 100 100" className={styles.progressSvg}>
                <circle cx="50" cy="50" r="42" className={styles.progressTrack} />
                <circle cx="50" cy="50" r="42" className={styles.progressFill}
                  style={{ strokeDashoffset: `${264 - (264 * progress) / 100}` }}
                />
              </svg>
              <div className={styles.progressCenter}>
                <span className={styles.progressNum}>{passedCount}</span>
                <span className={styles.progressDen}>/{totalCount}</span>
              </div>
            </div>
            <div className={styles.progressInfo}>
              <p className={styles.progressLabel}>
                {allPassed ? "All checks passed" : `${passedCount} of ${totalCount} checks passed`}
              </p>
              <p className={styles.progressSub}>
                {allPassed
                  ? "Ready to begin your exam"
                  : "Waiting for permissions…"}
              </p>
            </div>
          </div>

          {/* Retry hint */}
          {!allPassed && (
            <p className={styles.retryText}>
              <FiRefreshCw className={styles.retryIcon} />
              If a permission is blocked, allow it in browser settings and refresh.
            </p>
          )}
        </div>

        {/* ── RIGHT PANEL — checks + button ── */}
        <div className={styles.rightPanel}>

          {/* Progress bar across top of card */}
          <div className={styles.cardProgress}>
            <div className={styles.cardProgressFill} style={{ width: `${progress}%` }} />
          </div>

          <div className={styles.checkList}>
            {Object.entries(checks).map(([key, { status, message }], idx) => {
              const { Icon, label, desc } = CHECK_META[key];
              return (
                <div
                  key={key}
                  className={styles.checkItem}
                  style={{ animationDelay: `${idx * 0.09}s` }}
                  data-status={status}
                >
                  {/* Icon chip */}
                  <div className={`${styles.checkIconWrap} ${styles[`icon_${status}`]}`}>
                    <Icon className={styles.checkIcon} />
                  </div>

                  {/* Text */}
                  <div className={styles.checkBody}>
                    <div className={styles.checkTop}>
                      <span className={styles.checkLabel}>{label}</span>
                      <span className={styles.checkDesc}>{desc}</span>
                    </div>
                    <span className={`${styles.checkMessage} ${styles[`msg_${status}`]}`}>
                      {message}
                    </span>
                  </div>

                  {/* Status indicator */}
                  <div className={`${styles.statusBadge} ${styles[`badge_${status}`]}`}>
                    {status === 'pending' && (
                      <>
                        <FiLoader className={styles.spinIcon} />
                        <span>Checking</span>
                      </>
                    )}
                    {status === 'success' && (
                      <>
                        <FiCheckCircle />
                        <span>Ready</span>
                      </>
                    )}
                    {status === 'error' && (
                      <>
                        <FiXCircle />
                        <span>Denied</span>
                      </>
                    )}
                    {status === 'warning' && (
                      <>
                        <FiAlertCircle />
                        <span>Warning</span>
                      </>
                    )}
                    {status === 'skipped' && (
                      <>
                        <FiMinusCircle />
                        <span>Not Required</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Proceed Button ──
              Previously had two separate onClick handlers stacked on
              top of each other: the button fired a dead `onProceed` prop
              nothing ever passed, while the inner span (only rendered
              once passed) did the real navigation — both fired on every
              click. One handler now owns both the fullscreen request and
              the navigation. */}
          <button
            className={`${styles.btnProceed} ${allPassed ? styles.btnEnabled : styles.btnDisabled}`}
            disabled={!allPassed}
            onClick={handleStart}
          >
            {allPassed ? (
              <span className={styles.btnInner}>
                {proctoringRequired ? "Start Proctored Exam" : "Start Exam"}
                <FiArrowRight className={styles.btnArrow} />
                <span className={styles.btnShine} />
              </span>
            ) : (
              <span className={styles.btnInner}>
                <FiLoader className={styles.btnSpinner} />
                Waiting for all permissions…
              </span>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}