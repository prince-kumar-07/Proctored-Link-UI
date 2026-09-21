/**
 * Shared between ExamSecurityGuard (which detects and reports
 * violations) and WarningScreen (which displays them) — pulled out to
 * its own module so neither has to import the other.
 *
 * Every violation type ExamSecurityGuard can raise is reported to the
 * server instantly, on its own rising edge (see reportIfNeeded there) —
 * this used to cover only 6 of ~13 types, because the backend's
 * ProctorEvent.eventType enum only recognised those. The enum (and
 * ExamSessionSchema.misconductSummary) has been extended to match this
 * full list, so every entry here now has a real backend counterpart.
 *
 * `severity` also decides whether an occurrence counts toward the
 * server's strike-based auto-termination (Controller/Proctor.js only
 * increments warningCount for "high"/"medium") — "low" is still logged
 * and visible to the organisation, just not treated as
 * termination-worthy on its own.
 *
 * CAMERA_OFF / MIC_OFF / SCREEN_SHARE_STOPPED are the live-proctoring
 * device-loss violations (Hooks/useLiveProctoring.js detects these via
 * LiveKit's own track-unpublish event) — only ever raised when
 * enableLiveProctoring is on, since there's no stream to lose otherwise.
 */
export const REPORTABLE_VIOLATIONS = {
  EXIT_FULLSCREEN:   { eventType: "fullscreen_exit",    severity: "high" },
  TAB_SWITCH:        { eventType: "tab_switch",         severity: "high" },
  DEVTOOLS_OPEN:     { eventType: "devtools_open",      severity: "high" },
  PRINT_SCREEN:      { eventType: "print_screen",       severity: "high" },
  CAMERA_OFF:        { eventType: "camera_off",         severity: "high" },
  MIC_OFF:           { eventType: "mic_off",            severity: "high" },
  SCREEN_SHARE_STOPPED: { eventType: "screen_share_stopped", severity: "high" },

  COPY:              { eventType: "copy_paste",         severity: "medium" },
  PASTE:             { eventType: "copy_paste",         severity: "medium" },
  CUT:               { eventType: "copy_paste",         severity: "medium" },
  KEYBOARD_SHORTCUT: { eventType: "keyboard_shortcut",  severity: "medium" },
  PAGE_REFRESH:      { eventType: "page_refresh",       severity: "medium" },

  NO_INTERNET:       { eventType: "network_disconnect", severity: "low" },
  WINDOW_TOO_SMALL:  { eventType: "window_too_small",   severity: "low" },
  RIGHT_CLICK:       { eventType: "right_click",        severity: "low" },
  IDLE_USER:         { eventType: "idle_user",          severity: "low" },
};

/**
 * A manual flag from a live proctor (Components/Proctor/LiveSessionViewer
 * → sendWarning) rather than something ExamSecurityGuard itself detects
 * and reports — it arrives already-recorded via the LiveKit data
 * channel (see useLiveProctoring), so it has no REPORTABLE_VIOLATIONS
 * entry of its own. Always strike-worthy: a human proctor flagged it.
 */
export const PROCTOR_WARNING = "PROCTOR_WARNING";

/** Only these actually count toward termination — used by WarningScreen
 *  to decide whether to show the "you're at risk of termination"
 *  escalation banner, so a low-severity signal doesn't imply a stake
 *  that isn't real. */
export function isStrikeWorthy(type) {
  if (type === PROCTOR_WARNING) return true;
  const mapping = REPORTABLE_VIOLATIONS[type];
  return mapping ? mapping.severity !== "low" : false;
}

// Matches the backend's own threshold in Controller/Proctor.js
// (autoUpdateMisconduct terminates once warningCount >= MAX_WARNINGS,
// counting only high/medium severity reports) — named here so
// WarningScreen's copy can never silently drift out of sync with what
// the server actually enforces.
export const MAX_WARNINGS = 20;
