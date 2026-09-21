import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import WarningScreen from "../Components/Student Page/WarningScreen";
import ProctoringConsent from "../Components/Student Page/ProctoringConsent";
import { reportMisconduct, reportProctoringUnavailable } from "../Services/Oprations/Proctor";
import { REPORTABLE_VIOLATIONS, PROCTOR_WARNING } from "./violationConfig";
import useLiveProctoring from "../hooks/useLiveProctoring";

export default function ExamSecurityGuard({ children, enableLiveProctoring = false }) {

  // `enableLiveProctoring` says "this is the exam-taking route" (set
  // once, statically, in AppRoutes.jsx); whether the exam itself
  // actually requires live A/V is per-organisation and only known once
  // ValidateExamAccessKey's response reaches Redux (see
  // Services/Oprations/Exam.js) — deliberately `=== true`, not just
  // truthy, so a not-yet-loaded value never accidentally triggers
  // camera/mic/screen prompts for a candidate whose exam doesn't need them.
  const proctoringRequired = useSelector((state) => state.Question?.meta?.proctoringRequired);
  const shouldUseLiveProctoring = enableLiveProctoring && proctoringRequired === true;
  const connectTimeoutSec = useSelector((state) => state.Question?.meta?.proctoringConnectTimeoutSec) || 30;

  const [violations, setViolations] = useState([]);
  const [terminated, setTerminated] = useState(false);
  // The server's own tally, from the last confirmed report — this is
  // what WarningScreen shows as "warning X of 3", not a locally-counted
  // guess, since the backend is the one actually deciding termination.
  const [warningCount, setWarningCount] = useState(0);
  // True only while the most recent report attempt failed to reach the
  // server (offline, backend down, cookie missing, etc.) — surfaced
  // honestly rather than silently pretending the report succeeded.
  const [reportFailed, setReportFailed] = useState(false);
  const idleTimer = useRef(null);
  const navigate = useNavigate();

  // Tracks which violation types have already been reported to the
  // server *for their current occurrence*. A violation is reported once
  // when it starts (the rising edge), not once per checkEnvironment()
  // tick while it's still active — removeViolation clears the entry so
  // a later, separate occurrence of the same type reports again.
  const reportedRef = useRef(new Set());

  const reportIfNeeded = (type) => {
    if (reportedRef.current.has(type)) return;
    const mapping = REPORTABLE_VIOLATIONS[type];
    if (!mapping) return;

    reportedRef.current.add(type);

    reportMisconduct(mapping.eventType, mapping.severity).then((result) => {
      if (!result) {
        // reportMisconduct swallows the actual error (network drop,
        // backend down, missing/expired session cookie) and resolves
        // null — surface that honestly instead of acting as if the
        // violation was recorded when it might not have been.
        setReportFailed(true);
        return;
      }
      setReportFailed(false);
      if (typeof result.warningCount === "number") setWarningCount(result.warningCount);
      if (result.terminated) setTerminated(true);
    });
  };

  const addViolation = (type) => {
    reportIfNeeded(type);
    setViolations((prev) => (prev.includes(type) ? prev : [...prev, type]));
  };

  const removeViolation = (type) => {
    reportedRef.current.delete(type);
    setViolations((prev) => prev.filter(v => v !== type));
  };

  // Text of the most recent live proctor warning — WarningScreen shows
  // this instead of a generic message for the PROCTOR_WARNING issue.
  const [proctorMessage, setProctorMessage] = useState("");

  // Live A/V publish + the channel a proctor's warning/termination
  // arrives on instantly (see Utils/livekit.js's broadcastToRoom on the
  // backend). Only actually connects once `start()` is called from
  // ProctoringConsent's button — safe to call this hook unconditionally
  // even when shouldUseLiveProctoring is false, since nothing happens
  // until start()/enableCamera()/etc. run.
  const {
    roomStatus: liveStatus,
    errorMessage: liveError,
    devices: liveDevices,
    notConfigured: liveNotConfigured,
    pendingDevice: livePendingDevice,
    retrying: liveRetrying,
    secondsLeft: liveSecondsLeft,
    startWithRetry: startLiveProctoring,
    enableCamera,
    enableMic,
    enableScreenShare,
  } = useLiveProctoring({
    onWarning: (msg) => {
      setProctorMessage(msg.message || "");
      if (typeof msg.warningCount === "number") setWarningCount(msg.warningCount);
      addViolation(PROCTOR_WARNING);
    },
    onTerminated: () => setTerminated(true),
  });

  // Latches true the first time all three devices are actually live —
  // afterwards, losing one mid-exam becomes an ordinary WarningScreen
  // violation (see the effect below) rather than re-showing the
  // full-screen ProctoringConsent gate, matching how every other
  // violation already works (exam stays mounted underneath, an overlay
  // with a fix-it button covers it).
  const [everConnected, setEverConnected] = useState(false);

  // Latches true once the candidate has been let in WITHOUT a live
  // connection — LiveKit unreachable/misconfigured, or every retry
  // exhausted proctoringConnectTimeoutSec (see ProctoringConsent's
  // onDegraded). Kept separate from everConnected so the CAMERA_OFF/
  // MIC_OFF/SCREEN_SHARE_STOPPED effect below (gated on everConnected)
  // never fires for a session that was never actually connected.
  const [proctoringDegraded, setProctoringDegraded] = useState(false);

  const handleProctoringDegraded = () => {
    reportProctoringUnavailable();
    setProctoringDegraded(true);
  };

  useEffect(() => {
    if (!shouldUseLiveProctoring || everConnected) return;
    if (liveStatus === "connected" && liveDevices.camera && liveDevices.mic && liveDevices.screen) {
      setEverConnected(true);
    }
  }, [shouldUseLiveProctoring, everConnected, liveStatus, liveDevices]);

  // Once past the initial gate, a device going away (browser's native
  // "Stop sharing", a revoked permission, an unplugged camera) shows up
  // here as `liveDevices.<x>` flipping false — previously nothing
  // noticed this at all. Symmetric: reappearing (via the WarningScreen
  // button below) clears the violation the same way every other one does.
  useEffect(() => {
    if (!everConnected) return;
    if (liveDevices.camera) removeViolation("CAMERA_OFF"); else addViolation("CAMERA_OFF");
    if (liveDevices.mic) removeViolation("MIC_OFF"); else addViolation("MIC_OFF");
    if (liveDevices.screen) removeViolation("SCREEN_SHARE_STOPPED"); else addViolation("SCREEN_SHARE_STOPPED");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [everConnected, liveDevices]);

  const checkEnvironment = () => {

    if (!document.fullscreenElement) addViolation("EXIT_FULLSCREEN");
    else removeViolation("EXIT_FULLSCREEN");

    if (document.hidden) addViolation("TAB_SWITCH");
    else removeViolation("TAB_SWITCH");

    if (!navigator.onLine) addViolation("NO_INTERNET");
    else removeViolation("NO_INTERNET");

    if (window.innerWidth < 1200) addViolation("WINDOW_TOO_SMALL");
    else removeViolation("WINDOW_TOO_SMALL");

    // Camera/mic/screen-share loss is handled separately, reactively,
    // off liveDevices (see the effect above) — not polled here.

    if (window.__devtoolsOpen) addViolation("DEVTOOLS_OPEN");
    else removeViolation("DEVTOOLS_OPEN");

  };

  // COPY/PASTE/CUT/RIGHT_CLICK/KEYBOARD_SHORTCUT/PAGE_REFRESH/
  // PRINT_SCREEN are one-shot events, not ongoing states — nothing else
  // ever calls removeViolation for them the way checkEnvironment
  // continuously re-evaluates fullscreen/tab/online/window-size/
  // devtools above. Without this, the very first stray right-click or
  // Ctrl+C would add one of these and it would stay in `violations`
  // forever, permanently covering the exam with WarningScreen since no
  // other code path ever clears it.
  //
  // Deliberately NOT folded into checkEnvironment itself: that function
  // also runs passively every 1.5s and on window resize, and a
  // violation that clears itself within 1.5s regardless of what the
  // candidate does defeats the point of flagging it. This only runs
  // from an explicit acknowledgment — the "Recheck environment" button
  // and each row's own action button — and each occurrence has already
  // been reported to the server the instant it happened (see
  // reportIfNeeded), independent of when it clears locally.
  const acknowledgeOneShotViolations = () => {
    ["COPY", "PASTE", "CUT", "RIGHT_CLICK", "KEYBOARD_SHORTCUT", "PAGE_REFRESH", "PRINT_SCREEN", PROCTOR_WARNING]
      .forEach(removeViolation);
  };

  const recheck = () => {
    checkEnvironment();
    acknowledgeOneShotViolations();
  };

  useEffect(() => {

    checkEnvironment();

    const resizeHandler = () => checkEnvironment();
    const onlineHandler = () => removeViolation("NO_INTERNET");
    const offlineHandler = () => addViolation("NO_INTERNET");

    const visibilityHandler = () => {
      if (document.hidden) addViolation("TAB_SWITCH");
      else removeViolation("TAB_SWITCH");
    };

    const fullscreenHandler = () => {
      if (!document.fullscreenElement) addViolation("EXIT_FULLSCREEN");
      else removeViolation("EXIT_FULLSCREEN");
    };

    const contextMenuHandler = (e) => {
      e.preventDefault();
      addViolation("RIGHT_CLICK");
    };

    const copyHandler = () => addViolation("COPY");
    const pasteHandler = () => addViolation("PASTE");
    const cutHandler = () => addViolation("CUT");

    window.addEventListener("resize", resizeHandler);
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    document.addEventListener("visibilitychange", visibilityHandler);
    document.addEventListener("fullscreenchange", fullscreenHandler);
    document.addEventListener("contextmenu", contextMenuHandler);
    document.addEventListener("copy", copyHandler);
    document.addEventListener("paste", pasteHandler);
    document.addEventListener("cut", cutHandler);

    const keyHandler = (e) => {

      const blocked =
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && ["C", "V", "X", "A"].includes(e.key)) ||
        (e.ctrlKey && e.key === "Tab");

      if (blocked) {
        e.preventDefault();
        addViolation("KEYBOARD_SHORTCUT");
      }

      if (e.key === "PrintScreen") {
        addViolation("PRINT_SCREEN");
      }

    };

    document.addEventListener("keydown", keyHandler);

    const beforeUnloadHandler = (e) => {
      addViolation("PAGE_REFRESH");
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnloadHandler);

    const idleReset = () => {
      clearTimeout(idleTimer.current);
      removeViolation("IDLE_USER");

      idleTimer.current = setTimeout(() => {
        addViolation("IDLE_USER");
      }, 60000);
    };

    ["mousemove", "keydown", "scroll", "click"].forEach(event =>
      window.addEventListener(event, idleReset)
    );

    idleReset();

    const devtoolsInterval = setInterval(() => {

      const threshold = 160;

      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        window.__devtoolsOpen = true;
      } else {
        window.__devtoolsOpen = false;
      }

      checkEnvironment();

    }, 1500);

    return () => {

      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
      document.removeEventListener("visibilitychange", visibilityHandler);
      document.removeEventListener("fullscreenchange", fullscreenHandler);
      document.removeEventListener("contextmenu", contextMenuHandler);
      document.removeEventListener("copy", copyHandler);
      document.removeEventListener("paste", pasteHandler);
      document.removeEventListener("cut", cutHandler);
      document.removeEventListener("keydown", keyHandler);
      window.removeEventListener("beforeunload", beforeUnloadHandler);

      ["mousemove", "keydown", "scroll", "click"].forEach(event =>
        window.removeEventListener(event, idleReset)
      );
      clearTimeout(idleTimer.current);

      clearInterval(devtoolsInterval);

    };

  }, []);

  // A server-confirmed strike count reaching MAX_WARNINGS ends the
  // session for real — leave the local WarningScreen behind and go to
  // the actual outcome page.
  useEffect(() => {
    if (terminated) navigate("/assessment/ExamTerminated");
  }, [terminated, navigate]);

  if (terminated) return null;

  // `children` (the exam page) always stays mounted. Returning
  // WarningScreen *instead of* children here would unmount the exam —
  // every answer, the current question, the running timer — the instant
  // a candidate briefly exited fullscreen, and remount a blank exam once
  // they fixed it. WarningScreen renders as a fixed full-viewport
  // overlay (see its module CSS) on top of the still-mounted exam
  // underneath, which is paused only in the sense that it's covered.
  // Gate the exam behind camera/mic/screen consent before anything else
  // can show, on the one route that enables live proctoring, and only
  // until the very first successful connect (see `everConnected`) — a
  // device lost afterwards is an ordinary WarningScreen violation
  // instead, so the two overlays are never shown at once. Also drops
  // once proctoringDegraded latches — the candidate was already let in
  // without a live connection, so there is nothing left to gate on.
  const showConsentGate = shouldUseLiveProctoring && !everConnected && !proctoringDegraded;

  return (
    <>
      {children}
      {showConsentGate && (
        <ProctoringConsent
          status={liveStatus}
          errorMessage={liveError}
          devices={liveDevices}
          notConfigured={liveNotConfigured}
          pendingDevice={livePendingDevice}
          retrying={liveRetrying}
          secondsLeft={liveSecondsLeft}
          connectTimeoutSec={connectTimeoutSec}
          onStart={() => startLiveProctoring(connectTimeoutSec)}
          onDegraded={handleProctoringDegraded}
          onEnableCamera={enableCamera}
          onEnableMic={enableMic}
          onEnableScreenShare={enableScreenShare}
        />
      )}
      {!showConsentGate && violations.length > 0 && (
        <WarningScreen
          issues={violations}
          recheck={recheck}
          onEnableCamera={enableCamera}
          onEnableMic={enableMic}
          onEnableScreenShare={enableScreenShare}
          warningCount={warningCount}
          reportFailed={reportFailed}
          proctorMessage={proctorMessage}
          proctoringRequired={proctoringRequired === true}
        />
      )}
    </>
  );
}
