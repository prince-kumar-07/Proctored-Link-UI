import { Suspense } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import PageTransition from "../Motion/PageTransition";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const location = useLocation();

  return (
    <div className={styles.dashboard}>
      <Sidebar />

      <div className={styles.main}>
        <div className={styles.contentArea}>
          {/* Its own boundary, so loading a split dashboard page swaps
              only the content area and leaves the sidebar in place. */}
          <Suspense fallback={<div className={styles.outletFallback} aria-busy="true" />}>
            {/* The key remounts the outlet on navigation, which also
                restarts the entrance animation for the incoming page. */}
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
