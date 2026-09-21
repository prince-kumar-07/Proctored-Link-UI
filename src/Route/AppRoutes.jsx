import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";
import OpenRoute from "./OpenRoute";
import ExamSecurityGuard from "./ExamSecurityGuard";

import DesktopOnly from "../Utils/DesktopOnly";

/**
 * A lazy component that can also be fetched ahead of time.
 * Calling `.preload()` warms the module cache so the later render is
 * instant and never waits on the network.
 */
function lazyWithPreload(factory) {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
}

/* ------------------------------------------------------------------
   The exam flow is split out like everything else, but never fetched
   on demand at a moment that matters: the chunks are preloaded while
   the browser is idle, and immediately on entering any /assessment
   route. By the time a candidate moves between exam screens the code
   is already in memory, so a proctored session never blocks on a
   network request.
   ------------------------------------------------------------------ */
const ExamAuth = lazyWithPreload(() => import("../Components/Student Page/ExamAuth"));
const ExamPreCheck = lazyWithPreload(() => import("../Components/Student Page/ExamPreCheck"));
const ExamInstructions = lazyWithPreload(() => import("../Components/Student Page/ExamInstructions"));
const WaitingLobby = lazyWithPreload(() => import("../Components/Student Page/WaitingLobby"));
const ExamTerminated = lazyWithPreload(() => import("../Components/Student Page/ExamTerminated"));
const ExamSubmitted = lazyWithPreload(() => import("../Components/Student Page/ExamSubmitted"));
const ExamRedirect = lazyWithPreload(() => import("../Components/Student Page/Examredirect"));
const ExamPage = lazyWithPreload(() => import("../Components/Student Page/ExamPage"));

const EXAM_FLOW = [
  ExamAuth,
  ExamPreCheck,
  ExamInstructions,
  WaitingLobby,
  ExamPage,
  ExamTerminated,
  ExamSubmitted,
  ExamRedirect,
];

function preloadExamFlow() {
  EXAM_FLOW.forEach((c) => c.preload?.());
}

/* ------------------------------------------------------------------
   Marketing and dashboard screens are split out. A visitor landing on
   the home page no longer downloads the question builder.
   ------------------------------------------------------------------ */
const Home = lazy(() => import("../Components/Home/Home"));
const AuthPage = lazy(() => import("../Components/Auth/AuthPage"));
const SetPassword = lazy(() => import("../Components/Auth/SetPassword"));
const Pricing = lazy(() => import("../Components/Common/Pricing"));
const Features = lazy(() => import("../Components/Common/Features"));
const Security = lazy(() => import("../Components/Common/Security"));
const Docs = lazy(() => import("../Components/Common/Docs"));
const NotFound = lazy(() => import("../Components/Common/NotFound"));

const Dashboard = lazy(() => import("../Components/Dashboard/Dashboard"));
const Profile = lazy(() => import("../Components/Dashboard/Profile"));
const Setting = lazy(() => import("../Components/Dashboard/Setting"));
const Students = lazy(() => import("../Components/Organisation/Students"));
const Exam = lazy(() => import("../Components/Dashboard/Exam"));
const QuestionBuilder = lazy(() => import("../Components/Organisation/QuestionBuilder"));
const QuestionBankBuilder = lazy(() => import("../Components/Organisation/QuestionBankBuilder"));

const ManageOrganisations = lazy(() => import("../Components/Admin/ManageOrganisations"));
const PlatformAnalytics = lazy(() => import("../Components/Admin/PlatformAnalytics"));
const AdminSecurity = lazy(() => import("../Components/Admin/Security"));
const ManageProctors = lazy(() => import("../Components/Admin/ManageProctors"));
const PlatformSettings = lazy(() => import("../Components/Admin/PlatformSettings"));
const LiveMonitor = lazy(() => import("../Components/Proctor/LiveMonitor"));

/** Shown only while a split chunk is in flight — usually a single frame. */
function RouteFallback() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        background: "var(--bg)",
      }}
      aria-busy="true"
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "2.5px solid var(--border-hi)",
          borderTopColor: "var(--accent)",
          animation: "plRouteSpin 0.7s linear infinite",
        }}
      />
      <style>{"@keyframes plRouteSpin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}

export default function AppRoutes() {
  const location = useLocation();
  const inAssessment = location.pathname.toLowerCase().startsWith("/assessment");

  useEffect(() => {
    // A candidate is already in the flow — fetch the rest of it now.
    if (inAssessment) {
      preloadExamFlow();
      return;
    }

    // Otherwise wait for an idle moment so the current page keeps the
    // network and main thread to itself.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(preloadExamFlow, { timeout: 4000 });
      return () => window.cancelIdleCallback?.(id);
    }

    const t = setTimeout(preloadExamFlow, 2500);
    return () => clearTimeout(t);
  }, [inAssessment]);

  return (
    <div>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Open Routes */}
          <Route
            path="/auth"
            element={
              <OpenRoute>
                <DesktopOnly>
                  <AuthPage />
                </DesktopOnly>
              </OpenRoute>
            }
          />

          <Route
            path="/set-password/:token"
            element={
              <OpenRoute>
                <DesktopOnly>
                  <SetPassword />
                </DesktopOnly>
              </OpenRoute>
            }
          />

          <Route path="/" element={<Home />} />
          <Route path="/Pricing" element={<Pricing />} />
          <Route path="/Features" element={<Features />} />
          <Route path="/Security" element={<Security />} />
          <Route path="/Docs" element={<Docs />} />
          <Route path="*" element={<NotFound />} />

          <Route
            path="/assessment/:uniqueAccessToken"
            element={
              <OpenRoute>
                <DesktopOnly>
                  <ExamAuth />
                </DesktopOnly>
              </OpenRoute>
            }
          />

          <Route
            path="/assessment/exam-pre-check/:uniqueAccessToken"
            element={
              <OpenRoute>
                <DesktopOnly>
                  <ExamPreCheck />
                </DesktopOnly>
              </OpenRoute>
            }
          />

          <Route
            path="/assessment/exam-instructions/:uniqueAccessToken"
            element={
              <OpenRoute>
                <DesktopOnly>
                  <ExamSecurityGuard>
                    <ExamInstructions />
                  </ExamSecurityGuard>
                </DesktopOnly>
              </OpenRoute>
            }
          />

          <Route
            path="/assessment/WaitingLobby/:uniqueAccessToken"
            element={
              <OpenRoute>
                <DesktopOnly>
                  <ExamSecurityGuard>
                    <WaitingLobby />
                  </ExamSecurityGuard>
                </DesktopOnly>
              </OpenRoute>
            }
          />

          <Route
            path="/assessment/invalid-user"
            element={
              <OpenRoute>
                <DesktopOnly>
                  <ExamRedirect />
                </DesktopOnly>
              </OpenRoute>
            }
          />

          <Route
            path="/assessment/questions-page"
            element={
              <OpenRoute>
                <DesktopOnly>
                  <ExamSecurityGuard enableLiveProctoring>
                    <ExamPage />
                  </ExamSecurityGuard>
                </DesktopOnly>
              </OpenRoute>
            }
          />

          <Route
            path="/assessment/ExamTerminated"
            element={
              <OpenRoute>
                <DesktopOnly>
                  <ExamTerminated />
                </DesktopOnly>
              </OpenRoute>
            }
          />

          <Route
            path="/ExamTerminated"
            element={
              <OpenRoute>
                <DesktopOnly>
                  <ExamTerminated />
                </DesktopOnly>
              </OpenRoute>
            }
          />

          <Route
            path="/ExamSubmitted"
            element={
              <OpenRoute>
                <DesktopOnly>
                  <ExamSubmitted />
                </DesktopOnly>
              </OpenRoute>
            }
          />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DesktopOnly>
                  <Dashboard />
                </DesktopOnly>
              </PrivateRoute>
            }
          >
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Setting />} />
            <Route path="questionbank" element={<QuestionBankBuilder />} />
            <Route path="questions" element={<QuestionBuilder />} />
            <Route path="students" element={<Students />} />
            <Route path="exams" element={<Exam />} />
            <Route path="organisations" element={<ManageOrganisations />} />
            <Route path="platform-analytics" element={<PlatformAnalytics />} />
            <Route path="security" element={<AdminSecurity />} />
            <Route path="proctors" element={<ManageProctors />} />
            <Route path="platform-settings" element={<PlatformSettings />} />
            <Route path="live-monitor" element={<LiveMonitor />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}
