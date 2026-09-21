import { useEffect, useState } from "react";
import useModalDismiss from "../../hooks/useModalDismiss";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import styles from "./Exam.module.css";
import {
  FiFileText, FiPlus, FiUser, FiBook,
  FiClock, FiCalendar, FiShield, FiAward,
  FiCheckCircle, FiXCircle, FiAlertCircle,
  FiEye, FiBarChart2, FiX, FiAlertTriangle,
  FiWifi, FiSmartphone, FiCamera, FiUsers,
  FiMonitor, FiCopy, FiChevronLeft, FiChevronRight,
  FiMinimize2, FiTerminal, FiMousePointer, FiCommand,
  FiRefreshCw, FiImage
} from "react-icons/fi";
import { assignExam, fetchAllAssignedExams } from "../../Services/Oprations/Exam";
import { fetchQuestionBankList } from "../../Services/Oprations/QuestionBank";
import { fetchAllStudents } from "../../Services/Oprations/Student";

const STATUS_META = {
  assigned:  { color: "#60a5fa", bg: "rgba(96,165,250,0.10)",  dot: "#60a5fa",  label: "Assigned"    },
  started:   { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  dot: "#f59e0b",  label: "In Progress" },
  completed: { color: "#34d399", bg: "rgba(52,211,153,0.10)",  dot: "#34d399",  label: "Completed"   },
};
const RESULT_META = {
  pass: { color: "#34d399", bg: "rgba(52,211,153,0.10)",  Icon: FiCheckCircle, label: "Pass" },
  fail: { color: "#f87171", bg: "rgba(248,113,113,0.10)", Icon: FiXCircle,     label: "Fail" },
};
const MODAL_TABS = ["Overview", "Proctoring", "Misconduct"];

export default function Exam() {
  const dispatch = useDispatch();
  const { students }          = useSelector((state) => state.Students)  || { students: [] };
  const { questionBanksList } = useSelector((state) => state.QB)        || { questionBanksList: [] };
  const { assignedExams }     = useSelector((state) => state.Exams)     || { assignedExams: [] };

  const [form, setForm] = useState({
    studentId:          "",
    questionBankId:     "",
    testExpiryTime:     "",
    examStartTime:      "",
    passingMarks:       "",
    anytimeExam:        false,
    proctoringRequired: true,
    proctoringConnectTimeoutSec: "",
    waitingLobbyDurationSec: "",
  });
  const [detailModal, setDetailModal] = useState(null);
  const [modalTab,    setModalTab]    = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchAllAssignedExams(dispatch);
    fetchQuestionBankList(dispatch);
    fetchAllStudents(dispatch);
  }, []);

  // The tab is reset when the modal is opened (see the view button), so
  // there is nothing to reset on close.
  useModalDismiss(Boolean(detailModal), () => setDetailModal(null));

  const handleSubmit = (e) => {
    e.preventDefault();

    const expiry = new Date(form.testExpiryTime);

    if (isNaN(expiry.getTime())) {
      toast.error("Enter a valid test expiry date & time");
      return;
    }

    if (expiry <= new Date()) {
      toast.error("Test expiry must be in the future");
      return;
    }

    // examStartTime only matters for a scheduled (non-anytime) exam —
    // the field is disabled and irrelevant when Anytime is on.
    if (!form.anytimeExam) {

      const start = new Date(form.examStartTime);

      if (isNaN(start.getTime())) {
        toast.error("Enter a valid exam start time");
        return;
      }

      if (start <= new Date()) {
        toast.error("Exam start time must be in the future");
        return;
      }

      if (start >= expiry) {
        toast.error("Exam start time must be before the test expiry time");
        return;
      }

    }

    // Only meaningful when proctoring is actually required — left blank,
    // the backend defaults it to 30s (see assignExam).
    let connectTimeout;
    if (form.proctoringRequired && form.proctoringConnectTimeoutSec !== "") {
      connectTimeout = Number(form.proctoringConnectTimeoutSec);
      if (isNaN(connectTimeout) || connectTimeout < 5 || connectTimeout > 300) {
        toast.error("Live proctoring connect timeout must be between 5 and 300 seconds");
        return;
      }
    }

    // Left blank, the backend defaults it to 10s (see assignExam).
    let lobbyDuration;
    if (form.waitingLobbyDurationSec !== "") {
      lobbyDuration = Number(form.waitingLobbyDurationSec);
      if (isNaN(lobbyDuration) || lobbyDuration < 3 || lobbyDuration > 120) {
        toast.error("Waiting lobby duration must be between 3 and 120 seconds");
        return;
      }
    }

    const payload = {
      studentId:          form.studentId,
      questionBankId:     form.questionBankId,
      testExpiryTime:     expiry.toISOString(),
      examStartTime:      form.anytimeExam ? null : new Date(form.examStartTime).toISOString(),
      passingMarks:       Number(form.passingMarks),
      anytimeExam:        form.anytimeExam,
      proctoringRequired: form.proctoringRequired,
      ...(connectTimeout !== undefined ? { proctoringConnectTimeoutSec: connectTimeout } : {}),
      ...(lobbyDuration !== undefined ? { waitingLobbyDurationSec: lobbyDuration } : {}),
    };
    assignExam(dispatch, payload);
    setForm({ studentId:"", questionBankId:"", testExpiryTime:"", examStartTime:"", passingMarks:"", anytimeExam:false, proctoringRequired:true, proctoringConnectTimeoutSec:"", waitingLobbyDurationSec:"" });
  };

  /* helpers — handle populated objects OR bare IDs */
  const getStudentName  = (s) => !s ? "Unknown" : typeof s === "object" ? s.name  : students.find(x => x._id === s)?.name  || s;
  const getStudentEmail = (s) => !s ? ""        : typeof s === "object" ? s.email : students.find(x => x._id === s)?.email || "";
  const getBankTitle    = (b) => !b ? "Unknown" : typeof b === "object" ? b.title : questionBanksList.find(x => x._id === b)?.title || b;
  const getBankDuration = (b) => !b ? null      : typeof b === "object" ? b.examDuration : questionBanksList.find(x => x._id === b)?.examDuration || null;

  const filtered = statusFilter === "all" ? assignedExams : assignedExams?.filter(e => e.examStatus === statusFilter);

  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / PAGE_SIZE));
  // Clamp rather than reset via effect — a shorter list after a filter
  // change or a completed exam dropping off just lands on the new last
  // page instead of needing an extra render cycle to correct itself.
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const changeFilter = (f) => { setStatusFilter(f); setPage(1); };

  const stats = {
    total:     assignedExams?.length ?? 0,
    assigned:  assignedExams?.filter(e => e.examStatus === "assigned").length  ?? 0,
    started:   assignedExams?.filter(e => e.examStatus === "started").length   ?? 0,
    completed: assignedExams?.filter(e => e.examStatus === "completed").length ?? 0,
    passed:    assignedExams?.filter(e => e.result === "pass").length ?? 0,
    failed:    assignedExams?.filter(e => e.result === "fail").length ?? 0,
  };

  return (
    <div className={styles.page}>
      <div className={styles.blob1} /><div className={styles.blob2} /><div className={styles.grain} />

      <div className={styles.container}>

        {/* HEADER */}
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <span className={styles.logoMark}><FiFileText /></span>
            <div>
              <h1 className={styles.pageTitle}>Exam Management</h1>
              <p className={styles.pageSubtitle}>Assign exams, track progress & review results</p>
            </div>
          </div>
        </header>

        {/* STATS */}
        <div className={styles.statsRow}>
          {[
            { label: "Total",     value: stats.total,     color: "#e8eaf0" },
            { label: "Assigned",  value: stats.assigned,  color: "#60a5fa" },
            { label: "Started",   value: stats.started,   color: "#f59e0b" },
            { label: "Completed", value: stats.completed, color: "#34d399" },
            { label: "Passed",    value: stats.passed,    color: "#34d399" },
            { label: "Failed",    value: stats.failed,    color: "#f87171" },
          ].map(s => (
            <div className={styles.statCard} key={s.label}>
              <span className={styles.statNum} style={{ color: s.color }}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ASSIGN FORM */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiPlus className={styles.cardIcon} />
            <span className={styles.cardTitle}>Assign Exam</span>
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Row 1 — Student + Question Bank */}
            <div className={styles.formGrid2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}><FiUser className={styles.labelIcon} /> Student</label>
                <div className={styles.selectWrap}>
                  <select className={styles.select} value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} required>
                    <option value="">Select a student…</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                  <FiUser className={styles.selectIcon} />
                </div>
                {form.studentId && (
                  <div className={styles.selectedPreview}>
                    <div className={styles.previewAvatar}>{students.find(s => s._id === form.studentId)?.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className={styles.previewName}>{students.find(s => s._id === form.studentId)?.name}</p>
                      <p className={styles.previewSub}>{students.find(s => s._id === form.studentId)?.email}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}><FiBook className={styles.labelIcon} /> Question Bank</label>
                <div className={styles.selectWrap}>
                  <select className={styles.select} value={form.questionBankId} onChange={e => setForm({...form, questionBankId: e.target.value})} required>
                    <option value="">Select a question bank…</option>
                    {questionBanksList.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                  </select>
                  <FiBook className={styles.selectIcon} />
                </div>
                {form.questionBankId && (
                  <div className={styles.selectedPreview}>
                    <div className={styles.previewBankIcon}><FiBook /></div>
                    <div>
                      <p className={styles.previewName}>{getBankTitle(form.questionBankId)}</p>
                      <p className={styles.previewSub}>
                        {questionBanksList.find(b => b._id === form.questionBankId)?.totalQuestions} Qs &middot; {questionBanksList.find(b => b._id === form.questionBankId)?.examDuration} min
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2 — Start Time + Expiry Time + Passing Marks */}
            <div className={styles.formGrid3}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}><FiCalendar className={styles.labelIcon} /> Exam Start Time</label>
                <div className={styles.inputWrap}>
                  <FiClock className={styles.inputIcon} />
                  <input className={styles.input} type="datetime-local" value={form.examStartTime}
                    onChange={e => setForm({...form, examStartTime: e.target.value})}
                    disabled={form.anytimeExam}
                    required={!form.anytimeExam} />
                </div>
                {form.anytimeExam ? (
                  <p className={styles.expiryHint}>Not needed — anytime exams have no fixed start</p>
                ) : form.examStartTime && (
                  <p className={styles.expiryHint}>Starts: {new Date(form.examStartTime).toLocaleString("en-US",{weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</p>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}><FiClock className={styles.labelIcon} /> Test Expiry Date & Time</label>
                <div className={styles.inputWrap}>
                  <FiClock className={styles.inputIcon} />
                  <input className={styles.input} type="datetime-local" value={form.testExpiryTime}
                    onChange={e => setForm({...form, testExpiryTime: e.target.value})} required />
                </div>
                {form.testExpiryTime && (
                  <p className={styles.expiryHint}>Expires: {new Date(form.testExpiryTime).toLocaleString("en-US",{weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</p>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}><FiAward className={styles.labelIcon} /> Passing Marks (%)</label>
                <div className={styles.inputWrap}>
                  <FiBarChart2 className={styles.inputIcon} />
                  <input className={styles.input} type="number" min="1" max="100" placeholder="e.g. 40"
                    value={form.passingMarks} onChange={e => setForm({...form, passingMarks: e.target.value})} required />
                  <span className={styles.inputSuffix}>%</span>
                </div>
                {form.passingMarks && (
                  <p className={styles.expiryHint}>Student must score ≥ {form.passingMarks}% to pass</p>
                )}
              </div>
            </div>

            {/* Row 3 — Toggles */}
            <div className={styles.toggleRow}>
              <button type="button"
                className={`${styles.toggleBtn} ${form.anytimeExam ? styles.toggleOn : ""}`}
                onClick={() => setForm({...form, anytimeExam: !form.anytimeExam})}>
                <span className={styles.toggleDot} />
                <FiClock className={styles.toggleIcon} />
                Anytime Exam
                <span className={styles.toggleState}>{form.anytimeExam ? "On" : "Off"}</span>
              </button>

              <button type="button"
                className={`${styles.toggleBtn} ${form.proctoringRequired ? styles.toggleOn : ""}`}
                onClick={() => setForm({...form, proctoringRequired: !form.proctoringRequired})}>
                <span className={styles.toggleDot} />
                <FiShield className={styles.toggleIcon} />
                Proctoring Required
                <span className={styles.toggleState}>{form.proctoringRequired ? "On" : "Off"}</span>
              </button>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}><FiClock className={styles.labelIcon} /> Waiting Lobby Duration</label>
              <div className={styles.inputWrap}>
                <FiClock className={styles.inputIcon} />
                <input className={styles.input} type="number" min="3" max="120" placeholder="10"
                  value={form.waitingLobbyDurationSec}
                  onChange={e => setForm({...form, waitingLobbyDurationSec: e.target.value})} />
                <span className={styles.inputSuffix}>sec</span>
              </div>
              <p className={styles.expiryHint}>
                How long the student waits on the "Exam Waiting Room" screen before it auto-starts the exam. Leave blank for the default (10s).
              </p>
            </div>

            {form.proctoringRequired && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}><FiClock className={styles.labelIcon} /> Live Proctoring Connect Timeout</label>
                <div className={styles.inputWrap}>
                  <FiClock className={styles.inputIcon} />
                  <input className={styles.input} type="number" min="5" max="300" placeholder="30"
                    value={form.proctoringConnectTimeoutSec}
                    onChange={e => setForm({...form, proctoringConnectTimeoutSec: e.target.value})} />
                  <span className={styles.inputSuffix}>sec</span>
                </div>
                <p className={styles.expiryHint}>
                  How long a candidate's browser retries connecting to live proctoring before continuing without it. Leave blank for the default (30s).
                </p>
              </div>
            )}

            <button className={styles.submitBtn} type="submit"><FiPlus /> Assign Exam</button>
          </form>
        </div>

        {/* TABLE */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiBarChart2 className={styles.cardIcon} />
            <span className={styles.cardTitle}>Assigned Exams</span>
            <span className={styles.countPill}>{assignedExams?.length ?? 0} total</span>
            <div className={styles.filterTabs}>
              {["all","assigned","started","completed"].map(f => (
                <button key={f} className={`${styles.filterTab} ${statusFilter === f ? styles.filterActive : ""}`} onClick={() => changeFilter(f)}>
                  {f === "all" ? "All" : STATUS_META[f]?.label}
                </button>
              ))}
            </div>
          </div>

          {!filtered?.length ? (
            <div className={styles.emptyState}>
              <FiFileText className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>No exams found</p>
              <p className={styles.emptyText}>Assign an exam above to get started.</p>
            </div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Student</span><span>Question Bank</span><span>Status</span>
                <span>Result</span><span>Score</span><span>Warnings</span><span>Expiry</span><span>View</span>
              </div>
              {pageItems?.map((exam, idx) => {
                const sm = STATUS_META[exam.examStatus] || STATUS_META.assigned;
                const rm = exam.result ? RESULT_META[exam.result] : null;
                return (
                  <div key={exam._id} className={styles.tableRow} style={{ animationDelay: `${idx * 0.04}s` }}>
                    <div className={styles.studentCell}>
                      <div className={styles.rowAvatar}>{getStudentName(exam.studentId)?.charAt(0).toUpperCase()}</div>
                      <div className={styles.studentCellInfo}>
                        <span className={styles.cellText}>{getStudentName(exam.studentId)}</span>
                        <span className={styles.cellSub}>{getStudentEmail(exam.studentId)}</span>
                      </div>
                    </div>
                    <div className={styles.bankCell}>
                      <FiBook className={styles.bankCellIcon} />
                      <div>
                        <span className={styles.cellText}>{getBankTitle(exam.questionBankId)}</span>
                        {getBankDuration(exam.questionBankId) && <span className={styles.cellSub}>({getBankDuration(exam.questionBankId)} min)</span>}
                      </div>
                    </div>
                    <span className={styles.statusPill} style={{ background: sm.bg, color: sm.color }}>
                      <span className={styles.statusDot} style={{ background: sm.dot }} />{sm.label}
                    </span>
                    {rm ? (
                      <span className={styles.resultPill} style={{ background: rm.bg, color: rm.color }}>
                        <rm.Icon className={styles.resultIcon} />{rm.label}
                      </span>
                    ) : <span className={styles.naStat}>—</span>}
                    <div className={styles.scoreCell}><span className={styles.scoreVal}>{exam.score ?? 0}</span></div>
                    <div className={styles.warningCell}>
                      {(exam.warningCount > 0 || exam.misconductScore > 0) ? (
                        <span className={styles.warningBadge}><FiAlertTriangle className={styles.warnBadgeIcon} />{exam.warningCount ?? exam.misconductScore}</span>
                      ) : <span className={styles.naStat}>0</span>}
                    </div>
                    <span className={styles.dateCell}>
                      {exam.testExpiryTime ? new Date(exam.testExpiryTime).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}
                    </span>
                    <button className={styles.viewBtn} onClick={() => { setDetailModal(exam); setModalTab(0); }}><FiEye /></button>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <span className={styles.paginationInfo}>
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className={styles.paginationBtns}>
                <button className={styles.pageBtn} disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}>
                  <FiChevronLeft />
                </button>
                <span className={styles.pageIndicator}>Page {currentPage} of {totalPages}</span>
                <button className={styles.pageBtn} disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}>
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailModal && (() => {
        const exam = detailModal;
        const sm = STATUS_META[exam.examStatus] || STATUS_META.assigned;
        const rm = exam.result ? RESULT_META[exam.result] : null;
        const ms = exam.misconductSummary || {};
        const totalMisconduct = Object.values(ms).reduce((a, v) => a + (Number(v) || 0), 0);

        return (
          <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setDetailModal(null)}>
            <div className={styles.modal}>

              {/* Header */}
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleRow}>
                  <FiFileText className={styles.modalHeaderIcon} />
                  <h3 className={styles.modalTitle}>Exam Details</h3>
                </div>
                <button className={styles.closeBtn} onClick={() => setDetailModal(null)}><FiX /></button>
              </div>

              {/* Banner */}
              <div className={styles.modalBanner}>
                <div className={styles.modalBannerItem}>
                  <div className={styles.modalAvatar}>{getStudentName(exam.studentId)?.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className={styles.modalBannerLabel}>Student</p>
                    <p className={styles.modalBannerVal}>{getStudentName(exam.studentId)}</p>
                    <p className={styles.modalBannerSub}>{getStudentEmail(exam.studentId)}</p>
                  </div>
                </div>
                <div className={styles.modalBannerDivider} />
                <div className={styles.modalBannerItem}>
                  <div className={styles.modalBankIcon}><FiBook /></div>
                  <div>
                    <p className={styles.modalBannerLabel}>Question Bank</p>
                    <p className={styles.modalBannerVal}>{getBankTitle(exam.questionBankId)}</p>
                    {getBankDuration(exam.questionBankId) && <p className={styles.modalBannerSub}>{getBankDuration(exam.questionBankId)} min</p>}
                  </div>
                </div>
                <div className={styles.modalBannerDivider} />
                <div className={styles.modalBannerStatus}>
                  <span className={styles.statusPill} style={{ background: sm.bg, color: sm.color, padding: "6px 14px" }}>
                    <span className={styles.statusDot} style={{ background: sm.dot }} />{sm.label}
                  </span>
                  {rm && (
                    <span className={styles.resultPill} style={{ background: rm.bg, color: rm.color, padding: "6px 14px" }}>
                      <rm.Icon className={styles.resultIcon} />{rm.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Tab Nav */}
              <div className={styles.tabNav}>
                {MODAL_TABS.map((tab, i) => (
                  <button key={tab} className={`${styles.tabBtn} ${modalTab === i ? styles.tabActive : ""}`} onClick={() => setModalTab(i)}>
                    {tab}
                    {i === 2 && totalMisconduct > 0 && <span className={styles.tabBadge}>{totalMisconduct}</span>}
                  </button>
                ))}
                <div className={styles.tabIndicator} style={{
                  left: `calc(${modalTab * (100/3)}% + 4px)`,
                  width: `calc(${100/3}% - 8px)`
                }} />
              </div>

              {/* Tab Content — conditional render, no CSS slider */}
              <div className={styles.tabContent}>

                {/* Tab 0 — Overview */}
                {modalTab === 0 && (
                  <div className={styles.tabPane}>
                    <div className={styles.detailGrid}>
                      <DetailRow icon={<FiAward />}         label="Score"            value={exam.score ?? 0} />
                      <DetailRow icon={<FiBarChart2 />}     label="Misconduct Score" value={exam.misconductScore ?? 0} warn={(exam.misconductScore??0)>0} />
                      <DetailRow icon={<FiAlertTriangle />} label="Warning Count"    value={exam.warningCount ?? 0}    warn={(exam.warningCount??0)>0} />
                      <DetailRow icon={<FiCalendar />}      label="Created At"       value={exam.createdAt ? new Date(exam.createdAt).toLocaleString() : "N/A"} />
                      <DetailRow icon={<FiClock />}         label="Test Expiry"      value={exam.testExpiryTime ? new Date(exam.testExpiryTime).toLocaleString() : "N/A"} />
                      <DetailRow icon={<FiCheckCircle />}   label="Submitted At"     value={exam.examEndTime ? new Date(exam.examEndTime).toLocaleString() : "Not submitted"} />
                    </div>
                  </div>
                )}

                {/* Tab 1 — Proctoring */}
                {modalTab === 1 && (
                  <div className={styles.tabPane}>
                    <div className={styles.proctoringSection}>
                      <div className={styles.proctoringHeader}>
                        <FiShield className={styles.proctoringIcon} />
                        <span className={styles.proctoringTitle}>Proctoring Report</span>
                        {totalMisconduct > 0 && (
                          <span className={styles.misconductBadge}><FiAlertTriangle /> {totalMisconduct} incidents</span>
                        )}
                      </div>
                      <div className={styles.proctoringGrid}>
                        <ProctoringItem icon={<FiMonitor />}      label="Tab Switches"       value={ms.tab_switch         ?? "—"} warn={(ms.tab_switch??0)>0} />
                        <ProctoringItem icon={<FiCamera />}       label="No Face"            value={ms.no_face            ?? "—"} warn={(ms.no_face??0)>0} />
                        <ProctoringItem icon={<FiUsers />}        label="Multiple Faces"     value={ms.multiple_faces     ?? "—"} warn={(ms.multiple_faces??0)>0} />
                        <ProctoringItem icon={<FiMonitor />}      label="Fullscreen Exit"    value={ms.fullscreen_exit    ?? "—"} warn={(ms.fullscreen_exit??0)>0} />
                        <ProctoringItem icon={<FiCopy />}         label="Copy / Paste"       value={ms.copy_paste         ?? "—"} warn={(ms.copy_paste??0)>0} />
                        <ProctoringItem icon={<FiWifi />}         label="Network Disconnect" value={ms.network_disconnect ?? "—"} warn={(ms.network_disconnect??0)>0} />
                        <ProctoringItem icon={<FiSmartphone />}   label="Phone Detected"     value={ms.phone_detected     ?? "—"} warn={(ms.phone_detected??0)>0} />
                        <ProctoringItem icon={<FiTerminal />}     label="DevTools Opened"    value={ms.devtools_open      ?? "—"} warn={(ms.devtools_open??0)>0} />
                        <ProctoringItem icon={<FiImage />}        label="Screenshot Attempt" value={ms.print_screen       ?? "—"} warn={(ms.print_screen??0)>0} />
                        <ProctoringItem icon={<FiCommand />}      label="Blocked Shortcut"   value={ms.keyboard_shortcut  ?? "—"} warn={(ms.keyboard_shortcut??0)>0} />
                        <ProctoringItem icon={<FiRefreshCw />}    label="Page Refresh"       value={ms.page_refresh       ?? "—"} warn={(ms.page_refresh??0)>0} />
                        <ProctoringItem icon={<FiMousePointer />} label="Right Click"        value={ms.right_click        ?? "—"} warn={(ms.right_click??0)>0} />
                        <ProctoringItem icon={<FiMinimize2 />}    label="Window Too Small"   value={ms.window_too_small   ?? "—"} warn={(ms.window_too_small??0)>0} />
                        <ProctoringItem icon={<FiClock />}        label="Idle Time"          value={ms.idle_user          ?? "—"} warn={(ms.idle_user??0)>0} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2 — Misconduct */}
                {modalTab === 2 && (
                  <div className={styles.tabPane}>
                    <div className={styles.misconductOverview}>
                      {[
                        { label: "Misconduct Score", value: exam.misconductScore ?? 0, warn: (exam.misconductScore??0) > 0 },
                        { label: "Warnings Issued",  value: exam.warningCount    ?? 0, warn: (exam.warningCount??0)    > 0 },
                        { label: "Total Incidents",  value: totalMisconduct,           warn: totalMisconduct > 0            },
                      ].map(({ label, value, warn }) => (
                        <div key={label} className={styles.misconductScoreCard}>
                          <span className={styles.misconductScoreNum} style={{ color: warn ? "#f87171" : "#34d399" }}>{value}</span>
                          <span className={styles.misconductScoreLabel}>{label}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.misconductBreakdown}>
                      {[
                        { key: "tab_switch",        icon: <FiMonitor />,      label: "Tab Switches"       },
                        { key: "no_face",           icon: <FiCamera />,       label: "No Face Detected"   },
                        { key: "multiple_faces",    icon: <FiUsers />,        label: "Multiple Faces"     },
                        { key: "fullscreen_exit",   icon: <FiMonitor />,      label: "Fullscreen Exits"   },
                        { key: "copy_paste",        icon: <FiCopy />,         label: "Copy / Paste"       },
                        { key: "network_disconnect",icon: <FiWifi />,         label: "Network Disconnect" },
                        { key: "phone_detected",    icon: <FiSmartphone />,   label: "Phone Detected"     },
                        { key: "devtools_open",     icon: <FiTerminal />,     label: "DevTools Opened"    },
                        { key: "print_screen",      icon: <FiImage />,        label: "Screenshot Attempt" },
                        { key: "keyboard_shortcut", icon: <FiCommand />,      label: "Blocked Shortcut"   },
                        { key: "page_refresh",      icon: <FiRefreshCw />,    label: "Page Refresh"       },
                        { key: "right_click",       icon: <FiMousePointer />, label: "Right Click"        },
                        { key: "window_too_small",  icon: <FiMinimize2 />,    label: "Window Too Small"   },
                        { key: "idle_user",         icon: <FiClock />,        label: "Idle Time"          },
                      ].map(({ key, icon, label }) => {
                        const count = ms[key] ?? 0;
                        const pct = totalMisconduct > 0 ? (count / totalMisconduct) * 100 : 0;
                        return (
                          <div key={key} className={styles.breakdownRow}>
                            <div className={styles.breakdownLeft}>
                              <span className={`${styles.breakdownIcon} ${count > 0 ? styles.breakdownIconWarn : ""}`}>{icon}</span>
                              <span className={styles.breakdownLabel}>{label}</span>
                            </div>
                            <div className={styles.breakdownRight}>
                              <div className={styles.breakdownBar}>
                                <div className={styles.breakdownFill} style={{ width: `${pct}%`, background: count > 0 ? "#f87171" : "#34d399" }} />
                              </div>
                              <span className={`${styles.breakdownCount} ${count > 0 ? styles.breakdownCountWarn : ""}`}>{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setDetailModal(null)}>Close</button>
                <div className={styles.footerNav}>
                  <button className={styles.navArrow} onClick={() => setModalTab(t => Math.max(0, t-1))} disabled={modalTab === 0}><FiChevronLeft /></button>
                  <div className={styles.footerDots}>
                    {MODAL_TABS.map((_, i) => <span key={i} className={`${styles.footerDot} ${modalTab === i ? styles.footerDotActive : ""}`} />)}
                  </div>
                  <button className={styles.navArrow} onClick={() => setModalTab(t => Math.min(MODAL_TABS.length-1, t+1))} disabled={modalTab === MODAL_TABS.length-1}><FiChevronRight /></button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function DetailRow({ icon, label, value, warn }) {
  return (
    <div className={styles.detailRow}>
      <div className={styles.detailRowLeft}>
        <span className={styles.detailIcon}>{icon}</span>
        <span className={styles.detailLabel}>{label}</span>
      </div>
      <span className={`${styles.detailValue} ${warn ? styles.detailValueWarn : ""}`}>{value}</span>
    </div>
  );
}

function ProctoringItem({ icon, label, value, warn }) {
  return (
    <div className={`${styles.proctoringItem} ${warn ? styles.proctoringWarn : ""}`}>
      <div className={styles.proctoringItemLeft}>
        <span className={`${styles.procItemIcon} ${warn ? styles.procItemIconWarn : ""}`}>{icon}</span>
        <span className={styles.proctoringItemLabel}>{label}</span>
      </div>
      <span className={`${styles.proctoringItemValue} ${warn ? styles.proctoringWarnVal : ""}`}>
        {warn && <FiAlertCircle className={styles.warnIcon} />}{value}
      </span>
    </div>
  );
}