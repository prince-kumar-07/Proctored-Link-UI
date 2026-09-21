import { showSpinner, hideSpinner } from "../../Reducer/Slice/SpinnerSlice";
import {
  setShowOTP,
  removeShowOTP,
  setSignupStatusSuccess,
  setSignupStatusFalse,
  setSignupStatusNull,
  setOTPtype
} from "../../Reducer/Slice/AuthSlice";
import { AuthEndPoint } from "../api"
import toast from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { setToken, setUser } from "../../Reducer/Slice/UserSlice";

const {
  SEND_OTP_API,
  LOGIN_API,
  SIGNUP_API,
  SET_PASSWORD_API,
  FORGOT_PASSWORD_API,
} = AuthEndPoint


export async function sendOTP(data, dispatch) {
  //    console.time("OTP_TIME");
    dispatch(setOTPtype(data.type))
    dispatch(showSpinner("Requesting OTP..."));
    // console.log(data)

  try {
    const res = await apiConnector("POST", SEND_OTP_API, {
      ...data,
      checkUserPresent: true,
    });

    toast.success("OTP sent successfully");
    dispatch(setShowOTP());
    //  console.log(res)
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

    dispatch(hideSpinner());
   
  //   console.timeEnd("OTP_TIME");
}

export async function signUP(dispatch, formData) {
  //   console.time("SIGNUP_TIME");

    dispatch(showSpinner("Validating OTP..."));
    // console.log(formData)

  let success = false;

  try {
   const res = await apiConnector("POST", SIGNUP_API, {
      ...formData
    });

    // console.log(res)

    toast.success("Account Created Successfully");
    dispatch(setSignupStatusSuccess())
    // Modal/OTPtype are only cleared on success. Previously setOTPtype("")
    // ran unconditionally after this try/catch, so a *wrong* OTP still
    // wiped OTPtype — the next retry's handleVerifyOTP branch on
    // OTPtype === "signup" would then match nothing and silently do
    // nothing at all.
    dispatch(removeShowOTP())
    dispatch(setOTPtype(""))
    success = true;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
    dispatch(setSignupStatusFalse())
  }

    dispatch(hideSpinner());
  //   console.timeEnd("SIGNUP_TIME");

  return success;
}

/**
 * Two-step by design: called first with just {email, password}. The
 * backend replies `otpRequired: true` (not an error — a 200) when this
 * account/platform needs 2FA, at which point the caller sends the
 * actual OTP (via sendOTP) and calls this again with `otp` included. If
 * 2FA isn't required at all, this single call logs the user in directly
 * — no OTP step, no second call.
 *
 * Returns `{ success, otpRequired }` so callers can branch on either.
 */
export async function login(
  dispatch,
  formData,
  navigate,
  revokeDeletion = false,
) {
  dispatch(showSpinner("Validating credentials..."));
  const requestData = { ...formData, revokeDeletion };

  const result = { success: false, otpRequired: false };

  try {
    const response = await apiConnector("POST", LOGIN_API, requestData);

    if (response.data?.otpRequired) {
      result.otpRequired = true;
    } else {
      dispatch(setToken(response.data?.token));
      dispatch(setUser({ ...response.data.user }));
      localStorage.setItem("token", JSON.stringify(response.data.token));
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success("Logged in successfully.");
      navigate?.("/dashboard/profile");

      // Previously these two ran unconditionally after the try/catch, so
      // entering a *wrong* OTP still closed the modal and cleared OTPtype
      // — the candidate was dropped back to a bare form with nothing but
      // a toast, no way to just retry the code.
      dispatch(setOTPtype(""))
      dispatch(removeShowOTP())
      result.success = true;
    }
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }
    dispatch(hideSpinner());

  return result;
}

export async function forgotPassword(dispatch, email) {
  dispatch(showSpinner("Sending reset link..."));

  let success = false;

  try {
    const res = await apiConnector("POST", FORGOT_PASSWORD_API, { email });
    toast.success(res.data?.message || "If an account exists for that email, a reset link has been sent.");
    success = true;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());

  return success;
}

export async function setPassword(dispatch, { token, password, confirmPassword }) {
  dispatch(showSpinner("Setting password..."));

  let success = false;

  try {
    await apiConnector("POST", SET_PASSWORD_API, { token, password, confirmPassword });
    toast.success("Password set — you can now log in");
    success = true;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }

  dispatch(hideSpinner());

  return success;
}
