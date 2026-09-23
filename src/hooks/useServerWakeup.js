import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { showSpinner, hideSpinner } from "../Reducer/Slice/SpinnerSlice";
import { HEALTH_API } from "../Services/api";

const WAKEUP_MESSAGE =
  "Starting the server, please wait... this can take up to a minute.";

// Render's free tier spins the server down after inactivity, so the very
// first request can take 30-60s to come back up. We only show the
// wake-up spinner if the health check is still pending past this delay,
// so an already-warm server never flashes it.
const SPINNER_DELAY_MS = 1200;
const HEALTH_CHECK_TIMEOUT_MS = 90000;

export default function useServerWakeup() {
  const dispatch = useDispatch();

  useEffect(() => {
    let settled = false;
    let spinnerShown = false;

    const delayTimer = setTimeout(() => {
      if (!settled) {
        spinnerShown = true;
        dispatch(showSpinner(WAKEUP_MESSAGE));
      }
    }, SPINNER_DELAY_MS);

    axios
      .get(HEALTH_API, { timeout: HEALTH_CHECK_TIMEOUT_MS })
      .catch(() => {})
      .finally(() => {
        settled = true;
        clearTimeout(delayTimer);
        if (spinnerShown) {
          dispatch(hideSpinner());
        }
      });

    return () => {
      settled = true;
      clearTimeout(delayTimer);
    };
  }, [dispatch]);
}
