import styles from "./WarningScreen.module.css";
import { FiShield, FiRefreshCw, FiAlertTriangle, FiWifiOff } from "react-icons/fi";
import { MAX_WARNINGS, isStrikeWorthy } from "../../Route/violationConfig";

export default function WarningScreen({
  issues,
  recheck,
  warningCount = 0,
  reportFailed = false,
  proctorMessage = "",
  proctoringRequired = false,
  onEnableCamera,
  onEnableMic,
  onEnableScreenShare,
}) {

  const requestFullscreen = () => {
    document.documentElement.requestFullscreen();
  };

  // These call back into Route/ExamSecurityGuard.jsx's Hooks/useLiveProctoring
  // instance — the actual LiveKit room the proctor is watching — not a
  // disconnected local getUserMedia/getDisplayMedia call the way this
  // used to work (which could never have fixed what the proctor sees,
  // since nothing was ever attached to the real published track).
  const handleEnableCamera = async () => { await onEnableCamera?.(); };
  const handleEnableMic = async () => { await onEnableMic?.(); };
  const handleEnableScreenShare = async () => { await onEnableScreenShare?.(); };

  const messages = {
    EXIT_FULLSCREEN:      "You exited fullscreen — return immediately to continue your exam",
    TAB_SWITCH:           "You switched away from the exam tab — return to it now",
    NO_INTERNET:          "Internet disconnected",
    WINDOW_TOO_SMALL:     "Increase window size",
    CAMERA_OFF:           "Your camera is no longer being shared — the proctor can't see you",
    MIC_OFF:              "Your microphone is no longer being shared — the proctor can't hear you",
    SCREEN_SHARE_STOPPED: "Your screen is no longer being shared with the proctor",
    DEVTOOLS_OPEN:        "Developer tools must be closed",
    RIGHT_CLICK:          "Right click not allowed",
    COPY:                 "Copying exam content is not allowed",
    PASTE:                "Pasting is not allowed",
    CUT:                  "Cutting exam content is not allowed",
    KEYBOARD_SHORTCUT:    "Restricted keyboard shortcut used",
    PAGE_REFRESH:         "Page refresh detected",
    IDLE_USER:            "User inactive",
    PRINT_SCREEN:         "Screenshot attempt detected",
    ZOOM_CHANGE:          "Browser zoom not allowed",
    PROCTOR_WARNING:      proctorMessage || "A proctor has flagged your session",
  };

  const actions = {
    EXIT_FULLSCREEN:      { text: "Return to Fullscreen", action: requestFullscreen     },
    CAMERA_OFF:           { text: "Turn On Camera",       action: handleEnableCamera    },
    MIC_OFF:              { text: "Turn On Microphone",   action: handleEnableMic       },
    SCREEN_SHARE_STOPPED: { text: "Share Screen",          action: handleEnableScreenShare },
    NO_INTERNET:          { text: "Retry",                 action: recheck           },
    WINDOW_TOO_SMALL:     { text: "Resize",                action: recheck           },
    DEVTOOLS_OPEN:        { text: "Close",                 action: recheck           },
    ZOOM_CHANGE:          { text: "Reset",                 action: recheck           },
  };

  // Every issue here is reported to the server the instant it happens
  // (see violationConfig's REPORTABLE_VIOLATIONS), but only
  // high/medium-severity ones actually count toward the strike-based
  // termination threshold — a small window or a moment of inactivity
  // gets logged, not treated as putting the exam at risk the way
  // exiting fullscreen or switching tabs does. The escalation banner is
  // scoped to just those.
  const hasStrikeWorthyIssue = issues.some(isStrikeWorthy);
  const warningsLeft = Math.max(MAX_WARNINGS - warningCount, 0);

  return (
    <div className={styles.page}>
      {/* ── Atmosphere ── */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.grain} />
      <div className={styles.gridLines} aria-hidden="true">
        {[...Array(6)].map((_, i) => <div key={i} className={styles.gridLine} />)}
      </div>

      <div className={styles.card}>
        {/* amber hairline */}
        <div className={styles.cardLine} />

        {/* ── BADGE ── */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <FiShield className={styles.badgeIcon} />
          Session paused
        </div>

        {/* ── TITLE ── */}
        <h1 className={styles.title}>Action<br /><span className={styles.titleAccent}>Required</span></h1>
        <p className={styles.subtitle}>
          Resolve {issues.length === 1 ? "this issue" : `all ${issues.length} issues`} below to resume your exam.
        </p>

        {/* ── ESCALATION BANNER ──
            Only shown for violations the server actually tracks toward
            termination, and only once a strike has actually landed —
            this is the server's own count, not a guess. */}
        {hasStrikeWorthyIssue && warningCount > 0 && (
          <div className={styles.escalationBanner} role="alert">
            <FiAlertTriangle className={styles.escalationIcon} />
            <div>
              <p className={styles.escalationTitle}>
                Warning {warningCount} of {MAX_WARNINGS}
              </p>
              <p className={styles.escalationText}>
                {warningsLeft > 0
                  ? `${warningsLeft} more violation${warningsLeft === 1 ? "" : "s"} and this exam will be automatically terminated and reported to your organization.`
                  : "Your exam has been flagged for termination and reported to your organization."}
              </p>
            </div>
          </div>
        )}

        {/* Reporting couldn't reach the server — say so plainly rather
            than silently acting as if nothing happened. The violation
            is still shown and still blocks the exam below. */}
        {hasStrikeWorthyIssue && reportFailed && (
          <div className={styles.offlineNotice}>
            <FiWifiOff className={styles.offlineIcon} />
            Couldn't reach the proctoring server to log this — check your connection.
          </div>
        )}

        {/* ── DIVIDER ── */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerLabel}>
            <FiAlertTriangle className={styles.dividerIcon} />
            {issues.length} {issues.length === 1 ? "issue" : "issues"} detected
          </span>
          <span className={styles.dividerLine} />
        </div>

        {/* ── ISSUE ROWS ── */}
        <div className={styles.issueList}>
          {issues.map((issue, i) => (
            <div
              key={i}
              className={`${styles.issueRow} ${isStrikeWorthy(issue) ? styles.issueRowReportable : ""}`}
              style={{ animationDelay: `${0.28 + i * 0.07}s` }}
            >
              <div className={styles.issueLeft}>
                <span className={styles.issueDot} />
                <p className={styles.issueText}>{messages[issue]}</p>
              </div>
              {actions[issue] && (
                <button
                  onClick={actions[issue].action}
                  className={styles.fixBtn}
                >
                  {actions[issue].text}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ── RECHECK CTA ── */}
        <button onClick={recheck} className={styles.recheckBtn}>
          <FiRefreshCw className={styles.recheckIcon} />
          Recheck environment
          <span className={styles.recheckShine} />
        </button>

        {/* ── FOOTER ── */}
        <div className={styles.footer}>
          <FiShield className={styles.footerIcon} />
          <span className={styles.footerText}>
            {proctoringRequired ? "Proctoring is active during your session" : "This session is monitored for exam integrity"}
          </span>
          <span className={styles.footerBrand}>Proctor</span>
        </div>
      </div>
    </div>
  );
}
