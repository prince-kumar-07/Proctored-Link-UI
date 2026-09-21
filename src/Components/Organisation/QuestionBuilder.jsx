import { useEffect, useState } from "react";
import useModalDismiss from "../../hooks/useModalDismiss";
import styles from "./QuestionBuilder.module.css";
import { FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiZap, FiDatabase } from "react-icons/fi";
import {
  createQuestion,
  fetchQuestionsList,
  deleteQuestion,
  updateQuestion
} from "../../Services/Oprations/Questions";
import { fetchQuestionBankList } from "../../Services/Oprations/QuestionBank";
import { useSelector, useDispatch } from "react-redux";

const DIFF_META = {
  easy:   { color: "#34d399", bg: "rgba(52,211,153,0.10)", dot: "#34d399" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  dot: "#f59e0b" },
  hard:   { color: "#f87171", bg: "rgba(248,113,113,0.10)", dot: "#f87171" },
};

export default function QuestionBuilder() {
  const { questionBanksList } = useSelector((state) => state.QB) || { questionBanksList: [] };
  const { questions }         = useSelector((state) => state.Question) || { questions: [] };
  const dispatch = useDispatch();

  const [selectedBank, setSelectedBank] = useState("");
  const [editModal,    setEditModal]    = useState(null);
  const [deleteModal,  setDeleteModal]  = useState(null);
  const [formFocus,    setFormFocus]    = useState(null);

  const [form, setForm] = useState({
    questionBankId: "",
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: null,
    difficulty: "medium",
    marks: 1,
  });

  const handleOptionChange = (index, value) => {
    const updated = [...form.options];
    updated[index] = value;
    setForm((prev) => ({ ...prev, options: updated }));
  };

  const handleCorrect = (val) => setForm((prev) => ({ ...prev, correctAnswer: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    createQuestion(dispatch, form);
  };

  const openEditModal = (q) => {
    setEditModal({
      ...q,
      optionA: q.options[0],
      optionB: q.options[1],
      optionC: q.options[2],
      optionD: q.options[3],
      correctAnswer: q.correctAnswer ?? null,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditModal((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    const payload = {
      ...editModal,
      options: [editModal.optionA, editModal.optionB, editModal.optionC, editModal.optionD],
    };
    updateQuestion(dispatch, payload, selectedBank)
    // console.log("Update Question", payload);
    setEditModal(null);
  };

  const handleDelete = () => {
    deleteQuestion(dispatch, deleteModal._id, selectedBank);
    setDeleteModal(null);
  };

  useEffect(() => { fetchQuestionBankList(dispatch); }, []);

  function handleFetchQuestionsList() {
    if (!selectedBank) return;
    fetchQuestionsList(dispatch, selectedBank);
  }

  useModalDismiss(Boolean(editModal || deleteModal), () => {
    setEditModal(null);
    setDeleteModal(null);
  });

  const optLabels = ["A", "B", "C", "D"];

  return (
    <div className={styles.page}>
      {/* ambient blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.grain} />

      <div className={styles.container}>

        {/* ── HEADER ── */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logoMark}><FiZap /></span>
            <div>
              <h1 className={styles.title}>Question Builder</h1>
              <p className={styles.subtitle}>Craft, organise & manage your question banks</p>
            </div>
          </div>
          <div className={styles.headerBadge}>
            <span className={styles.statusDot} />
            Studio
          </div>
        </header>

        {/* ── CREATE QUESTION ── */}
        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <FiPlus className={styles.cardIcon} />
            <span className={styles.cardTitle}>Create Question</span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Question Bank</label>
            <div className={styles.selectWrap}>
              <select
                className={styles.select}
                value={form.questionBankId}
                onChange={(e) => setForm({ ...form, questionBankId: e.target.value })}
              >
                <option value="">Select a bank…</option>
                {questionBanksList.map((b) => (
                  <option key={b._id} value={b._id}>{b.title}</option>
                ))}
              </select>
              <FiChevronDown className={styles.selectIcon} />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Question Text</label>
            <textarea
              className={`${styles.textarea} ${formFocus === "qt" ? styles.focused : ""}`}
              value={form.questionText}
              onFocus={() => setFormFocus("qt")}
              onBlur={() => setFormFocus(null)}
              onChange={(e) => setForm({ ...form, questionText: e.target.value })}
              placeholder="Type your question here…"
            />
          </div>

          {/* Options */}
          <div className={styles.optionsSection}>
            <div className={styles.optionsGrid}>
              {form.options.map((opt, i) => (
                <div key={i} className={styles.optionCard}>
                  <div className={styles.optionBadge}>{optLabels[i]}</div>
                  <input
                    className={styles.optionInput}
                    placeholder={`Option ${optLabels[i]}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className={styles.correctBox}>
              <span className={styles.label}>Correct Answer</span>
              <div className={styles.radioRow}>
                {form.options.map((opt, i) => (
                  <label
                    key={i}
                    className={`${styles.radioChip} ${opt && form.correctAnswer === opt ? styles.radioActive : ""}`}
                  >
                    <input
                      type="radio"
                      name="correctAnswer"
                      hidden
                      checked={!!opt && form.correctAnswer === opt}
                      onChange={() => handleCorrect(form.options[i])}
                    />
                    {optLabels[i]}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Difficulty</label>
            <div className={styles.diffRow}>
              {["easy", "medium", "hard"].map((level) => (
                <button
                  type="button"
                  key={level}
                  className={`${styles.diffChip} ${form.difficulty === level ? styles.diffActive : ""}`}
                  style={form.difficulty === level ? {
                    background: DIFF_META[level].bg,
                    color: DIFF_META[level].color,
                    borderColor: DIFF_META[level].color,
                  } : {}}
                  onClick={() => setForm({ ...form, difficulty: level })}
                >
                  <span
                    className={styles.diffDot}
                    style={form.difficulty === level ? { background: DIFF_META[level].dot } : {}}
                  />
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Marks */}
          <div className={styles.fieldGroup} style={{ maxWidth: 160 }}>
            <label className={styles.label}>Marks</label>
            <input
              type="number"
              className={styles.input}
              value={form.marks}
              onChange={(e) => setForm({ ...form, marks: e.target.value })}
            />
          </div>

          <button className={styles.submitBtn} type="submit">
            <FiPlus /> Create Question
          </button>
        </form>

        {/* ── MANAGE QUESTIONS ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiDatabase className={styles.cardIcon} />
            <span className={styles.cardTitle}>Manage Questions</span>
            <span className={styles.questionCount}>{questions.length} questions</span>
          </div>

          <div className={styles.fetchRow}>
            <div className={styles.selectWrap} style={{ flex: 1 }}>
              <select
                className={styles.select}
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                <option value="">Select a bank…</option>
                {questionBanksList.map((b) => (
                  <option key={b._id} value={b._id}>{b.title}</option>
                ))}
              </select>
              <FiChevronDown className={styles.selectIcon} />
            </div>
            <button className={styles.fetchBtn} onClick={handleFetchQuestionsList}>
              Fetch Questions
            </button>
          </div>

          {/* Table */}
          {questions.length > 0 ? (
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Question</span>
                <span>Difficulty</span>
                <span>Marks</span>
                <span>Actions</span>
              </div>

              {questions.map((q, idx) => (
                <div
                  key={q._id}
                  className={styles.tableRow}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <span className={styles.qText}>{q.questionText}</span>

                  <span
                    className={styles.diffPill}
                    style={{
                      background: DIFF_META[q.difficulty]?.bg,
                      color: DIFF_META[q.difficulty]?.color,
                    }}
                  >
                    <span
                      className={styles.diffDot}
                      style={{ background: DIFF_META[q.difficulty]?.dot }}
                    />
                    {q.difficulty}
                  </span>

                  <span className={styles.marksVal}>{q.marks} pt{q.marks !== 1 ? "s" : ""}</span>

                  <div className={styles.actionBtns}>
                    <button className={styles.editBtn} onClick={() => openEditModal(q)} title="Edit">
                      <FiEdit2 />
                    </button>
                    <button className={styles.delBtn} onClick={() => setDeleteModal(q)} title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FiDatabase className={styles.emptyIcon} />
              <p>Select a bank and fetch to see questions</p>
            </div>
          )}
        </div>
      </div>

      {/* ── EDIT MODAL ── */}
      {editModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setEditModal(null)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <FiEdit2 className={styles.modalHeaderIcon} />
                <h3 className={styles.modalTitle}>Edit Question</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setEditModal(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Question</label>
                <textarea
                  className={styles.textarea}
                  name="questionText"
                  value={editModal.questionText}
                  onChange={handleEditChange}
                />
              </div>

              <div className={styles.optionsGrid}>
                {["A","B","C","D"].map((lbl, i) => {
                  const key = ["optionA","optionB","optionC","optionD"][i];
                  return (
                    <div key={lbl} className={styles.optionCard}>
                      <div className={styles.optionBadge}>{lbl}</div>
                      <input
                        className={styles.optionInput}
                        name={key}
                        value={editModal[key]}
                        onChange={handleEditChange}
                      />
                    </div>
                  );
                })}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Correct Answer</label>
                <div className={styles.radioRow}>
                  {["A","B","C","D"].map((lbl, i) => (
                    <label
                      key={lbl}
                      className={`${styles.radioChip} ${editModal[["optionA","optionB","optionC","optionD"][i]] && editModal.correctAnswer === editModal[["optionA","optionB","optionC","optionD"][i]] ? styles.radioActive : ""}`}
                    >
                      <input
                        type="radio"
                        name="correctAnswer"
                        hidden
                        checked={!!editModal[["optionA","optionB","optionC","optionD"][i]] && editModal.correctAnswer === editModal[["optionA","optionB","optionC","optionD"][i]]}
                        onChange={() => setEditModal((prev) => ({ ...prev, correctAnswer: prev[["optionA","optionB","optionC","optionD"][i]] }))}
                      />
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Difficulty</label>
                <div className={styles.diffRow}>
                  {["easy","medium","hard"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`${styles.diffChip} ${editModal.difficulty === level ? styles.diffActive : ""}`}
                      style={editModal.difficulty === level ? {
                        background: DIFF_META[level].bg,
                        color: DIFF_META[level].color,
                        borderColor: DIFF_META[level].color,
                      } : {}}
                      onClick={() => setEditModal((prev) => ({ ...prev, difficulty: level }))}
                    >
                      <span
                        className={styles.diffDot}
                        style={editModal.difficulty === level ? { background: DIFF_META[level].dot } : {}}
                      />
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup} style={{ maxWidth: 140 }}>
                <label className={styles.label}>Marks</label>
                <input
                  type="number"
                  className={styles.input}
                  name="marks"
                  value={editModal.marks}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setEditModal(null)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setDeleteModal(null)}>
          <div className={`${styles.modal} ${styles.deleteModal}`}>
            <div className={styles.deleteIconWrap}>
              <FiTrash2 />
            </div>
            <h3 className={styles.modalTitle} style={{ textAlign: "center" }}>Delete Question</h3>
            <p className={styles.deleteText}>
              This action is permanent and cannot be undone. The question will be removed from the bank.
            </p>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className={styles.deleteConfirmBtn} onClick={handleDelete}>Delete Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}