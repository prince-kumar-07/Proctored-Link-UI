import styles from "./Spinner.module.css";
import { useSelector } from "react-redux";

export default function Spinner({ size = "large" }) {
  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  const { isLoading, loadingMessage } = useSelector(
    (state) => state.spinner || {},
  );

  if (!isLoading) return null;

  return (
    <div
      className={styles.overlay}
      role="alertdialog"
      aria-busy="true"
      aria-live="assertive"
      aria-label={loadingMessage || "Loading"}
    >
      <div className={styles.container}>
        <div className={`${styles.spinner} ${sizeClass[size]}`} aria-hidden="true">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>

        {loadingMessage ? (
          <p className={styles.message}>{loadingMessage}</p>
        ) : null}

        <span className={styles.dots} aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>
    </div>
  );
}
