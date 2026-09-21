import { useEffect, useState } from "react";
import styles from "./PlatformSettings.module.css";
import { VscSettingsGear, VscShield } from "react-icons/vsc";
import { fetchPlatformSettings, updatePlatformSettings } from "../../Services/Oprations/Admin";

export default function PlatformSettings() {
  const [settings, setSettings] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchPlatformSettings().then((data) => { if (data) setSettings(data); });
  }, []);

  const handleToggle = async () => {
    setBusy(true);
    const result = await updatePlatformSettings(!settings.mandatoryTwoFactor);
    if (result) setSettings(result);
    setBusy(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.grain} />

      <div className={styles.container}>
        {/* ── HEADER ── */}
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <span className={styles.logoMark}><VscSettingsGear /></span>
            <div>
              <h1 className={styles.pageTitle}>Platform Settings</h1>
              <p className={styles.pageSubtitle}>
                Platform-wide policy that applies to every account, regardless of role
              </p>
            </div>
          </div>
        </header>

        {/* ── SETTINGS CARD ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <VscShield className={styles.cardIcon} />
            <span className={styles.cardTitle}>Security Policy</span>
          </div>

          {settings ? (
            <div className={styles.settingRow}>
              <div>
                <p className={styles.settingTitle}>Mandatory Two-Factor Authentication</p>
                <p className={styles.settingDesc}>
                  When on, every account — organisations, proctors, and other admins — must
                  verify a login OTP regardless of their own preference. Individual accounts
                  can still turn 2FA on for themselves when this is off.
                </p>
              </div>

              <button
                type="button"
                className={`${styles.toggle} ${settings.mandatoryTwoFactor ? styles.toggleOn : ""}`}
                onClick={handleToggle}
                disabled={busy}
                aria-pressed={settings.mandatoryTwoFactor}
                aria-label="Toggle mandatory two-factor authentication"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          ) : (
            <div className={styles.loadingState}>Loading settings…</div>
          )}
        </div>
      </div>
    </div>
  );
}
