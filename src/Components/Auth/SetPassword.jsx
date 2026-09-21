import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import styles from "./SetPassword.module.css";
import { FiShield, FiLock, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import { setPassword } from "../../Services/Oprations/Auth";

export default function SetPassword() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await setPassword(dispatch, { token, password, confirmPassword });
    if (ok) setDone(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.grain} />

      <div className={styles.card}>
        <div className={styles.iconRing}>
          {done ? <FiCheckCircle /> : <FiShield />}
        </div>

        {done ? (
          <>
            <h1 className={styles.title}>Password Set</h1>
            <p className={styles.subtitle}>
              Your account is ready. You can now log in with your new password.
            </p>
            <button className={styles.submitBtn} onClick={() => navigate("/auth")}>
              Go to Login
            </button>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Set Your Password</h1>
            <p className={styles.subtitle}>
              Choose a new password for your ProctoredLink account. This link is time-limited —
              if it's expired, request a new one.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>New Password</label>
                <div className={styles.inputWrap}>
                  <FiLock className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrap}>
                  <FiLock className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Set Password
              </button>
            </form>

            <p className={styles.footer}>
              <Link to="/auth" className={styles.footerLink}>Back to Log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
