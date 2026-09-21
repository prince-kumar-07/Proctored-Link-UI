import { ProctorEndPoint, AssessmentEndPoint } from "../api";
import { apiConnector } from "../apiConnector";
import toast from "react-hot-toast";
import { setLiveSessions } from "../../Reducer/Slice/ProctorSlice";

const {
  AUTO_UPDATE_MISCONDUCT_API,
  TERMINATE_CANDIDATURE_API,
  SEND_WARNING_API,
  GET_LIVE_SESSIONS_API,
  GET_PROCTOR_LIVEKIT_TOKEN_API,
} = ProctorEndPoint;

const { GET_EXAM_LIVEKIT_TOKEN_API, REPORT_PROCTORING_UNAVAILABLE_API } = AssessmentEndPoint;

function authHeader() {
  const token = JSON.parse(localStorage.getItem("token"));
  return { Authorization: `Bearer ${token}` };
}

/**
 * Reports a single misconduct event for the candidate's own exam
 * session. Identity comes from the examToken cookie (examAuth on the
 * backend) — the same reason autoSaveExamResponse needs nothing but the
 * event itself.
 *
 * `eventType` must be one of the seven values the backend's
 * ProctorEvent schema accepts (tab_switch, multiple_faces, no_face,
 * phone_detected, fullscreen_exit, copy_paste, network_disconnect) —
 * anything else fails schema validation server-side. Callers should map
 * their own violation vocabulary onto this fixed set before calling in;
 * see REPORTABLE_VIOLATIONS in ExamSecurityGuard.
 *
 * Deliberately silent on failure, same reasoning as autoSaveExamResponse:
 * a network hiccup while reporting a violation shouldn't itself become a
 * second, confusing failure surfaced to the candidate.
 */
export async function reportMisconduct(eventType, severity = "low") {
  try {
    const res = await apiConnector("POST", AUTO_UPDATE_MISCONDUCT_API, {
      eventType,
      severity,
    });
    // { success, terminated, message, warningCount }
    return res.data;
  } catch {
    return null;
  }
}

/** Candidate side: publish-only LiveKit token for this exam session. */
export async function getExamLivekitToken() {
  try {
    const res = await apiConnector("POST", GET_EXAM_LIVEKIT_TOKEN_API, {});
    return res.data.data; // { token, room }
  } catch {
    return null;
  }
}

/**
 * Tells the backend this session is proceeding without a live A/V
 * connection (LiveKit unreachable/misconfigured, or every retry timed
 * out — see ProctoringConsent.jsx) so the organisation can see it was
 * unproctored, rather than the candidate being silently let through
 * with no record of why. Deliberately silent on failure, same as
 * reportMisconduct — this must never itself block the candidate from
 * proceeding into the exam.
 */
export async function reportProctoringUnavailable() {
  try {
    await apiConnector("POST", REPORT_PROCTORING_UNAVAILABLE_API, {});
    return true;
  } catch {
    return false;
  }
}

export async function fetchLiveExamSessions(dispatch) {
  try {
    const res = await apiConnector("GET", GET_LIVE_SESSIONS_API, null, authHeader());
    dispatch(setLiveSessions(res.data.data));
  } catch (error) {
    const message = error.response?.data?.message || "Failed to load live sessions";
    toast.error(message);
  }
}

/** Proctor side: subscribe-only LiveKit token for a given exam session. */
export async function getProctorLivekitToken(examSessionId) {
  try {
    const res = await apiConnector(
      "POST",
      GET_PROCTOR_LIVEKIT_TOKEN_API,
      { examSessionId },
      authHeader(),
    );
    return res.data.data; // { token, room }
  } catch (error) {
    const message = error.response?.data?.message || "Failed to start live view";
    toast.error(message);
    return null;
  }
}

export async function sendWarning(examSessionId, message) {
  try {
    const res = await apiConnector(
      "POST",
      SEND_WARNING_API,
      { examSessionId, message },
      authHeader(),
    );
    toast.success(res.data.terminated ? "Warning sent — candidate terminated (3rd strike)" : "Warning sent");
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Failed to send warning";
    toast.error(msg);
    return null;
  }
}

export async function terminateCandidature(examSessionId, reason) {
  try {
    const res = await apiConnector(
      "POST",
      TERMINATE_CANDIDATURE_API,
      { examSessionId, reason },
      authHeader(),
    );
    toast.success("Candidate terminated");
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Failed to terminate candidate";
    toast.error(msg);
    return null;
  }
}
