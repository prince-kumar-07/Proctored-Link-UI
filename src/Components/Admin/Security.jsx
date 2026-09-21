import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Security.module.css";
import {
  VscShield,
  VscUnlock,
  VscWarning,
} from "react-icons/vsc";
import {
  FiUsers, FiMonitor, FiCopy, FiEye, FiMaximize, FiPhoneCall,
  FiWifiOff, FiMinimize2, FiCode, FiMousePointer, FiCommand,
  FiRefreshCw, FiClock, FiCamera, FiAlertTriangle,
} from "react-icons/fi";
import { fetchSecurityOverview, unlockExamSession } from "../../Services/Oprations/Admin";

const EVENT_META = {
  tab_switch:         { icon: FiMonitor,     label: "Tab Switch" },
  multiple_faces:     { icon: FiUsers,       label: "Multiple Faces" },
  no_face:            { icon: FiEye,         label: "No Face Detected" },
  phone_detected:     { icon: FiPhoneCall,   label: "Phone Detected" },
  fullscreen_exit:    { icon: FiMaximize,    label: "Fullscreen Exit" },
  copy_paste:         { icon: FiCopy,        label: "Copy / Paste" },
  network_disconnect: { icon: FiWifiOff,     label: "Network Disconnect" },
  window_too_small:   { icon: FiMinimize2,   label: "Window Too Small" },
  devtools_open:      { icon: FiCode,        label: "DevTools Open" },
  right_click:        { icon: FiMousePointer,label: "Right Click" },
  keyboard_shortcut:  { icon: FiCommand,     label: "Keyboard Shortcut" },
  page_refresh:       { icon: FiRefreshCw,   label: "Page Refresh" },
  idle_user:          { icon: FiClock,       label: "Idle User" },
  print_screen:       { icon: FiCamera,      label: "Print Screen" },
};

const TERMINATION_LABELS = {
  auto_misconduct:    "Auto Misconduct",
  proctor_manual:     "Manual by Proctor",
  network_issue:      "Network Issue",
  security_violation: "Security Violation",
  system_termination: "System Termination",
  unspecified:         "Unspecified",
};

const SEVERITY_META = {
  high:   { color: "#f87171", bg: "rgba(248,113,113,0.10)" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  low:    { color: "#60a5fa", bg: "rgba(96,165,250,0.10)" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Security() {
  const { security } = useSelector((state) => state.Admin) || { security: null };
  const dispatch = useDispatch();

  useEffect(() => {
    fetchSecurityOverview(dispatch);
  }, []);

  const maxTermination = useMemo(() => {
    if (!security) return 1;
    return Math.max(1, ...Object.values(security.terminationBreakdown));
  }, [security]);

  if (!security) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>Loading security overview…</div>
        </div>
      </div>
    );
  }

  const { violationFeed, lockedSessions, terminationBreakdown, misconductTypeTotals } = security;

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.grain} />

      <div className={styles.container}>
        {/* ── HEADER ── */}
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <span className={styles.logoMark}><VscShield /></span>
            <div>
              <h1 className={styles.pageTitle}>Security</h1>
              <p className={styles.pageSubtitle}>
                Proctoring violations, terminations and locked sessions across the platform
              </p>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{lockedSessions.length}</span>
              <span className={styles.statLabel}>Locked</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{violationFeed.length}</span>
              <span className={styles.statLabel}>Recent Violations</span>
            </div>
          </div>
        </header>

        {/* ── MISCONDUCT TYPE TOTALS ── */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Misconduct Totals (all-time)</div>
          <div className={styles.miscGrid}>
            {Object.entries(misconductTypeTotals).map(([key, count]) => {
              const meta = EVENT_META[key];
              const Icon = meta?.icon || FiAlertTriangle;
              return (
                <div className={styles.miscTile} key={key}>
                  <Icon className={styles.miscIcon} />
                  <span className={styles.miscValue}>{count}</span>
                  <span className={styles.miscLabel}>{meta?.label || key}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.gridTwo}>
          {/* ── LOCKED SESSIONS ── */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Locked Sessions</div>
            {lockedSessions.length === 0 ? (
              <div className={styles.emptyMini}>No locked sessions right now</div>
            ) : (
              <div className={styles.lockedList}>
                {lockedSessions.map((s) => (
                  <div className={styles.lockedRow} key={s._id}>
                    <div className={styles.lockedInfo}>
                      <span className={styles.lockedName}>{s.studentId?.name || "Unknown student"}</span>
                      <span className={styles.lockedSub}>
                        {s.organisationId?.name} · {s.questionBankId?.title}
                      </span>
                    </div>
                    <button
                      className={styles.unlockBtn}
                      onClick={() => unlockExamSession(dispatch, s._id)}
                    >
                      <VscUnlock /> Unlock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── TERMINATION BREAKDOWN ── */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Terminations by Reason</div>
            {Object.keys(terminationBreakdown).length === 0 ? (
              <div className={styles.emptyMini}>No terminated sessions yet</div>
            ) : (
              <div className={styles.barList}>
                {Object.entries(terminationBreakdown).map(([key, count]) => (
                  <div className={styles.barRow} key={key}>
                    <span className={styles.barLabel}>{TERMINATION_LABELS[key] || key}</span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${(count / maxTermination) * 100}%` }}
                      />
                    </div>
                    <span className={styles.barValue}>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── VIOLATION FEED ── */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Recent Violations</div>
          {violationFeed.length === 0 ? (
            <div className={styles.emptyMini}>No medium/high severity violations recorded</div>
          ) : (
            <div className={styles.feed}>
              {violationFeed.map((ev) => {
                const meta = EVENT_META[ev.eventType];
                const Icon = meta?.icon || VscWarning;
                const sev = SEVERITY_META[ev.severity] || SEVERITY_META.low;
                return (
                  <div className={styles.feedRow} key={ev._id}>
                    <span className={styles.feedIcon} style={{ background: sev.bg, color: sev.color }}>
                      <Icon />
                    </span>
                    <div className={styles.feedBody}>
                      <span className={styles.feedTitle}>
                        {meta?.label || ev.eventType}
                        <span
                          className={styles.severityPill}
                          style={{ background: sev.bg, color: sev.color }}
                        >
                          {ev.severity}
                        </span>
                      </span>
                      <span className={styles.feedSub}>
                        {ev.studentId?.name || "Unknown student"} ·{" "}
                        {ev.examSessionId?.organisationId?.name || "Unknown org"} ·{" "}
                        {ev.examSessionId?.questionBankId?.title || "Unknown exam"}
                      </span>
                    </div>
                    <span className={styles.feedTime}>{timeAgo(ev.timestamp || ev.createdAt)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
