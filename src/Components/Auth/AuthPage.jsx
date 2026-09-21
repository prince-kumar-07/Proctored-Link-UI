import { useState, useEffect, useRef } from "react";
import styles from "./AuthPage.module.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { setSignupStatusNull, removeShowOTP } from "../../Reducer/Slice/AuthSlice";
import { sendOTP, signUP, login, forgotPassword } from "../../Services/Oprations/Auth";
import toast from "react-hot-toast";

const EASE = [0.16, 1, 0.3, 1];

/** Shared entrance for the two forms, directional so the swap reads as
 *  the panel sliding rather than cross-fading in place. */
const formVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 26 : -26 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.32, ease: EASE } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -26 : 26, transition: { duration: 0.18 } }),
};

function EyeIcon({ open }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M1.5 10S4.7 4.5 10 4.5 18.5 10 18.5 10 15.3 15.5 10 15.5 1.5 10 1.5 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      {!open && (
        <path d="M3.5 3.5l13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.5-3 8.2-7 9.5-4-1.3-7-5-7-9.5V6l7-3Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/** Turns "prince.tiwari@gmail.com" into "pr•••••i@gmail.com" — enough
 *  for the candidate to confirm it's their own inbox, without printing
 *  the full address back at them in a security-sensitive modal. */
function maskEmail(email) {
  if (!email || !email.includes("@")) return email || "";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user}•••@${domain}`;
  return `${user.slice(0, 2)}${"•".repeat(Math.max(user.length - 3, 3))}${user.slice(-1)}@${domain}`;
}

const OTP_LENGTH = 6;

/** Six individual digit boxes rather than one plain text field — auto-
 *  advances on type, steps back on backspace, and accepts a full code
 *  pasted into any box. Calls onComplete once all boxes are filled. */
function OtpBoxes({ value, onChange, onComplete, error, disabled }) {
  const boxRefs = useRef([]);

  const commit = (next) => {
    onChange(next);
    if (next.length === OTP_LENGTH) onComplete?.(next);
  };

  const handleChange = (idx, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const chars = value.split("");
    chars[idx] = digit;
    const next = chars.join("").slice(0, OTP_LENGTH);
    commit(next);
    if (digit && idx < OTP_LENGTH - 1) boxRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      boxRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      boxRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      boxRefs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    commit(pasted);
    boxRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div
      className={`${styles.otpBoxes} ${error ? styles.otpBoxesError : ""}`}
      onPaste={handlePaste}
    >
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (boxRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          className={`${styles.otpBox} ${value[i] ? styles.otpBoxFilled : ""}`}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
        />
      ))}
    </div>
  );
}

const RESEND_COOLDOWN_SEC = 30;

export default function AuthPage() {
  // const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SEC);
  // const [signupStatus, setSignupStatus] = useState("");
  // null | success | failed
  const { OTPModal, signupStatus, OTPtype } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [tab, setTab] = useState("signup");
  const [showPw, setShowPw] = useState({});

  const togglePw = (key) => setShowPw((p) => ({ ...p, [key]: !p[key] }));

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    organization: "",
    email: "",
    code: "+91",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const openForgotPassword = () => {
    setForgotEmail(loginData.email);
    setForgotSent(false);
    setForgotOpen(true);
  };

  const closeForgotPassword = () => {
    setForgotOpen(false);
    setForgotEmail("");
    setForgotSent(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const ok = await forgotPassword(dispatch, forgotEmail);
    if (ok) setForgotSent(true);
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Enter your email and password");
      return;
    }

    // First pass: credentials only, no OTP yet. If this account (or the
    // platform) requires 2FA, the backend says so via `otpRequired`
    // rather than logging in — only then do we actually send an OTP and
    // show the entry step below. If 2FA isn't required, login() has
    // already completed and navigated away by the time this returns.
    const result = await login(dispatch, {
      email: loginData.email,
      password: loginData.password,
    }, navigate);

    if (result.otpRequired) {
      sendOTP({
        email: loginData.email,
        password: loginData.password,
        name: "User",
        type: "login"
      }, dispatch);
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    // console.log("Signup Data:", signupData);

     const data = {
      email: signupData.email,
      name: "User",
      type: "signup"
    }

    sendOTP(data, dispatch)
  };

  function handleRequestOTP() {
    // setShowOTP(true);
    //  setSignupStatus("success");
  }

  // Fresh state every time the modal opens for a *new* OTP request —
  // otherwise a cancelled login's leftover digits/error could bleed
  // into a signup OTP requested straight after. Adjusted during render
  // (React's documented pattern for this) rather than in an effect: a
  // pure reset keyed off OTPModal/OTPtype, no external data to fetch.
  const otpSessionKey = OTPModal ? OTPtype : null;
  const [seenOtpSession, setSeenOtpSession] = useState(null);
  if (otpSessionKey !== seenOtpSession) {
    setSeenOtpSession(otpSessionKey);
    // Only actually reset the fields when a session is opening, not
    // when it closes back to null — nothing to clear while it's hidden,
    // and this is also what makes a cancel-then-reopen-with-the-same-
    // type correctly count as "new" next time (the closing step here
    // clears seenOtpSession so the reopen's key no longer matches it).
    if (otpSessionKey) {
      setOtp("");
      setOtpError(false);
      setResendCooldown(RESEND_COOLDOWN_SEC);
    }
  }

  useEffect(() => {
    if (!OTPModal || resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [OTPModal, resendCooldown]);

  async function handleVerifyOTP(code) {
    const value = code ?? otp;
    if (value.length !== OTP_LENGTH) return;

    let ok = false;

    if (OTPtype === "login") {
      const result = await login(dispatch, {
        otp: value,
        email: loginData.email,
        password: loginData.password,
      }, navigate);
      ok = result.success;
    } else if (OTPtype === "signup") {
      ok = await signUP(dispatch, {
        otp: value,
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
        name: signupData.organization,
        phone: signupData.phone,
      });
    }

    // On success, login()/signUP() themselves close the modal — nothing
    // left to reset here. On failure the modal stays open (see the fix
    // to both of those), so give a clear signal and a clean slate to
    // retype rather than leaving a wrong code sitting in the boxes.
    if (!ok) {
      setOtpError(true);
      setOtp("");
    }
  }

  function handleResendOtp() {
    if (resendCooldown > 0) return;
    const email = OTPtype === "login" ? loginData.email : signupData.email;
    sendOTP({ email, name: "User", type: OTPtype }, dispatch);
    setOtp("");
    setOtpError(false);
    setResendCooldown(RESEND_COOLDOWN_SEC);
  }

  // Login sits left of signup, so moving to signup travels forward.
  const direction = tab === "signup" ? 1 : -1;

  return (
    <div className={styles.page}>
      {/* LEFT BRAND PANEL */}

      <div className={styles.left}>
        <div className={styles.brandAurora} aria-hidden="true">
          <span />
          <span />
        </div>

        <Motion.div
          className={styles.brandBox}
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          <Motion.h1
            className={styles.logo}
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
          >
            Proctored<span>Link</span>
          </Motion.h1>

          <Motion.h2
            className={styles.headline}
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
          >
            Secure Online
            <br />
            Examination Platform
          </Motion.h2>

          <Motion.p
            className={styles.subtitle}
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
          >
            Conduct AI-proctored exams with real-time monitoring, analytics, and
            enterprise-grade security.
          </Motion.p>

          <div className={styles.featureList}>
            {["AI Proctoring", "Real-time Monitoring", "Fraud Detection", "Secure Exam Environment"].map((f) => (
              <Motion.p
                key={f}
                variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } } }}
              >
                <span className={styles.tick} aria-hidden="true">
                  <svg viewBox="0 0 14 14" fill="none">
                    <path d="M3 7.5l2.8 2.8L11 4.5" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {f}
              </Motion.p>
            ))}
          </div>
        </Motion.div>
      </div>

      {/* RIGHT AUTH PANEL */}

      <div className={styles.right}>
        <Motion.div
          className={styles.authCard}
          initial={reduce ? false : { opacity: 0, y: 22, scale: 0.98 }}
          animate={reduce ? false : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
        >
          <div className={styles.tabs} role="tablist">
            <div
              className={styles.slider}
              style={{
                left: tab === "login" ? "4px" : "50%",
              }}
            />

            <button
              className={tab === "login" ? styles.active : ""}
              onClick={() => setTab("login")}
              role="tab"
              aria-selected={tab === "login"}
              type="button"
            >
              Login
            </button>

            <button
              className={tab === "signup" ? styles.active : ""}
              onClick={() => setTab("signup")}
              role="tab"
              aria-selected={tab === "signup"}
              type="button"
            >
              Organization SignUp
            </button>
          </div>

          <div className={styles.formWrap}>
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              {tab === "login" && (
                <Motion.form
                  key="login"
                  className={styles.form}
                  onSubmit={handleLoginSubmit}
                  custom={direction}
                  variants={reduce ? undefined : formVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <div className={styles.field}>
                    <label htmlFor="login-email">Email</label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="organization@email.com"
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="login-password">Password</label>
                    <div className={styles.inputWrap}>
                      <input
                        id="login-password"
                        type={showPw.login ? "text" : "password"}
                        name="password"
                        autoComplete="current-password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        className={styles.pwToggle}
                        onClick={() => togglePw("login")}
                        aria-label={showPw.login ? "Hide password" : "Show password"}
                      >
                        <EyeIcon open={showPw.login} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className={styles.forgotLink}
                      onClick={openForgotPassword}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button className={styles.primaryBtn}>Login</button>
                </Motion.form>
              )}

              {tab === "signup" && (
                <Motion.form
                  key="signup"
                  className={styles.form}
                  onSubmit={handleSignupSubmit}
                  custom={direction}
                  variants={reduce ? undefined : formVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <div className={styles.field}>
                    <label htmlFor="su-org">Organization Name</label>
                    <input
                      id="su-org"
                      name="organization"
                      autoComplete="organization"
                      value={signupData.organization}
                      onChange={handleSignupChange}
                      placeholder="Your organization"
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="su-email">Email</label>
                    <input
                      id="su-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      placeholder="org@email.com"
                    />
                  </div>

                  <div className={styles.phoneRow}>
                    <div className={styles.code}>
                      <label htmlFor="su-code">Code</label>
                      <select
                        id="su-code"
                        name="code"
                        value={signupData.code}
                        onChange={handleSignupChange}
                      >
                        <option>+91</option>
                        <option>+1</option>
                        <option>+44</option>
                      </select>
                    </div>

                    <div className={styles.phone}>
                      <label htmlFor="su-phone">Phone</label>
                      <input
                        id="su-phone"
                        name="phone"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        value={signupData.phone}
                        onChange={handleSignupChange}
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="su-pw">Password</label>
                    <div className={styles.inputWrap}>
                      <input
                        id="su-pw"
                        type={showPw.su ? "text" : "password"}
                        name="password"
                        autoComplete="new-password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                      />
                      <button
                        type="button"
                        className={styles.pwToggle}
                        onClick={() => togglePw("su")}
                        aria-label={showPw.su ? "Hide password" : "Show password"}
                      >
                        <EyeIcon open={showPw.su} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="su-cpw">Confirm Password</label>
                    <div className={styles.inputWrap}>
                      <input
                        id="su-cpw"
                        type={showPw.suc ? "text" : "password"}
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                      />
                      <button
                        type="button"
                        className={styles.pwToggle}
                        onClick={() => togglePw("suc")}
                        aria-label={showPw.suc ? "Hide password" : "Show password"}
                      >
                        <EyeIcon open={showPw.suc} />
                      </button>
                    </div>
                  </div>

                  <button
                    className={styles.primaryBtn}
                    onClick={() => handleRequestOTP()}
                  >
                    Create Organization Account
                  </button>
                </Motion.form>
              )}
            </AnimatePresence>
          </div>
        </Motion.div>
      </div>

      <AnimatePresence>
        {OTPModal && (
          <Motion.div
            className={styles.otpOverlay}
            initial={reduce ? false : { opacity: 0 }}
            animate={reduce ? false : { opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Motion.div
              className={styles.otpModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="otp-modal-title"
              initial={reduce ? false : { opacity: 0, y: 18, scale: 0.96 }}
              animate={reduce ? false : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <span className={styles.otpIconRing} aria-hidden="true">
                <ShieldIcon />
              </span>

              <h3 id="otp-modal-title">Verify Your Identity</h3>

              <p className={styles.otpSubtitle}>
                Enter the 6-digit code sent to{" "}
                <strong>{maskEmail(OTPtype === "login" ? loginData.email : signupData.email)}</strong>
              </p>

              <OtpBoxes
                value={otp}
                onChange={(next) => { setOtp(next); if (otpError) setOtpError(false); }}
                onComplete={handleVerifyOTP}
                error={otpError}
              />

              {otpError && (
                <p className={styles.otpErrorMsg} role="alert">
                  Incorrect code — please try again.
                </p>
              )}

              <button
                type="button"
                className={styles.otpResend}
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend code in 0:${String(resendCooldown).padStart(2, "0")}`
                  : "Resend code"}
              </button>

              <div className={styles.otpActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => dispatch(removeShowOTP())}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={styles.primaryBtn}
                  aria-disabled={otp.length !== OTP_LENGTH}
                  onClick={() => handleVerifyOTP()}
                >
                  Verify OTP
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {forgotOpen && (
          <Motion.div
            className={styles.otpOverlay}
            initial={reduce ? false : { opacity: 0 }}
            animate={reduce ? false : { opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Motion.div
              className={styles.otpModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="forgot-modal-title"
              initial={reduce ? false : { opacity: 0, y: 18, scale: 0.96 }}
              animate={reduce ? false : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <span className={styles.otpIconRing} aria-hidden="true">
                <ShieldIcon />
              </span>

              {forgotSent ? (
                <>
                  <h3 id="forgot-modal-title">Check Your Email</h3>
                  <p className={styles.otpSubtitle}>
                    If an account exists for <strong>{forgotEmail}</strong>, a password reset
                    link has been sent. It's valid for 10 minutes.
                  </p>
                  <div className={styles.otpActions}>
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      onClick={closeForgotPassword}
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleForgotSubmit}>
                  <h3 id="forgot-modal-title">Reset Your Password</h3>
                  <p className={styles.otpSubtitle}>
                    Enter your account email and we'll send you a link to set a new password.
                  </p>

                  <div className={styles.field}>
                    <label htmlFor="forgot-email">Email</label>
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@email.com"
                      required
                    />
                  </div>

                  <div className={styles.otpActions}>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={closeForgotPassword}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.primaryBtn}>
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {signupStatus && (
          <Motion.div
            className={styles.resultOverlay}
            initial={reduce ? false : { opacity: 0 }}
            animate={reduce ? false : { opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Motion.div
              className={styles.resultModal}
              role="alertdialog"
              aria-modal="true"
              initial={reduce ? false : { opacity: 0, y: 18, scale: 0.94 }}
              animate={reduce ? false : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {signupStatus === "success" && (
                <div className={styles.successBox}>
                  <div className={styles.checkmark}></div>
                  <h3>Signup Successful</h3>
                  <p>Your organization account is ready.</p>
                </div>
              )}

              {signupStatus === "failed" && (
                <div className={styles.failBox}>
                  <div className={styles.cross}></div>
                  <h3>Signup Failed</h3>
                  <p>Something went wrong. Please try again.</p>
                </div>
              )}

              <button
                className={styles.primaryBtn}
                onClick={() => dispatch(setSignupStatusNull())}
              >
                Close
              </button>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
