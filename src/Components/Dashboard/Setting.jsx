import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { setUser } from "../../Reducer/Slice/UserSlice";
import styles from "./Setting.module.css";
import { FiUser, FiLock, FiShield, FiEye, FiEyeOff, FiAlertTriangle } from "react-icons/fi";
import { changePassword, fetchTwoFactorStatus, updateTwoFactorPreference } from "../../Services/Oprations/Account";

const EMPTY_PW_FORM = { currentPassword: "", newPassword: "", confirmNewPassword: "" };

function Settings(){

  const { user } = useSelector((state)=>state.user);

  const dispatch = useDispatch();

  const [name,setName] = useState(user?.name || "");
  const [phone,setPhone] = useState(user?.phone || "");

  const handleSubmit = (e)=>{
    e.preventDefault();

    const updatedUser = {
      ...user,
      name,
      phone
    };

    dispatch(setUser(updatedUser));
  };

  // ── Change password ──
  const [pwForm, setPwForm] = useState(EMPTY_PW_FORM);
  const [showPw, setShowPw] = useState({});
  const togglePw = (key) => setShowPw((p) => ({ ...p, [key]: !p[key] }));

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      return;
    }

    const ok = await changePassword(dispatch, pwForm);
    if (ok) setPwForm(EMPTY_PW_FORM);
  };

  // ── Two-factor authentication ──
  const [twoFactor, setTwoFactor] = useState(null); // { twoFactorEnabled, mandatoryTwoFactor }
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);

  useEffect(() => {
    fetchTwoFactorStatus().then((data) => { if (data) setTwoFactor(data); });
  }, []);

  const handleToggleTwoFactor = async () => {
    if (!twoFactor || twoFactor.mandatoryTwoFactor) return;
    setTwoFactorBusy(true);
    const result = await updateTwoFactorPreference(!twoFactor.twoFactorEnabled);
    if (result) setTwoFactor(result);
    setTwoFactorBusy(false);
  };

  return(

    <div className={styles.settings}>

      <h2>Account Settings</h2>

      {/* ── PROFILE ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <FiUser className={styles.sectionIcon} />
          <span>Profile</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>

          <label>
            Name
            <input
            value={name}
            onChange={(e)=>setName(e.target.value)}
            />
          </label>

          <label>
            Phone
            <input
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
            />
          </label>

          <button type="submit">
            Save Changes
          </button>

        </form>
      </div>

      {/* ── CHANGE PASSWORD ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <FiLock className={styles.sectionIcon} />
          <span>Change Password</span>
        </div>

        <form onSubmit={handlePasswordSubmit} className={styles.form}>

          <label>
            Current Password
            <div className={styles.pwInputWrap}>
              <input
                type={showPw.current ? "text" : "password"}
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => togglePw("current")} tabIndex={-1}>
                {showPw.current ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>

          <label>
            New Password
            <div className={styles.pwInputWrap}>
              <input
                type={showPw.next ? "text" : "password"}
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                required
                minLength={6}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => togglePw("next")} tabIndex={-1}>
                {showPw.next ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>

          <label>
            Confirm New Password
            <div className={styles.pwInputWrap}>
              <input
                type={showPw.confirm ? "text" : "password"}
                value={pwForm.confirmNewPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmNewPassword: e.target.value })}
                required
                minLength={6}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => togglePw("confirm")} tabIndex={-1}>
                {showPw.confirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>

          {pwForm.confirmNewPassword && pwForm.newPassword !== pwForm.confirmNewPassword && (
            <p className={styles.fieldError}>New passwords do not match</p>
          )}

          <button type="submit">
            Update Password
          </button>

        </form>
      </div>

      {/* ── TWO-FACTOR AUTHENTICATION ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <FiShield className={styles.sectionIcon} />
          <span>Two-Factor Authentication</span>
        </div>

        {twoFactor && (
          <div className={styles.twoFactorBody}>
            <div className={styles.twoFactorRow}>
              <div>
                <p className={styles.twoFactorTitle}>
                  Require a code by email when logging in
                </p>
                <p className={styles.twoFactorDesc}>
                  {twoFactor.mandatoryTwoFactor
                    ? "Two-factor authentication has been made mandatory by the platform administrator and cannot be turned off."
                    : "When off, you'll log in with just your email and password — no OTP step."}
                </p>
              </div>

              <button
                type="button"
                className={`${styles.toggle} ${twoFactor.twoFactorEnabled ? styles.toggleOn : ""}`}
                onClick={handleToggleTwoFactor}
                disabled={twoFactorBusy || twoFactor.mandatoryTwoFactor}
                aria-pressed={twoFactor.twoFactorEnabled}
                aria-label="Toggle two-factor authentication"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>

            {twoFactor.mandatoryTwoFactor && (
              <div className={styles.mandatoryNotice}>
                <FiAlertTriangle />
                Mandated platform-wide by admin
              </div>
            )}
          </div>
        )}
      </div>

    </div>

  );

}

export default Settings;
