import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Room, RoomEvent, Track } from "livekit-client";
import styles from "./LiveSessionViewer.module.css";
import { FiX, FiAlertTriangle, FiXCircle, FiVideoOff, FiMonitor } from "react-icons/fi";
import useModalDismiss from "../../hooks/useModalDismiss";
import {
  getProctorLivekitToken,
  sendWarning,
  terminateCandidature,
  fetchLiveExamSessions,
} from "../../Services/Oprations/Proctor";

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

export default function LiveSessionViewer({ session, onClose }) {
  const dispatch = useDispatch();
  const cameraRef = useRef(null);
  const screenRef = useRef(null);
  const audioRef = useRef(null);
  const roomRef = useRef(null);

  const [connectionState, setConnectionState] = useState("connecting"); // connecting | live | error
  const [errorMsg, setErrorMsg] = useState("");
  const [warnOpen, setWarnOpen] = useState(false);
  const [warnMessage, setWarnMessage] = useState("");
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useModalDismiss(true, () => {
    if (!warnOpen && !terminateOpen) onClose();
  });

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      if (!LIVEKIT_URL) {
        setConnectionState("error");
        setErrorMsg("Live proctoring isn't configured yet (missing VITE_LIVEKIT_URL).");
        return;
      }

      const tokenData = await getProctorLivekitToken(session._id);
      if (cancelled) return;

      if (!tokenData) {
        setConnectionState("error");
        setErrorMsg("Couldn't get a live-view token for this session.");
        return;
      }

      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === "video") {
          const el = publication.source === Track.Source.ScreenShare ? screenRef.current : cameraRef.current;
          if (el) track.attach(el);
        } else if (track.kind === "audio") {
          if (audioRef.current) track.attach(audioRef.current);
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach();
      });

      room.on(RoomEvent.Disconnected, () => {
        if (!cancelled) setConnectionState("error");
      });

      try {
        await room.connect(LIVEKIT_URL, tokenData.token);
        if (!cancelled) setConnectionState("live");
      } catch (err) {
        if (!cancelled) {
          setConnectionState("error");
          setErrorMsg("Couldn't connect to the live session.");
        }
      }
    }

    connect();

    return () => {
      cancelled = true;
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, [session._id]);

  const handleSendWarning = async () => {
    setBusy(true);
    const result = await sendWarning(session._id, warnMessage.trim() || undefined);
    setBusy(false);
    setWarnOpen(false);
    setWarnMessage("");
    fetchLiveExamSessions(dispatch);
    if (result?.terminated) onClose();
  };

  const handleTerminate = async () => {
    setBusy(true);
    await terminateCandidature(session._id, "Manual termination by proctor");
    setBusy(false);
    setTerminateOpen(false);
    fetchLiveExamSessions(dispatch);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.viewer}>
        {/* ── HEADER ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>
              {session.studentId?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <div className={styles.candidateName}>{session.studentId?.name || "Unknown candidate"}</div>
              <div className={styles.subInfo}>
                {session.organisationId?.name} · {session.questionBankId?.title}
              </div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
        </div>

        {/* ── STREAMS ── */}
        <div className={styles.streams}>
          <div className={styles.streamTile}>
            <video ref={cameraRef} className={styles.video} autoPlay playsInline muted={false} />
            <span className={styles.tileLabel}><FiVideoOff /> Camera</span>
            {connectionState !== "live" && (
              <div className={styles.tileOverlay}>
                {connectionState === "connecting" ? "Connecting…" : "No signal"}
              </div>
            )}
          </div>
          <div className={styles.streamTile}>
            <video ref={screenRef} className={styles.video} autoPlay playsInline muted />
            <span className={styles.tileLabel}><FiMonitor /> Screen Share</span>
            {connectionState !== "live" && (
              <div className={styles.tileOverlay}>
                {connectionState === "connecting" ? "Connecting…" : "No signal"}
              </div>
            )}
          </div>
        </div>
        <audio ref={audioRef} autoPlay />

        {connectionState === "error" && (
          <div className={styles.errorBanner}>
            <FiAlertTriangle /> {errorMsg}
          </div>
        )}

        {/* ── ACTIONS ── */}
        <div className={styles.actions}>
          <div className={styles.warningStat}>
            <FiAlertTriangle />
            Warning {session.warningCount || 0} of 3
          </div>
          <div className={styles.actionBtns}>
            <button className={styles.warnBtn} onClick={() => setWarnOpen(true)}>
              <FiAlertTriangle /> Send Warning
            </button>
            <button className={styles.terminateBtn} onClick={() => setTerminateOpen(true)}>
              <FiXCircle /> Terminate Exam
            </button>
          </div>
        </div>
      </div>

      {/* ── WARN MODAL ── */}
      {warnOpen && (
        <div className={styles.subOverlay} onClick={(e) => e.target === e.currentTarget && setWarnOpen(false)}>
          <div className={styles.subModal}>
            <h3 className={styles.subModalTitle}>Send a warning</h3>
            <p className={styles.subModalText}>
              This appears on the candidate's screen instantly and counts as a strike toward
              automatic termination.
            </p>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="e.g. Please stay facing the camera"
              value={warnMessage}
              onChange={(e) => setWarnMessage(e.target.value)}
            />
            <div className={styles.subModalFooter}>
              <button className={styles.cancelBtn} onClick={() => setWarnOpen(false)} disabled={busy}>
                Cancel
              </button>
              <button className={styles.warnConfirmBtn} onClick={handleSendWarning} disabled={busy}>
                Send Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TERMINATE MODAL ── */}
      {terminateOpen && (
        <div className={styles.subOverlay} onClick={(e) => e.target === e.currentTarget && setTerminateOpen(false)}>
          <div className={styles.subModal}>
            <h3 className={styles.subModalTitle}>Terminate this exam?</h3>
            <p className={styles.subModalText}>
              This immediately ends {session.studentId?.name || "the candidate"}'s exam session.
              This cannot be undone.
            </p>
            <div className={styles.subModalFooter}>
              <button className={styles.cancelBtn} onClick={() => setTerminateOpen(false)} disabled={busy}>
                Cancel
              </button>
              <button className={styles.terminateConfirmBtn} onClick={handleTerminate} disabled={busy}>
                Terminate Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
