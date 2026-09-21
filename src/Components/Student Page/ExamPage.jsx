import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./ExamPage.module.css";
import AssessmentNavbar from "../Common/AssessmentNavbar";
import {
  FiClock, FiFlag, FiChevronLeft, FiChevronRight,
  FiSend, FiBookOpen, FiAlertTriangle, FiCheck,
  FiGrid, FiX, FiZap, FiMaximize2, FiMinimize2,
  FiSun, FiMoon
} from "react-icons/fi";
import {
  fetchExamQuestions,
  autoSaveExamResponse,
  submitExamToServer,
} from "../../Services/Oprations/Exam";
import { resetExamQuestions } from "../../Reducer/Slice/QuestionsSlice";

/* Font loaded in ExamPage.module.css via @import */

// Only used if the server response is somehow missing examDuration —
// real questions and exam meta now come from fetchExamQuestions(),
// which also returns selectedAnswer per question for resuming a
// session, and examStartTime/examDuration so the countdown below
// resumes at the correct time remaining instead of always restarting.
const FALLBACK_DURATION_MIN = 45;

const DIFF_CONFIG = {
  easy:   { label: "Easy",   color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.22)"  },
  medium: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.22)" },
  hard:   { label: "Hard",   color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.22)" },
};

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function ExamPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Real questions + session meta (title, duration, start time), loaded
  // below via fetchExamQuestions. Identity is the examToken cookie set
  // when the access key was verified — nothing here needs a URL param.
  const questions = useSelector((s) => s.Question.questions);
  const meta = useSelector((s) => s.Question.meta);

  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState({}); // { [questionId]: optionText }
  const [flagged,   setFlagged]   = useState({}); // { [questionId]: bool }
  // null until meta arrives — see the resume-aware init effect below.
  const [timeLeft,  setTimeLeft]  = useState(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [animDir,     setAnimDir]     = useState("next");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState("dark"); // "dark" | "light"
  const appRef = useRef(null);

  const submittingRef = useRef(false);
  // Seconds of exam time used so far. Seeded from examStartTime on load
  // (so a resumed/reloaded session doesn't undercount) and ticked
  // forward by the timer effect; sent to the server on autosave/submit
  // purely for record-keeping — scoring itself is answer-based, not
  // time-based.
  const elapsedRef = useRef(0);

  // Mirrors `answers` for the periodic heartbeat below, which needs a
  // stable effect (doesn't re-register — and so doesn't reset its own
  // interval timer — on every keystroke) while still reading whatever
  // the latest answers actually are when it fires.
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  /* ── LOAD REAL QUESTIONS ── */
  useEffect(() => {
    fetchExamQuestions(dispatch);
    // Leaving the exam page clears this out of Redux — otherwise a
    // second exam started later in the same tab could briefly render
    // with a stale previous session's questions before its own fetch
    // resolves.
    return () => dispatch(resetExamQuestions());
  }, [dispatch]);

  /* ── RESUME-AWARE TIMER INIT ──
     This one stays a real effect rather than the render-time pattern
     used below: it has to read the current wall-clock time
     (Date.now()) to work out how much of the exam is already elapsed,
     and reading the clock is an impure operation that render-time code
     must not perform (React's purity rule flags it even when guarded).
     Effects are specifically the place impure work like this belongs.
     Guarded by metaHandled so it still only runs once, right after meta
     first arrives. */
  const metaHandled = useRef(false);
  useEffect(() => {
    // `meta` is already non-null by the time this page mounts —
    // ValidateExamAccessKey (Services/Oprations/Exam.js) dispatches a
    // sparse meta object (just proctoringRequired/proctoringConnectTimeoutSec/
    // waitingLobbyDurationSec) back at the access-key step, and Redux
    // state survives every SPA-internal navigation between there and
    // here (Pre-Check → Instructions → Waiting Lobby → this page).
    // Gating on `!meta` alone let this effect fire on THAT sparse
    // object — which has no examDuration at all — locking the timer
    // into FALLBACK_DURATION_MIN forever and ignoring the real,
    // question-bank-configured duration that only arrives once
    // fetchExamQuestions' own dispatch replaces meta below. examDuration
    // is only ever present (even as 0) on that later, complete meta.
    if (!meta || meta.examDuration === undefined || metaHandled.current) return;
    metaHandled.current = true;

    // Deriving the countdown from examClockStartedAt + examDuration
    // (both server-authoritative) rather than always starting a fresh
    // 45-minute clock means a page reload resumes at the correct time
    // remaining instead of granting extra time. examClockStartedAt is
    // set the first time this page is actually reached (see
    // fetchExamQuestions), not examStartTime — which fires back at
    // access-key entry, before Pre-Check/Instructions/the Waiting Lobby
    // — so time spent on those screens no longer eats into answering time.
    const durationSec = (meta.examDuration || FALLBACK_DURATION_MIN) * 60;
    const alreadyElapsed = meta.examClockStartedAt
      ? Math.max(Math.floor((Date.now() - new Date(meta.examClockStartedAt).getTime()) / 1000), 0)
      : 0;

    elapsedRef.current = alreadyElapsed;
    setTimeLeft(Math.max(durationSec - alreadyElapsed, 0));
  }, [meta]);

  /* ── RESUME PREVIOUSLY SAVED ANSWERS ──
     Unlike the timer above, this is a pure derivation from `questions`
     alone (no clock reads), so it can safely use React's documented
     "adjust state during render" pattern instead of an effect — it
     only fires when `questions` changes identity, i.e. once, right
     after the fetch resolves.
     https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes */
  const [questionsSeen, setQuestionsSeen] = useState(null);
  if (questions.length > 0 && questions !== questionsSeen) {
    setQuestionsSeen(questions);

    // fetchExamQuestions returns selectedAnswer per question when the
    // candidate already answered it in an earlier autosave — previously
    // nothing read that field, so a reload silently discarded progress.
    const seeded = {};
    questions.forEach((ques) => {
      if (ques.selectedAnswer) seeded[ques._id] = ques.selectedAnswer;
    });
    if (Object.keys(seeded).length > 0) setAnswers(seeded);
  }

  const toggleFullscreen = () => {
    const el = appRef.current || document.documentElement;
    if (!document.fullscreenElement) {
      const req = el.requestFullscreen?.() || el.webkitRequestFullscreen?.();
      if (req) req.catch(() => {});
    } else {
      const exit = document.exitFullscreen?.() || document.webkitExitFullscreen?.();
      if (exit && typeof exit.catch === "function") exit.catch(() => {});
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  const q = questions[current];

  /* ── SUBMIT ── shared by the confirm-modal button and time-up ── */
  const doSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitted(true);

    // Exit fullscreen ourselves rather than leaving the candidate locked
    // in it after they're done — nothing else releases it once the exam
    // ends.
    if (document.fullscreenElement) {
      const exit = document.exitFullscreen?.() || document.webkitExitFullscreen?.();
      if (exit && typeof exit.catch === "function") exit.catch(() => {});
    }

    await submitExamToServer(dispatch, elapsedRef.current, navigate);
  }, [dispatch, navigate]);

  /* ── TIMER ── */
  const timeReady = timeLeft !== null;
  useEffect(() => {
    if (submitted || !timeReady) return;
    const t = setInterval(() => {
      elapsedRef.current += 1;
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(t); doSubmit(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [submitted, timeReady, doSubmit]);

  /* ── AUTOSAVE ──
     Debounced on answer changes. Fire-and-forget by design (see
     autoSaveExamResponse) — a failed autosave doesn't block the
     candidate, the next successful one or the final submit carries the
     latest answers regardless. The response's examStatus is still
     checked: for a non-proctored exam this is the only channel a
     manual termination ever arrives on (a proctored one gets it
     instantly over LiveKit — see Route/ExamSecurityGuard.jsx). */
  const checkAutosaveResult = useCallback((result) => {
    if (result?.examStatus === "terminated") {
      navigate("/assessment/ExamTerminated");
    }
  }, [navigate]);

  useEffect(() => {
    if (!meta || Object.keys(answers).length === 0) return;
    const t = setTimeout(() => {
      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      autoSaveExamResponse(responses, elapsedRef.current).then(checkAutosaveResult);
    }, 800);
    return () => clearTimeout(t);
  }, [answers, meta, checkAutosaveResult]);

  // A candidate who never changes an answer for a while would otherwise
  // never trigger the debounced save above at all — this is the actual
  // heartbeat a non-proctored exam relies on to notice a manual
  // termination in reasonable time, not just a save-answers mechanism.
  useEffect(() => {
    if (!meta) return;
    const t = setInterval(() => {
      const responses = Object.entries(answersRef.current).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      autoSaveExamResponse(responses, elapsedRef.current).then(checkAutosaveResult);
    }, 15000);
    return () => clearInterval(t);
  }, [meta, checkAutosaveResult]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60).toString().padStart(2,"0");
    const sec = (s % 60).toString().padStart(2,"0");
    return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
  };

  const isUrgent = timeLeft !== null && timeLeft <= 300;

  /* ── NAVIGATION ── */
  const goTo = useCallback((idx, dir = null) => {
    const d = dir ?? (idx > current ? "next" : "prev");
    setAnimDir(d);
    setTimeout(() => setCurrent(idx), 0);
  }, [current]);

  const goPrev = () => { if (current > 0) goTo(current - 1, "prev"); };
  const goNext = () => { if (current < questions.length - 1) goTo(current + 1, "next"); };

  /* ── ANSWER / FLAG ── */
  const selectAnswer = (opt) => {
    setAnswers(a => ({ ...a, [q._id]: opt }));
  };
  const toggleFlag = () => {
    setFlagged(f => ({ ...f, [q._id]: !f[q._id] }));
  };

  /* ── STATS ── */
  const answered = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);

  const getStatus = (q) => {
    if (answers[q._id]) return "answered";
    if (flagged[q._id]) return "flagged";
    return "unanswered";
  };

  // Questions/meta load asynchronously on mount — render nothing but the
  // dark shell until they arrive rather than crashing on questions[0]
  // being undefined. The global Spinner (driven by the same fetch) is
  // already visible over this.
  if (!meta || questions.length === 0 || !q) {
    return <div className={styles.app} />;
  }

  // Falls back to "medium" for any question missing a valid difficulty
  // rather than indexing DIFF_CONFIG with undefined and crashing —
  // this is exactly what happened when fetchExamQuestions didn't return
  // the field at all.
  const diff = DIFF_CONFIG[q.difficulty] ? q.difficulty : "medium";
  const diffMeta = DIFF_CONFIG[diff];

  return (
    <div className={`${styles.app} ${theme === "light" ? styles.light : ""}`} ref={appRef}>
      {/* ── ASSESSMENT NAVBAR ── */}
      <AssessmentNavbar />

      {/* ── ATMOSPHERE ── */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />
      <div className={styles.grain} />

      {/* ════════════════ TOP BAR ════════════════ */}
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <button className={styles.panelToggle} onClick={() => setPanelOpen(v => !v)}
            title={panelOpen ? "Hide navigator" : "Show navigator"}>
            {panelOpen ? <FiX /> : <FiGrid />}
          </button>
          <div className={styles.examMeta}>
            <div className={styles.examMetaIconWrap}>
              <FiBookOpen className={styles.examMetaIcon} />
            </div>
            <div className={styles.examMetaText}>
              <p className={styles.examMetaName}>{meta.testName || "Exam"}</p>
              <p className={styles.examMetaSub}>{questions.length} questions · {totalMarks} marks</p>
            </div>
          </div>
        </div>

        <span className={styles.topDivider} />

        <div className={styles.topCenter}>
          <div className={`${styles.timer} ${isUrgent ? styles.timerUrgent : ""}`}>
            <FiClock className={styles.timerIcon} />
            <span className={styles.timerText}>{formatTime(timeLeft)}</span>
            {isUrgent && <span className={styles.timerPulse} />}
          </div>
        </div>

        <div className={styles.topRight}>
          <div className={styles.progressPill}>
            <span className={styles.progressFill} style={{ width: `${(answered / questions.length) * 100}%` }} />
            <span className={styles.progressLabel}>{answered}/{questions.length}</span>
          </div>

          {/* ── THEME TOGGLE ── */}
          <button
            className={styles.themeBtn}
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span className={styles.themeBtnTrack}>
              <span className={`${styles.themeBtnThumb} ${theme === "light" ? styles.themeBtnThumbLight : ""}`} />
            </span>
            <span className={styles.themeBtnIcon}>
              {theme === "dark" ? <FiMoon /> : <FiSun />}
            </span>
          </button>

          <button className={styles.fsBtn} onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
            {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
          </button>
          <button className={styles.submitBtn} onClick={() => setShowConfirm(true)}>
            <FiSend className={styles.submitIcon} />
            Submit
          </button>
        </div>
      </header>

      <div className={styles.body}>

        {/* ════════════════ QUESTION NAVIGATOR PANEL ════════════════ */}
        <aside className={`${styles.panel} ${panelOpen ? styles.panelOpen : styles.panelClosed}`}>
          <div className={styles.panelInner}>

            {/* Panel heading */}
            <div className={styles.panelLabel}>
              <span className={styles.panelLabelDot} />
              <span className={styles.panelLabelText}>Navigator</span>
            </div>

            {/* Legend */}
            <div className={styles.legend}>
              <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.ldAnswered}`}/>Answered</span>
              <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.ldFlagged}`}/>Flagged</span>
              <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.ldCurrent}`}/>Current</span>
            </div>

            {/* Question grid */}
            <div className={styles.qGrid}>
              {questions.map((ques, i) => {
                const status = getStatus(ques);
                const isCurrent = i === current;
                return (
                  <button
                    key={ques._id}
                    className={`${styles.qBtn}
                      ${isCurrent     ? styles.qBtnCurrent  : ""}
                      ${status === "answered" && !isCurrent ? styles.qBtnAnswered : ""}
                      ${status === "flagged"  && !isCurrent ? styles.qBtnFlagged  : ""}
                    `}
                    onClick={() => goTo(i)}
                    title={ques.questionText.slice(0, 60) + "…"}
                  >
                    {flagged[ques._id] && !isCurrent
                      ? <FiFlag className={styles.qBtnFlagIcon} />
                      : i + 1
                    }
                  </button>
                );
              })}
            </div>

            {/* Mini stats */}
            <div className={styles.panelMiniStats}>
              <div className={styles.pStat}>
                <span className={styles.pStatNum} style={{ color: "#34d399" }}>{answered}</span>
                <span className={styles.pStatLabel}>Done</span>
              </div>
              <div className={styles.pStat}>
                <span className={styles.pStatNum} style={{ color: "#f59e0b" }}>{flaggedCount}</span>
                <span className={styles.pStatLabel}>Flagged</span>
              </div>
              <div className={styles.pStat}>
                <span className={styles.pStatNum} style={{ color: "#555870" }}>{questions.length - answered}</span>
                <span className={styles.pStatLabel}>Left</span>
              </div>
            </div>

          </div>
        </aside>

        {/* ════════════════ QUESTION AREA ════════════════ */}
        <main className={styles.main}>

          {/* Question header bar */}
          <div className={styles.qHeader}>
            <div className={styles.qMeta}>
              <span className={styles.qNumber}>Q{current + 1}</span>
              <span className={styles.qOf}>of {questions.length}</span>
              <span className={styles.diffBadge}
                style={{
                  color:       diffMeta.color,
                  background:  diffMeta.bg,
                  borderColor: diffMeta.border,
                }}>
                {diff === "hard" ? <FiZap style={{ fontSize: 10 }} /> : null}
                {diffMeta.label}
              </span>
              <span className={styles.marksBadge}>{q.marks} {q.marks === 1 ? "mark" : "marks"}</span>
            </div>

            <button
              className={`${styles.flagBtn} ${flagged[q._id] ? styles.flagBtnActive : ""}`}
              onClick={toggleFlag}
            >
              <FiFlag className={styles.flagBtnIcon} />
              {flagged[q._id] ? "Flagged" : "Flag"}
            </button>
          </div>

          {/* Question card */}
          <div
            className={`${styles.qCard} ${styles[`qCardAnim_${animDir}`]} ${styles[`qCard${diff.charAt(0).toUpperCase() + diff.slice(1)}`]}`}
            key={q._id}
          >
            <div className={styles.qCardGlow} />
            <div className={styles.qCardContent}>

            {/* Question text */}
            <div className={styles.qTextWrap}>
              <p className={styles.qText}>{q.questionText}</p>
            </div>

            {/* Options */}
            <div className={styles.optionList}>
              {q.options.map((opt, i) => {
                const selected = answers[q._id] === opt;
                return (
                  <button
                    key={i}
                    className={`${styles.option} ${selected ? styles.optionSelected : ""}`}
                    onClick={() => selectAnswer(opt)}
                  >
                    <span className={`${styles.optLetter} ${selected ? styles.optLetterSelected : ""}`}>
                      {OPTION_LETTERS[i]}
                    </span>
                    <span className={styles.optText}>{opt}</span>
                    {selected && (
                      <span className={styles.optCheck}>
                        <FiCheck />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answered indicator */}
            {answers[q._id] && (
              <div className={styles.answeredBanner}>
                <FiCheck className={styles.answeredIcon} />
                Response recorded
              </div>
            )}

            </div>{/* /qCardContent */}
          </div>

          {/* ── BOTTOM NAV ── */}
          <div className={styles.bottomNav}>
            <button className={styles.navBtn} onClick={goPrev} disabled={current === 0}>
              <FiChevronLeft /> Previous
            </button>

            <div className={styles.dotTrack}>
              {questions.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dotStep} ${i === current ? styles.dotStepActive : ""} ${answers[questions[i]._id] ? styles.dotStepDone : ""}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>

            <button className={styles.navBtn} onClick={goNext} disabled={current === questions.length - 1}>
              Next <FiChevronRight />
            </button>
          </div>

        </main>
      </div>

      {/* ════════════════ CONFIRM MODAL ════════════════ */}
      {showConfirm && (
        <div className={styles.overlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalGlow} />
            <div className={styles.modalHeader}>
              <div className={styles.modalIconWrap}>
                <FiAlertTriangle className={styles.modalIcon} />
              </div>
              <div>
                <p className={styles.modalTitle}>Submit Exam?</p>
                <p className={styles.modalSub}>This action cannot be undone.</p>
              </div>
              <button className={styles.modalClose} onClick={() => setShowConfirm(false)}>
                <FiX />
              </button>
            </div>

            <div className={styles.modalStats}>
              <div className={styles.mStat}>
                <span className={styles.mStatNum} style={{ color: "#34d399" }}>{answered}</span>
                <span className={styles.mStatLabel}>Answered</span>
              </div>
              <div className={styles.mStat}>
                <span className={styles.mStatNum} style={{ color: "#636880" }}>
                  {questions.length - answered}
                </span>
                <span className={styles.mStatLabel}>Unanswered</span>
              </div>
              <div className={styles.mStat}>
                <span className={styles.mStatNum} style={{ color: "#f59e0b" }}>{flaggedCount}</span>
                <span className={styles.mStatLabel}>Flagged</span>
              </div>
            </div>

            {questions.length - answered > 0 && (
              <div className={styles.modalWarn}>
                <FiAlertTriangle className={styles.modalWarnIcon} />
                <span>{questions.length - answered} question{questions.length - answered > 1 ? "s are" : " is"} unanswered.</span>
              </div>
            )}

            <div className={styles.modalFooter}>
              <button className={styles.modalCancel} onClick={() => setShowConfirm(false)}>
                Continue exam
              </button>
              <button className={styles.modalSubmit} onClick={() => { setShowConfirm(false); doSubmit(); }}>
                <FiSend className={styles.modalSubmitIcon} />
                Submit now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ SUBMITTED OVERLAY ════════════════ */}
      {submitted && (
        <div className={styles.overlay}>
          <div className={styles.submittedBox}>
            <div className={styles.sbGlow} />
            <div className={styles.sbIconRing}>
              <FiCheck className={styles.sbIcon} />
            </div>
            <h2 className={styles.sbTitle}>Exam Submitted!</h2>
            <p className={styles.sbSub}>Your responses have been recorded securely.</p>
            <div className={styles.sbStats}>
              <span>{answered}/{questions.length} answered</span>
              <span className={styles.sbDot} />
              <span>{timeLeft > 0 ? formatTime(timeLeft) + " remaining" : "Time up"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}