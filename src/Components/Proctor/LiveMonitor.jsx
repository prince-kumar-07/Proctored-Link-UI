import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./LiveMonitor.module.css";
import { VscEye, VscCircleFilled } from "react-icons/vsc";
import { FiUser, FiClock, FiAlertTriangle, FiVideo } from "react-icons/fi";
import { fetchLiveExamSessions } from "../../Services/Oprations/Proctor";
import LiveSessionViewer from "./LiveSessionViewer";

const POLL_MS = 8000;

function elapsed(startTime) {
  if (!startTime) return "—";
  const ms = Date.now() - new Date(startTime).getTime();
  const mins = Math.max(0, Math.floor(ms / 60000));
  const hrs = Math.floor(mins / 60);
  return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
}

export default function LiveMonitor() {
  const { liveSessions } = useSelector((state) => state.Proctor) || { liveSessions: [] };
  const dispatch = useDispatch();
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    fetchLiveExamSessions(dispatch);
    const id = setInterval(() => fetchLiveExamSessions(dispatch), POLL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.grain} />

      <div className={styles.container}>
        {/* ── HEADER ── */}
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <span className={styles.logoMark}><VscEye /></span>
            <div>
              <h1 className={styles.pageTitle}>Live Monitor</h1>
              <p className={styles.pageSubtitle}>
                Every in-progress exam session across your assigned organisations
              </p>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.liveBadge}>
              <VscCircleFilled className={styles.liveDot} />
              {liveSessions.length} live now
            </div>
          </div>
        </header>

        {/* ── GRID ── */}
        {liveSessions.length === 0 ? (
          <div className={styles.emptyState}>
            <VscEye className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No candidates in progress</p>
            <p className={styles.emptyText}>
              Sessions from your assigned organisations will appear here the moment a candidate
              starts their exam.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {liveSessions.map((session, idx) => (
              <button
                key={session._id}
                className={styles.card}
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => setViewing(session)}
              >
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>
                    {session.studentId?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className={styles.livePill}>
                    <VscCircleFilled className={styles.livePillDot} /> LIVE
                  </span>
                </div>

                <div className={styles.candidateName}>
                  <FiUser className={styles.rowIcon} />
                  {session.studentId?.name || "Unknown candidate"}
                </div>
                <div className={styles.orgName}>{session.organisationId?.name}</div>
                <div className={styles.examTitle}>{session.questionBankId?.title}</div>

                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>
                    <FiClock className={styles.rowIcon} /> {elapsed(session.examStartTime)}
                  </span>
                  <span
                    className={styles.metaItem}
                    style={session.warningCount > 0 ? { color: "#f59e0b" } : undefined}
                  >
                    <FiAlertTriangle className={styles.rowIcon} /> {session.warningCount || 0}/3
                  </span>
                </div>

                <div className={styles.watchBtn}>
                  <FiVideo /> Watch Live
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {viewing && (
        <LiveSessionViewer session={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}
