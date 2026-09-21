import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./PlatformAnalytics.module.css";
import {
  VscGraph,
  VscOrganization,
  VscMortarBoard,
  VscChecklist,
} from "react-icons/vsc";
import { FiAward } from "react-icons/fi";
import { fetchPlatformAnalytics } from "../../Services/Oprations/Admin";

const STATUS_META = {
  assigned:    { label: "Assigned",    color: "#60a5fa" },
  inprocess:   { label: "In Progress", color: "#f59e0b" },
  completed:   { label: "Completed",   color: "#34d399" },
  terminated:  { label: "Terminated",  color: "#f87171" },
  interrupted: { label: "Interrupted", color: "#a78bfa" },
};

function StatCard({ icon, label, value, sub }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statCardBody}>
        <span className={styles.statCardValue}>{value}</span>
        <span className={styles.statCardLabel}>{label}</span>
        {sub && <span className={styles.statCardSub}>{sub}</span>}
      </div>
    </div>
  );
}

export default function PlatformAnalytics() {
  const { analytics } = useSelector((state) => state.Admin) || { analytics: null };
  const dispatch = useDispatch();

  useEffect(() => {
    fetchPlatformAnalytics(dispatch);
  }, []);

  const maxStatusCount = useMemo(() => {
    if (!analytics) return 1;
    return Math.max(1, ...Object.values(analytics.examSessionsByStatus));
  }, [analytics]);

  const maxActivity = useMemo(() => {
    if (!analytics) return 1;
    return Math.max(1, ...analytics.last30DaysActivity.map((d) => d.started));
  }, [analytics]);

  const maxTopOrg = useMemo(() => {
    if (!analytics?.topOrganisations?.length) return 1;
    return Math.max(1, ...analytics.topOrganisations.map((o) => o.sessionCount));
  }, [analytics]);

  if (!analytics) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>Loading platform analytics…</div>
        </div>
      </div>
    );
  }

  const { organisationCounts, totalStudents, totalExamSessions, passRate, passFailCounts } = analytics;

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.grain} />

      <div className={styles.container}>
        {/* ── HEADER ── */}
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <span className={styles.logoMark}><VscGraph /></span>
            <div>
              <h1 className={styles.pageTitle}>Platform Analytics</h1>
              <p className={styles.pageSubtitle}>
                Exam activity and organisation growth across the whole platform
              </p>
            </div>
          </div>
        </header>

        {/* ── STAT CARDS ── */}
        <div className={styles.statGrid}>
          <StatCard
            icon={<VscOrganization />}
            label="Organisations"
            value={organisationCounts.total}
            sub={`${organisationCounts.approved} approved · ${organisationCounts.pending} pending`}
          />
          <StatCard
            icon={<VscMortarBoard />}
            label="Students"
            value={totalStudents}
          />
          <StatCard
            icon={<VscChecklist />}
            label="Exam Sessions"
            value={totalExamSessions}
          />
          <StatCard
            icon={<FiAward />}
            label="Pass Rate"
            value={`${passRate}%`}
            sub={`${passFailCounts.pass} pass · ${passFailCounts.fail} fail`}
          />
        </div>

        <div className={styles.gridTwo}>
          {/* ── SESSIONS BY STATUS ── */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Exam Sessions by Status</div>
            <div className={styles.barList}>
              {Object.entries(analytics.examSessionsByStatus).map(([key, count]) => {
                const meta = STATUS_META[key];
                return (
                  <div className={styles.barRow} key={key}>
                    <span className={styles.barLabel}>{meta.label}</span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{
                          width: `${(count / maxStatusCount) * 100}%`,
                          background: meta.color,
                        }}
                      />
                    </div>
                    <span className={styles.barValue}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── TOP ORGANISATIONS ── */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Top Organisations by Exam Volume</div>
            {analytics.topOrganisations.length === 0 ? (
              <div className={styles.emptyMini}>No exam sessions yet</div>
            ) : (
              <div className={styles.leaderboard}>
                {analytics.topOrganisations.map((org, idx) => (
                  <div className={styles.leaderRow} key={org.organisationId}>
                    <span className={styles.leaderRank}>#{idx + 1}</span>
                    <div className={styles.leaderInfo}>
                      <span className={styles.leaderName}>{org.name}</span>
                      <span className={styles.leaderEmail}>{org.email}</span>
                    </div>
                    <div className={styles.leaderBarTrack}>
                      <div
                        className={styles.leaderBarFill}
                        style={{ width: `${(org.sessionCount / maxTopOrg) * 100}%` }}
                      />
                    </div>
                    <span className={styles.leaderCount}>{org.sessionCount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 30 DAY ACTIVITY ── */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Exam Sessions Started — Last 30 Days</div>
          <div className={styles.activityChart}>
            {analytics.last30DaysActivity.map((day) => (
              <div className={styles.activityCol} key={day.date}>
                <div
                  className={styles.activityBar}
                  style={{ height: `${(day.started / maxActivity) * 100}%` }}
                  title={`${day.date}: ${day.started} started, ${day.completed} completed`}
                />
              </div>
            ))}
          </div>
          <div className={styles.activityAxis}>
            <span>{analytics.last30DaysActivity[0]?.date}</span>
            <span>{analytics.last30DaysActivity[analytics.last30DaysActivity.length - 1]?.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
