import { showSpinner, hideSpinner } from "../../Reducer/Slice/SpinnerSlice";
import { AccountEndPoint } from "../api";
import { apiConnector } from "../apiConnector";
import toast from "react-hot-toast";

const {
  CHANGE_PASSWORD_API,
  GET_TWO_FACTOR_STATUS_API,
  UPDATE_TWO_FACTOR_PREFERENCE_API,
} = AccountEndPoint;

function authHeader() {
  const token = JSON.parse(localStorage.getItem("token"));
  return { Authorization: `Bearer ${token}` };
}

export async function changePassword(dispatch, { currentPassword, newPassword, confirmNewPassword }) {
  dispatch(showSpinner("Changing password..."));

  let success = false;

  try {
    await apiConnector(
      "POST",
      CHANGE_PASSWORD_API,
      { currentPassword, newPassword, confirmNewPassword },
      authHeader(),
    );
    toast.success("Password changed successfully");
    success = true;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to change password";
    toast.error(message);
  }

  dispatch(hideSpinner());

  return success;
}

export async function fetchTwoFactorStatus() {
  try {
    const res = await apiConnector("GET", GET_TWO_FACTOR_STATUS_API, null, authHeader());
    return res.data.data; // { twoFactorEnabled, mandatoryTwoFactor }
  } catch (error) {
    const message = error.response?.data?.message || "Failed to load two-factor status";
    toast.error(message);
    return null;
  }
}

export async function updateTwoFactorPreference(enabled) {
  try {
    const res = await apiConnector(
      "POST",
      UPDATE_TWO_FACTOR_PREFERENCE_API,
      { enabled },
      authHeader(),
    );
    toast.success(enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
    return res.data.data; // { twoFactorEnabled, mandatoryTwoFactor }
  } catch (error) {
    const message = error.response?.data?.message || "Failed to update two-factor preference";
    toast.error(message);
    return null;
  }
}
