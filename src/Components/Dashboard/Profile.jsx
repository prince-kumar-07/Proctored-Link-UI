import { useSelector } from "react-redux";
import styles from "./Profile.module.css";
import { FiUser, FiMail, FiPhone, FiShield, FiCheckCircle, FiXCircle } from "react-icons/fi";

function Profile() {
  const { user } = useSelector((state) => state.user);

  const rows = [
    { label: "Name",           value: user?.name,                             icon: <FiUser /> },
    { label: "Email",          value: user?.email,                            icon: <FiMail /> },
    { label: "Phone",          value: user?.phone,                            icon: <FiPhone /> },
    { label: "Role",           value: user?.role,                             icon: <FiShield /> },
    {
      label: "Email Verified",
      value: user?.isAccountVerified ? "Verified" : "Not Verified",
      icon: user?.isAccountVerified ? <FiCheckCircle /> : <FiXCircle />,
      verified: user?.isAccountVerified,
      isBadge: true,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.grain} />

      <div className={styles.profile}>

        {/* ── HEADER ── */}
        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatarRing} />
            <div className={styles.avatar}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>

          <div className={styles.headerInfo}>
            <p className={styles.headerEyebrow}>Account Profile</p>
            <h2 className={styles.headerName}>{user?.name}</h2>
            <p className={styles.headerEmail}>{user?.email}</p>
          </div>

          <div className={styles.rolePill}>
            <FiShield className={styles.rolePillIcon} />
            {user?.role}
          </div>
        </div>

        {/* ── CARD ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Account Information</span>
            <span className={styles.cardLine} />
          </div>

          <div className={styles.rows}>
            {rows.map((row, i) => (
              <div key={i} className={styles.row} style={{ animationDelay: `${i * 0.06}s` }}>
                <div className={styles.rowLeft}>
                  <span className={styles.rowIcon}>{row.icon}</span>
                  <span className={styles.rowLabel}>{row.label}</span>
                </div>

                {row.isBadge ? (
                  <span className={`${styles.verifiedBadge} ${row.verified ? styles.verifiedYes : styles.verifiedNo}`}>
                    {row.icon}
                    {row.value}
                  </span>
                ) : (
                  <span className={styles.rowValue}>{row.value || "—"}</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;