import { showSpinner, hideSpinner } from "../../Reducer/Slice/SpinnerSlice";
import { AdminEndPoint } from "../api";
import { apiConnector } from "../apiConnector";
import toast from "react-hot-toast";
import { setOrganisations, setAnalytics, setSecurity, setProctors } from "../../Reducer/Slice/AdminSlice";

const {
  GET_ALL_ORGANISATIONS_API,
  APPROVE_ORGANISATION_API,
  REJECT_ORGANISATION_API,
  SUSPEND_ORGANISATION_API,
  REACTIVATE_ORGANISATION_API,
  DELETE_ORGANISATION_API,
  GET_PLATFORM_ANALYTICS_API,
  GET_SECURITY_OVERVIEW_API,
  UNLOCK_EXAM_SESSION_API,
  CREATE_PROCTOR_API,
  GET_ALL_PROCTORS_API,
  UPDATE_PROCTOR_ASSIGNMENTS_API,
  SUSPEND_PROCTOR_API,
  REACTIVATE_PROCTOR_API,
  DELETE_PROCTOR_API,
  GET_PLATFORM_SETTINGS_API,
  UPDATE_PLATFORM_SETTINGS_API,
} = AdminEndPoint;

function authHeader() {
  const token = JSON.parse(localStorage.getItem("token"));
  return { Authorization: `Bearer ${token}` };
}

export async function fetchAllOrganisations(dispatch) {
  dispatch(showSpinner("Loading organisations..."));

  try {
    const res = await apiConnector("GET", GET_ALL_ORGANISATIONS_API, null, authHeader());
    dispatch(setOrganisations(res.data.data));
  } catch (error) {
    const message = error.response?.data?.message || "Failed to load organisations";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function approveOrganisation(dispatch, organisationId) {
  dispatch(showSpinner("Approving organisation..."));

  try {
    await apiConnector("POST", APPROVE_ORGANISATION_API, { organisationId }, authHeader());
    toast.success("Organisation approved");
    await fetchAllOrganisations(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to approve organisation";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function rejectOrganisation(dispatch, organisationId, reason) {
  dispatch(showSpinner("Rejecting organisation..."));

  try {
    await apiConnector("POST", REJECT_ORGANISATION_API, { organisationId, reason }, authHeader());
    toast.success("Organisation rejected");
    await fetchAllOrganisations(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to reject organisation";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function suspendOrganisation(dispatch, organisationId) {
  dispatch(showSpinner("Suspending organisation..."));

  try {
    await apiConnector("POST", SUSPEND_ORGANISATION_API, { organisationId }, authHeader());
    toast.success("Organisation suspended");
    await fetchAllOrganisations(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to suspend organisation";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function reactivateOrganisation(dispatch, organisationId) {
  dispatch(showSpinner("Reactivating organisation..."));

  try {
    await apiConnector("POST", REACTIVATE_ORGANISATION_API, { organisationId }, authHeader());
    toast.success("Organisation reactivated");
    await fetchAllOrganisations(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to reactivate organisation";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function deleteOrganisation(dispatch, organisationId) {
  dispatch(showSpinner("Deleting organisation..."));

  try {
    await apiConnector("DELETE", DELETE_ORGANISATION_API, { organisationId }, authHeader());
    toast.success("Organisation deleted");
    await fetchAllOrganisations(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete organisation";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function fetchPlatformAnalytics(dispatch) {
  dispatch(showSpinner("Loading analytics..."));

  try {
    const res = await apiConnector("GET", GET_PLATFORM_ANALYTICS_API, null, authHeader());
    dispatch(setAnalytics(res.data.data));
  } catch (error) {
    const message = error.response?.data?.message || "Failed to load analytics";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function fetchSecurityOverview(dispatch) {
  dispatch(showSpinner("Loading security overview..."));

  try {
    const res = await apiConnector("GET", GET_SECURITY_OVERVIEW_API, null, authHeader());
    dispatch(setSecurity(res.data.data));
  } catch (error) {
    const message = error.response?.data?.message || "Failed to load security overview";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function unlockExamSession(dispatch, examSessionId) {
  dispatch(showSpinner("Unlocking session..."));

  try {
    await apiConnector("POST", UNLOCK_EXAM_SESSION_API, { examSessionId }, authHeader());
    toast.success("Session unlocked");
    await fetchSecurityOverview(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to unlock session";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function fetchAllProctors(dispatch) {
  dispatch(showSpinner("Loading proctors..."));

  try {
    const res = await apiConnector("GET", GET_ALL_PROCTORS_API, null, authHeader());
    dispatch(setProctors(res.data.data));
  } catch (error) {
    const message = error.response?.data?.message || "Failed to load proctors";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function createProctor(dispatch, formData) {
  dispatch(showSpinner("Creating proctor..."));

  try {
    const res = await apiConnector("POST", CREATE_PROCTOR_API, formData, authHeader());
    if (res.data.emailSent) {
      toast.success("Proctor created — invite email sent");
    } else {
      toast.error("Proctor created, but the invite email failed to send. They'll need a password reset.");
    }
    await fetchAllProctors(dispatch);
    return true;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to create proctor";
    toast.error(message);
    return false;
  } finally {
    dispatch(hideSpinner());
  }
}

export async function updateProctorAssignments(dispatch, proctorId, assignedOrganisations) {
  dispatch(showSpinner("Updating assignments..."));

  try {
    await apiConnector(
      "POST",
      UPDATE_PROCTOR_ASSIGNMENTS_API,
      { proctorId, assignedOrganisations },
      authHeader(),
    );
    toast.success("Assignments updated");
    await fetchAllProctors(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to update assignments";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function suspendProctor(dispatch, proctorId) {
  dispatch(showSpinner("Suspending proctor..."));

  try {
    await apiConnector("POST", SUSPEND_PROCTOR_API, { proctorId }, authHeader());
    toast.success("Proctor suspended");
    await fetchAllProctors(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to suspend proctor";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function reactivateProctor(dispatch, proctorId) {
  dispatch(showSpinner("Reactivating proctor..."));

  try {
    await apiConnector("POST", REACTIVATE_PROCTOR_API, { proctorId }, authHeader());
    toast.success("Proctor reactivated");
    await fetchAllProctors(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to reactivate proctor";
    toast.error(message);
  }

  dispatch(hideSpinner());
}

export async function fetchPlatformSettings() {
  try {
    const res = await apiConnector("GET", GET_PLATFORM_SETTINGS_API, null, authHeader());
    return res.data.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to load platform settings";
    toast.error(message);
    return null;
  }
}

export async function updatePlatformSettings(mandatoryTwoFactor) {
  try {
    const res = await apiConnector(
      "POST",
      UPDATE_PLATFORM_SETTINGS_API,
      { mandatoryTwoFactor },
      authHeader(),
    );
    toast.success(mandatoryTwoFactor ? "Two-factor authentication is now mandatory platform-wide" : "Mandatory two-factor authentication disabled");
    return res.data.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to update platform settings";
    toast.error(message);
    return null;
  }
}

export async function deleteProctor(dispatch, proctorId) {
  dispatch(showSpinner("Deleting proctor..."));

  try {
    await apiConnector("DELETE", DELETE_PROCTOR_API, { proctorId }, authHeader());
    toast.success("Proctor deleted");
    await fetchAllProctors(dispatch);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete proctor";
    toast.error(message);
  }

  dispatch(hideSpinner());
}
