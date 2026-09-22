import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Examredirect.module.css";
import {
  FiClock, FiCheckCircle, FiAlertTriangle, FiLock,
  FiArrowLeft, FiMail, FiRefreshCw, FiCalendar,
  FiShield, FiXCircle, FiAlertCircle
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";

/* ── REASON CONFIG ── */
const REASONS = {
  expired: {
    icon:     <FiClock />,
    color:    "#f59e0b",
    colorBg:  "rgba(245,158,11,0.10)",
    colorBdr: "rgba(245,158,11,0.22)",
    tag:      "Session Expired",
    title:    "Your Exam Has Expired",
    message:  "The time window for this exam has passed. The access link is no longer valid. Please contact your instructor or administrator to request a new session.",
    actions:  ["home", "support"],
  },
  submitted: {
    icon:     <FiCheckCircle />,
    color:    "#34d399",
    colorBg:  "rgba(52,211,153,0.10)",
    colorBdr: "rgba(52,211,153,0.22)",
    tag:      "Exam Submitted",
    title:    "You've Already Submitted",
    message:  "Your exam was submitted successfully. You cannot re-enter the exam session. Your result will be shared once evaluated.",
    actions:  ["home"],
  },
  invalid: {
    icon:     <FiAlertTriangle />,
    color:    "#f87171",
    colorBg:  "rgba(248,113,113,0.10)",
    colorBdr: "rgba(248,113,113,0.22)",
    tag:      "Invalid Token",
    title:    "Access Denied",
    message:  "This link is invalid, corrupted, or has already been used. Do not share your exam link with anyone. Contact your administrator for a valid access link.",
    actions:  ["home", "support"],
  },
  notstarted: {
    icon:     <FiCalendar />,
    color:    "#60a5fa",
    colorBg:  "rgba(96,165,250,0.10)",
    colorBdr: "rgba(96,165,250,0.22)",
    tag:      "Not Yet Open",
    title:    "Exam Hasn't Started Yet",
    message:  "This exam is scheduled for a future time. Please return at the designated start time. Early access is not permitted.",
    actions:  ["home"],
  },
  unauthorized: {
    icon:     <FiLock />,
    color:    "#f87171",
    colorBg:  "rgba(248,113,113,0.10)",
    colorBdr: "rgba(248,113,113,0.22)",
    tag:      "Unauthorized",
    title:    "Access Not Permitted",
    message:  "You are not authorized to access this exam. This may be because you are not registered for this exam or your session has been revoked.",
    actions:  ["home", "support"],
  },
  terminated: {
    icon:     <FiXCircle />,
    color:    "#f87171",
    colorBg:  "rgba(248,113,113,0.10)",
    colorBdr: "rgba(248,113,113,0.22)",
    tag:      "Session Terminated",
    title:    "Exam Terminated",
    message:  "Your exam session was terminated due to a violation of exam conduct rules. Repeated violations have been logged. Please contact your administrator.",
    actions:  ["home", "support"],
  },
  default: {
    icon:     <FiAlertCircle />,
    color:    "#f59e0b",
    colorBg:  "rgba(245,158,11,0.10)",
    colorBdr: "rgba(245,158,11,0.22)",
    tag:      "Redirected",
    title:    "Something Went Wrong",
    message:  "You were redirected here because your exam session could not be continued. Please contact your administrator for further assistance.",
    actions:  ["home", "support"],
  },
};

const ACTION_META = {
  home:    { label: "Back to Home",       Icon: FiArrowLeft,   primary: false },
  support: { label: "Contact Support",    Icon: FiMail,        primary: true  },
  retry:   { label: "Try Again",          Icon: FiRefreshCw,   primary: true  },
};

export default function ExamRedirect() {
  const navigate = useNavigate();

  /* pull redirectMessage from redux slice */
  const { redirectMessage } = useSelector((state) => state.Students) || { redirectMessage: null };

  /* map slice message to a reason key, fallback to default */
  const rawReason = redirectMessage ? (
    redirectMessage.toLowerCase().includes("expir")       ? "expired"      :
    redirectMessage.toLowerCase().includes("submit")      ? "submitted"    :
    redirectMessage.toLowerCase().includes("invalid") ||
    redirectMessage.toLowerCase().includes("tamper")      ? "invalid"      :
    redirectMessage.toLowerCase().includes("not start") ||
    redirectMessage.toLowerCase().includes("not yet")     ? "notstarted"   :
    redirectMessage.toLowerCase().includes("unauthori")   ? "unauthorized" :
    redirectMessage.toLowerCase().includes("terminat")    ? "terminated"   :
    "default"
  ) : "default";

  const config        = REASONS[rawReason] || REASONS.default;
  const customMessage = redirectMessage || config.message;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { 
    setMounted(true)
    
    },[]);

  return (
    <div className={styles.page}>
      {/* Atmosphere */}
      <div className={styles.blob1} style={{ "--hue": config.color }} />
      <div className={styles.blob2} />
      <div className={styles.grain} />
      <div className={styles.gridLines} aria-hidden="true">
        {[...Array(5)].map((_, i) => <div key={i} className={styles.gridLine} />)}
      </div>

      <div className={`${styles.container} ${mounted ? styles.containerIn : ""}`}>

        {/* ── ICON ── */}
        <div
          className={styles.iconRing}
          style={{
            background:  config.colorBg,
            borderColor: config.colorBdr,
            color:        config.color,
            boxShadow:   `0 0 60px ${config.colorBg}, 0 0 120px ${config.colorBg}`,
          }}
        >
          <span className={styles.iconInner} style={{ color: config.color }}>
            {config.icon}
          </span>
          {/* Orbiting shield */}
          <span className={styles.orbitDot} style={{ background: config.color }} />
        </div>

        {/* ── TAG ── */}
        <div
          className={styles.tag}
          style={{
            background:  config.colorBg,
            borderColor: config.colorBdr,
            color:        config.color,
          }}
        >
          <FiShield className={styles.tagIcon} />
          {config.tag}
        </div>

        {/* ── TITLE ── */}
        <h1 className={styles.title}>{config.title}</h1>

        {/* ── MESSAGE ── */}
        <p className={styles.message}>{customMessage || config.message}</p>

        {/* ── DIVIDER ── */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>What can I do?</span>
          <span className={styles.dividerLine} />
        </div>

        {/* ── ACTIONS ── */}
        <div className={styles.actions}>
          {config.actions.map((key) => {
            const { label, Icon, primary } = ACTION_META[key];
            return (
              <button
                key={key}
                className={primary ? styles.btnPrimary : styles.btnSecondary}
                style={primary ? {
                  background:  `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
                  boxShadow:   `0 4px 24px ${config.colorBg}`,
                  color:       rawReason === "submitted" ? "#07080d" : "#07080d",
                } : {}}
                onClick={() => {
                  if (key === "home")    navigate("/");
                  if (key === "support") window.location.href = "mailto:support@procturai.com";
                  if (key === "retry")   navigate(-1);
                }}
              >
                <Icon className={styles.btnIcon} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── FOOTER ── */}
        <p className={styles.footer}>
          <FiShield className={styles.footerIcon} />
          All exam sessions are monitored and logged for security purposes.
        </p>

      </div>
    </div>
  );
}