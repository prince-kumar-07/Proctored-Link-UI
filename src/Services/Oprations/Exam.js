import { showSpinner, hideSpinner } from "../../Reducer/Slice/SpinnerSlice";
import { AssessmentEndPoint } from "../api";
import { apiConnector } from "../apiConnector";
import toast from "react-hot-toast";
import { setAssignedExams } from "../../Reducer/Slice/ExamSlice";
import { setExamStudentData, setRedirectMessage } from "../../Reducer/Slice/StudentsSlice";
import { setQuestions, setExamMeta } from "../../Reducer/Slice/QuestionsSlice";

const {
  ASSIGN_EXAM_API,
  GET_ALL_ASSIGNED_EXAM_API,
  VALIDATE_EXAM_TOKEN_API,
  VALIDATE_ACCESS_KEY_API,
  FETCH_EXAM_QUESTIONS_API,
  AUTO_SAVE_EXAM_RESPONSE_API,
  SUBMIT_EXAM_API,
} = AssessmentEndPoint;

export async function assignExam(dispatch, formData) {
  dispatch(showSpinner("Assigning exam..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    await apiConnector(
      "POST",
      ASSIGN_EXAM_API,
      {
        ...formData,
      },
      {
        Authorization: `Bearer ${token}`,
      },
    );
    fetchAllAssignedExams(dispatch);
    toast.success("Exam Assigned Successfully");
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }
  dispatch(hideSpinner());
}

export async function fetchAllAssignedExams(dispatch) {
  dispatch(showSpinner("Fetching Assigned Exams..."));
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const res = await apiConnector("GET", GET_ALL_ASSIGNED_EXAM_API, null, {
      Authorization: `Bearer ${token}`,
    });

    dispatch(setAssignedExams(res.data.data));
    console.log(res.data.data);
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

/**
 * Maps the backend's `reason` codes to the human copy ExamRedirect's
 * keyword matching expects (see REASONS in Examredirect.jsx), since the
 * API sends machine codes like "EXAM_EXPIRED", not prose.
 */
const TOKEN_FAILURE_MESSAGES = {
  TOKEN_REQUIRED: "This exam link is invalid or missing required information.",
  INVALID_TOKEN: "This link is invalid, corrupted, or has already been used.",
  EXAM_EXPIRED: "The time window for this exam has expired.",
  EXAM_ALREADY_COMPLETED: "You have already submitted this exam.",
  EXAM_NOT_STARTED_YET: "This exam has not yet started. Please check back later.",
  SESSION_LOCKED: "Your exam session is locked. Please contact your administrator.",
  SERVER_ERROR: "Something went wrong. Please try again later.",
};

export async function ValidateExamToken(dispatch, token, navigate) {
  dispatch(showSpinner("Validating Exam Token..."));

  try {
    const res = await apiConnector(
      "POST",
      VALIDATE_EXAM_TOKEN_API,
      { token },
      null,
    );

    dispatch(setExamStudentData(res.data.data));
  } catch (error) {
    const reason = error.response?.data?.reason;
    // The backend includes a ready-to-show message for reasons whose
    // text is dynamic (e.g. EXAM_NOT_STARTED_YET embeds the actual
    // start time) — prefer it over the static map when present.
    const serverMessage = error.response?.data?.message;

    if (reason === "EXAM_TERMINATED") {
      navigate("/assessment/ExamTerminated");
    } else {
      dispatch(setRedirectMessage(serverMessage || TOKEN_FAILURE_MESSAGES[reason] || "Something went wrong. Please try again later."));
      navigate("/assessment/invalid-user");
    }
  }

  dispatch(hideSpinner());
}

/**
 * Loads the candidate's questions and exam meta (title, duration, start
 * time). Identity is carried by the httpOnly examToken cookie set during
 * ValidateExamAccessKey — nothing here needs the uniqueAccessToken.
 */
export async function fetchExamQuestions(dispatch) {
  dispatch(showSpinner("Loading exam questions..."));

  try {
    const res = await apiConnector("POST", FETCH_EXAM_QUESTIONS_API, {});

    dispatch(setQuestions(res.data.data));
    dispatch(setExamMeta(res.data.meta));

    return { questions: res.data.data, meta: res.data.meta };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to load exam questions";
    toast.error(message);
    return null;
  } finally {
    dispatch(hideSpinner());
  }
}

/**
 * Fire-and-forget by design: a failed autosave shouldn't interrupt the
 * candidate or pop a toast mid-question. The next successful autosave
 * (or the final submit) carries the latest answers anyway.
 *
 * Also doubles as the only heartbeat a non-proctored exam has: a
 * proctored one learns about a manual warning/termination instantly
 * over the LiveKit data channel, but without a live connection at all,
 * this periodic call (see ExamPage.jsx) is the sole way that ever
 * reaches the candidate — so the response's examStatus/warningCount are
 * returned rather than discarded.
 */
export async function autoSaveExamResponse(responses, examElapsed) {
  try {
    const res = await apiConnector("POST", AUTO_SAVE_EXAM_RESPONSE_API, { responses, examElapsed });
    return { success: true, examStatus: res.data.examStatus, warningCount: res.data.warningCount };
  } catch (error) {
    // examAuth itself rejects a terminated/completed session before this
    // request ever reaches the controller (403, "Exam not active") — the
    // whole point of this heartbeat is to catch exactly that, so pull
    // examStatus from here too rather than only from a 200 response.
    return { success: false, examStatus: error.response?.data?.examStatus };
  }
}

export async function submitExamToServer(dispatch, examElapsed, navigate) {
  dispatch(showSpinner("Submitting exam..."));

  try {
    const res = await apiConnector("POST", SUBMIT_EXAM_API, { examElapsed });
    toast.success("Exam submitted successfully");
    navigate("/ExamSubmitted");
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to submit exam";
    toast.error(message);
    return null;
  } finally {
    dispatch(hideSpinner());
  }
}

export async function ValidateExamAccessKey(dispatch, token, accessKey, navigate) {
  dispatch(showSpinner("Validating Exam AccessKey..."));
  console.log(token, accessKey)

  const uniqueAccessToken = token
  try {
    const res = await apiConnector(
      "POST",
      VALIDATE_ACCESS_KEY_API,
      {token, accessKey},
      null,
    );
    // Known this early (well before ExamPage's own fetchExamQuestions
    // would otherwise set it) so ExamSecurityGuard can decide whether
    // this exam actually needs the camera/mic/screen-share gate before
    // the candidate ever reaches it — see Hooks/useLiveProctoring.js.
    dispatch(setExamMeta({
      proctoringRequired: res.data.data?.proctoringRequired,
      proctoringConnectTimeoutSec: res.data.data?.proctoringConnectTimeoutSec,
      waitingLobbyDurationSec: res.data.data?.waitingLobbyDurationSec,
    }));
    navigate(`/assessment/exam-pre-check/${uniqueAccessToken}`)
  } catch (error) {
    // Previously fell back to the raw `reason` code (e.g. "EXAM_EXPIRED")
    // as the toast text — the backend's human `message` (when present,
    // e.g. EXAM_NOT_STARTED_YET's embedded start time) is what should
    // actually be shown.
    const message = error.response?.data?.message || error.response?.data?.reason || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());
}