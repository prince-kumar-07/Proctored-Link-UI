import { useCallback, useEffect, useRef, useState } from "react";
import { getExamLivekitToken } from "../Services/Oprations/Proctor";

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

const EMPTY_DEVICES = { camera: false, mic: false, screen: false };

/**
 * Publishes the candidate's camera, mic and screen share to a LiveKit
 * room named after their own exam session, so a watching proctor
 * (Components/Proctor/LiveSessionViewer) can subscribe to it. Also
 * listens for the server-pushed WARNING/TERMINATED data messages a
 * proctor's action triggers (Controller/Proctor.js's broadcastToRoom),
 * and for LiveKit's own LocalTrackUnpublished event — the mechanism
 * that catches a track actually going away mid-exam (browser's native
 * "Stop sharing" control, a revoked permission, an unplugged camera).
 * Previously nothing watched for this at all: once the initial grant
 * succeeded, the app never noticed if it stopped being true.
 *
 * Camera, mic and screen share are each independent here — enabling or
 * losing one doesn't touch the others, unlike the old all-or-nothing
 * version where a single failure tore down everything already granted.
 *
 * `start()`/`enableCamera()`/`enableMic()`/`enableScreenShare()` must be
 * called from a user gesture — getDisplayMedia (screen share) throws
 * otherwise.
 */
export default function useLiveProctoring({ onWarning, onTerminated } = {}) {
  const [roomStatus, setRoomStatus] = useState("idle"); // idle | connecting | connected | error
  const [errorMessage, setErrorMessage] = useState("");
  const [devices, setDevices] = useState(EMPTY_DEVICES);
  // Distinct from a generic/retryable error: nothing the candidate does
  // (granting a permission, clicking Retry) can fix a missing server
  // configuration, so the UI treats this as a dead end rather than
  // something to keep retrying silently.
  const [notConfigured, setNotConfigured] = useState(false);
  const [pendingDevice, setPendingDevice] = useState(null);
  // True while startWithRetry (below) is between attempts, counting down
  // — separate from `roomStatus === "connecting"`, which only covers a
  // single in-flight attempt.
  const [retrying, setRetrying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const roomRef = useRef(null);
  const libRef = useRef(null); // cached { Room, RoomEvent, Track } after first dynamic import
  // Mirrors `notConfigured` synchronously — startWithRetry needs to know
  // this the instant an attempt fails, and a state value read from a
  // closure captured before that same attempt's setState hasn't
  // committed yet.
  const notConfiguredRef = useRef(false);
  const retryTimersRef = useRef(null); // { retry, countdown } interval ids while retrying

  // Read fresh on every call without forcing connect()/enableDevice()
  // to be re-created (and thus the room re-connected) whenever the
  // caller's callback identity changes across renders.
  const callbacksRef = useRef({});
  callbacksRef.current = { onWarning, onTerminated };

  const connect = useCallback(async () => {
    if (roomRef.current) return roomRef.current;

    if (!LIVEKIT_URL) {
      notConfiguredRef.current = true;
      setRoomStatus("error");
      setNotConfigured(true);
      setErrorMessage("Live proctoring isn't configured yet. Please contact your exam administrator.");
      throw new Error("NOT_CONFIGURED");
    }

    notConfiguredRef.current = false;
    setNotConfigured(false);
    setRoomStatus("connecting");

    // Dynamically imported so livekit-client (a large dependency) never
    // ends up in the app's main bundle — ExamSecurityGuard is loaded
    // eagerly for every route it wraps, so a static import here would
    // make every visitor, including ones who never reach a live-
    // proctored exam, download it upfront.
    const [lib, tokenData] = await Promise.all([
      libRef.current ? Promise.resolve(libRef.current) : import("livekit-client"),
      getExamLivekitToken(),
    ]);
    libRef.current = lib;

    if (!tokenData) {
      setRoomStatus("error");
      setErrorMessage("Couldn't start the proctoring session.");
      throw new Error("TOKEN_FAILED");
    }

    const { Room, RoomEvent, Track } = lib;
    const room = new Room();

    room.on(RoomEvent.DataReceived, (payload) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === "TERMINATED") callbacksRef.current.onTerminated?.(msg);
        else if (msg.type === "WARNING") callbacksRef.current.onWarning?.(msg);
      } catch {
        // Not a message we understand — ignore rather than crash the exam.
      }
    });

    room.on(RoomEvent.Disconnected, () => {
      roomRef.current = null;
      setRoomStatus("idle");
      setDevices(EMPTY_DEVICES);
    });

    const deviceKeyFor = (source) => {
      if (source === Track.Source.Camera) return "camera";
      if (source === Track.Source.Microphone) return "mic";
      if (source === Track.Source.ScreenShare) return "screen";
      return null;
    };

    // The actual mechanism that catches a track going away mid-exam —
    // the browser's own "Stop sharing" control, a revoked permission, an
    // unplugged camera — all surface here as an unpublish. Consumers
    // react to the `devices` state this flips, not to this event
    // directly (see ExamSecurityGuard, which turns "camera === false"
    // into a CAMERA_OFF violation and back once it's true again).
    room.on(RoomEvent.LocalTrackUnpublished, (publication) => {
      const key = deviceKeyFor(publication.source);
      if (!key) return;
      setDevices((d) => ({ ...d, [key]: false }));
    });

    await room.connect(LIVEKIT_URL, tokenData.token);
    roomRef.current = room;
    setRoomStatus("connected");
    return room;
  }, []);

  const enableDevice = useCallback(async (kind) => {
    setPendingDevice(kind);
    try {
      const room = await connect();
      if (kind === "camera") await room.localParticipant.setCameraEnabled(true);
      else if (kind === "mic") await room.localParticipant.setMicrophoneEnabled(true);
      else if (kind === "screen") await room.localParticipant.setScreenShareEnabled(true);
      setDevices((d) => ({ ...d, [kind]: true }));
      return true;
    } catch {
      return false;
    } finally {
      setPendingDevice((current) => (current === kind ? null : current));
    }
  }, [connect]);

  const enableCamera = useCallback(() => enableDevice("camera"), [enableDevice]);
  const enableMic = useCallback(() => enableDevice("mic"), [enableDevice]);
  const enableScreenShare = useCallback(() => enableDevice("screen"), [enableDevice]);

  /**
   * Tries camera, then mic, then screen share, one at a time — each
   * independent, so one denial doesn't undo whichever already
   * succeeded (the old bug). Returns true only once all three are on;
   * the caller can inspect `devices` to see exactly which are still
   * missing and offer to retry just those, via the same three
   * functions above.
   */
  const start = useCallback(async () => {
    setPendingDevice("all");
    try {
      await connect();
    } catch {
      setPendingDevice(null);
      return false;
    }

    const cam = await enableDevice("camera");
    const mic = await enableDevice("mic");
    const screen = await enableDevice("screen");

    if (!(cam && mic && screen)) {
      setErrorMessage("Grant whichever of camera, microphone or screen share is still missing below.");
    }

    return cam && mic && screen;
  }, [connect, enableDevice]);

  const stopRetrying = useCallback(() => {
    if (retryTimersRef.current) {
      clearInterval(retryTimersRef.current.retry);
      clearInterval(retryTimersRef.current.countdown);
      retryTimersRef.current = null;
    }
    setRetrying(false);
  }, []);

  /**
   * Same as start(), but for a transient failure (not a hard
   * NOT_CONFIGURED) it keeps retrying every 5s for up to `timeoutSec`
   * before giving up — the visible countdown ExamSecurityGuard renders
   * via ProctoringConsent while this runs. A NOT_CONFIGURED failure
   * skips the wait entirely: no amount of retrying within this session
   * can fix a missing server config, so there's no point stalling the
   * candidate for the full timeout just to fail the same way at the end
   * of it.
   */
  const startWithRetry = useCallback((timeoutSec = 30) => {
    return new Promise((resolve) => {
      (async () => {
        const firstOk = await start();
        if (firstOk) { resolve(true); return; }
        if (notConfiguredRef.current) { resolve(false); return; }

        setRetrying(true);
        setSecondsLeft(timeoutSec);
        const deadline = Date.now() + timeoutSec * 1000;

        const finish = (result) => {
          stopRetrying();
          resolve(result);
        };

        const countdown = setInterval(() => {
          setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
        }, 250);

        const attempt = async () => {
          const ok = await start();
          if (ok) { finish(true); return; }
          if (notConfiguredRef.current || Date.now() >= deadline) { finish(false); }
        };

        retryTimersRef.current = { retry: setInterval(attempt, 5000), countdown };
      })();
    });
  }, [start, stopRetrying]);

  useEffect(() => {
    return () => {
      stopRetrying();
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, [stopRetrying]);

  return {
    roomStatus,
    errorMessage,
    devices,
    notConfigured,
    pendingDevice,
    retrying,
    secondsLeft,
    start,
    startWithRetry,
    enableCamera,
    enableMic,
    enableScreenShare,
  };
}
