import React, { useEffect, useState } from 'react';
import styles from './ExamAuth.module.css';
import { useSelector, useDispatch } from "react-redux";
import { ValidateExamToken, ValidateExamAccessKey } from "../../Services/Oprations/Exam";
import { useParams, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  FiUser, FiMail, FiShield, FiClock,
  FiKey, FiArrowRight, FiLock, FiEye, FiEyeOff
} from "react-icons/fi";

export default function ExamAuth() {
  const { examStudentData } = useSelector((state) => state.Students) || { examStudentData: null };
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { uniqueAccessToken } = useParams();

  useEffect(() => {
    ValidateExamToken(dispatch, uniqueAccessToken, navigate);
  }, []);

  const [loginKey,   setLoginKey]   = useState('');
  const [error,      setError]      = useState('');
  const [showKey,    setShowKey]    = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loginKey.trim()) {
      toast.error('Please enter the login key');
      return;
    }
    ValidateExamAccessKey(dispatch, uniqueAccessToken, loginKey, navigate);
  };

  const fields = [
    { icon: <FiUser />,   label: "Student Name",   value: examStudentData?.studentName  || "—" },
    { icon: <FiMail />,   label: "Email",           value: examStudentData?.email        || "—" },
    { icon: <FiShield />, label: "Organization",    value: examStudentData?.organization || "—" },
    { icon: <FiClock />,  label: "Exam Duration",   value: examStudentData?.duration     || "—" },
  ];

  return (
    <div className={styles.page}>
      {/* Atmosphere */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />
      <div className={styles.grain} />

      {/* Grid lines */}
      <div className={styles.gridLines} aria-hidden="true">
        {[...Array(6)].map((_, i) => <div key={i} className={styles.gridLine} />)}
      </div>

      <div className={styles.container}>

        {/* ── TOP BADGE ── */}
        <div className={styles.topBadge}>
          <span className={styles.topBadgeDot} />
          <FiShield className={styles.topBadgeIcon} />
          Proctored Exam Session
        </div>

        {/* ── HEADLINE ── */}
        <div className={styles.headline}>
          <h1 className={styles.title}>
            Exam<br />
            <span className={styles.titleAccent}>Authentication</span>
          </h1>
          <p className={styles.subtitle}>
            Verify your identity and enter the access key to begin your secure, proctored session.
          </p>
        </div>

        {/* ── MAIN CARD ── */}
        <div className={styles.card}>

          {/* Card inner glow */}
          <div className={styles.cardGlow} />

          {/* ── INFO SECTION ── */}
          <div className={styles.infoSection}>
            <div className={styles.infoSectionHeader}>
              <span className={styles.sectionDot} />
              <span className={styles.sectionLabel}>Candidate Details</span>
            </div>
            <div className={styles.infoGrid}>
              {fields.map(({ icon, label, value }) => (
                <div key={label} className={styles.infoField}>
                  <div className={styles.infoFieldLeft}>
                    <span className={styles.infoIcon}>{icon}</span>
                    <span className={styles.infoLabel}>{label}</span>
                  </div>
                  <span className={styles.infoValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── DIVIDER ── */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>
              <FiLock className={styles.dividerIcon} />
              Secure Access
            </span>
            <span className={styles.dividerLine} />
          </div>

          {/* ── LOGIN KEY FORM ── */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label className={styles.inputLabel}>
                <FiKey className={styles.inputLabelIcon} />
                Exam Login Key
                <span className={styles.required}>*</span>
              </label>

              <div className={styles.inputWrap}>
                <FiKey className={styles.inputIcon} />
                <input
                  id="loginKey"
                  type={showKey ? "text" : "password"}
                  value={loginKey}
                  onChange={(e) => setLoginKey(e.target.value)}
                  placeholder="Enter your exam access key"
                  className={styles.input}
                  autoComplete="off"
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowKey(v => !v)}
                  tabIndex={-1}
                >
                  {showKey ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {error && (
                <p className={styles.errorMsg}>
                  <FiShield className={styles.errorIcon} /> {error}
                </p>
              )}
            </div>

            <button type="submit" className={styles.submitBtn}>
              <span className={styles.submitBtnInner}>
                Proceed to Exam
                <FiArrowRight className={styles.submitArrow} />
              </span>
              <span className={styles.submitBtnShine} />
            </button>
          </form>

          {/* ── FOOTER NOTE ── */}
          <p className={styles.footerNote}>
            <FiShield className={styles.footerIcon} />
            Ensure you're on a secure device with a stable connection before proceeding.
          </p>
        </div>

        {/* ── BOTTOM WATERMARK ── */}
        <div className={styles.watermark}>
          Powered by <span className={styles.watermarkBrand}>ProctorAI</span>
        </div>
      </div>
    </div>
  );
}