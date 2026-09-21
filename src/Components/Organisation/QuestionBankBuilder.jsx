import { useEffect, useState } from "react";
import useModalDismiss from "../../hooks/useModalDismiss";
import { useSelector, useDispatch } from "react-redux";
import styles from "./QuestionBankBuilder.module.css";
import {
  createQuestionBank,
  fetchAllQuestionBank,
  updateQuestionBank,
  deleteQuestionBank,
} from "../../Services/Oprations/QuestionBank";
import { FiEdit2, FiTrash2, FiPlus, FiLayers, FiClock, FiHash, FiCalendar, FiFileText } from "react-icons/fi";

function QuestionBankBuilder() {
  const { questionBanks } = useSelector((state) => state.QB) || { questionBanks: [] };
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    title: "",
    totalQuestions: "",
    examDuration: "",
    instructions: "",
  });

  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    totalQuestions: "",
    examDuration: "",
    instructions: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    createQuestionBank(dispatch, form);
  };

  const openEdit = (bank) => {
    setEditForm({
      title: bank.title || "",
      totalQuestions: bank.totalQuestions || "",
      examDuration: bank.examDuration || "",
      instructions: bank.instructions || "",
      id: bank._id,
    });
    setEditModal(bank);
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditSave = () => {
    updateQuestionBank(dispatch, editForm);
    setEditModal(null);
  };

  function handleDeleteQuestinBank(id) {
    deleteQuestionBank(dispatch, id);
    setDeleteModal(null);
  }

  useEffect(() => {
    fetchAllQuestionBank(dispatch);
  }, []);

  useModalDismiss(Boolean(editModal || deleteModal), () => {
    setEditModal(null);
    setDeleteModal(null);
  });

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.grain} />

      <div className={styles.wrapper}>

        {/* ── HEADER ── */}
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <span className={styles.logoMark}><FiLayers /></span>
            <div>
              <h1 className={styles.pageTitle}>Question Banks</h1>
              <p className={styles.pageSubtitle}>Build and manage your exam question banks</p>
            </div>
          </div>
          <div className={styles.bankCount}>
            <span className={styles.bankCountNum}>{questionBanks?.length ?? 0}</span>
            <span className={styles.bankCountLabel}>Banks</span>
          </div>
        </header>

        {/* ── CREATE FORM ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiPlus className={styles.cardIcon} />
            <span className={styles.cardTitle}>Create Question Bank</span>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Bank Title</label>
              <div className={styles.inputWrap}>
                <FiFileText className={styles.inputIcon} />
                <input
                  className={styles.input}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Advanced Mathematics 2025"
                />
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>Total Questions</label>
                <div className={styles.inputWrap}>
                  <FiHash className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    type="number"
                    name="totalQuestions"
                    value={form.totalQuestions}
                    onChange={handleChange}
                    placeholder="50"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Duration (minutes)</label>
                <div className={styles.inputWrap}>
                  <FiClock className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    type="number"
                    name="examDuration"
                    value={form.examDuration}
                    onChange={handleChange}
                    placeholder="60"
                  />
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Instructions</label>
              <textarea
                className={styles.textarea}
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                placeholder="Enter exam instructions for students…"
              />
            </div>

            <button className={styles.createBtn} type="submit">
              <FiPlus /> Create Question Bank
            </button>
          </form>
        </div>

        {/* ── BANK LIST ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiLayers className={styles.cardIcon} />
            <span className={styles.cardTitle}>Your Question Banks</span>
            <span className={styles.countPill}>{questionBanks?.length ?? 0} total</span>
          </div>

          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Title</span>
              <span>Questions</span>
              <span>Duration</span>
              <span>Created</span>
              <span>Actions</span>
            </div>

            {questionBanks?.length === 0 && (
              <div className={styles.emptyState}>
                <FiLayers className={styles.emptyIcon} />
                <p>No question banks yet. Create one above.</p>
              </div>
            )}

            {questionBanks?.map((bank, idx) => (
              <div key={bank._id} className={styles.row} style={{ animationDelay: `${idx * 0.05}s` }}>
                <span className={styles.titleCell} title={bank.title}>
                  <span className={styles.titleDot} />
                  {bank.title}
                </span>

                <span className={styles.statCell}>
                  <FiHash className={styles.statIcon} />
                  {bank.totalQuestions}
                </span>

                <span className={styles.statCell}>
                  <FiClock className={styles.statIcon} />
                  {bank.examDuration} min
                </span>

                <span className={styles.statCell}>
                  <FiCalendar className={styles.statIcon} />
                  {new Date(bank.createdAt).toLocaleDateString()}
                </span>

                <div className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => openEdit(bank)} title="Edit">
                    <FiEdit2 />
                  </button>
                  <button className={styles.delBtn} onClick={() => setDeleteModal(bank)} title="Delete">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      {deleteModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setDeleteModal(null)}>
          <div className={`${styles.modal} ${styles.deleteModal}`}>
            <div className={styles.deleteIconWrap}><FiTrash2 /></div>
            <h3 className={styles.modalTitle}>Delete Question Bank</h3>
            <p className={styles.deleteText}>
              You're about to permanently delete <strong className={styles.deleteName}>{deleteModal.title}</strong>. This cannot be undone.
            </p>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className={styles.deleteConfirmBtn} onClick={() => handleDeleteQuestinBank(deleteModal._id)}>Delete Bank</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setEditModal(null)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <FiEdit2 className={styles.modalHeaderIcon} />
                <h3 className={styles.modalTitle}>Edit Question Bank</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setEditModal(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.label}>Title</label>
                <div className={styles.inputWrap}>
                  <FiFileText className={styles.inputIcon} />
                  <input className={styles.input} name="title" value={editForm.title} onChange={handleEditChange} placeholder="Bank title" />
                </div>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label className={styles.label}>Total Questions</label>
                  <div className={styles.inputWrap}>
                    <FiHash className={styles.inputIcon} />
                    <input className={styles.input} type="number" name="totalQuestions" value={editForm.totalQuestions} onChange={handleEditChange} placeholder="50" />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Duration (min)</label>
                  <div className={styles.inputWrap}>
                    <FiClock className={styles.inputIcon} />
                    <input className={styles.input} type="number" name="examDuration" value={editForm.examDuration} onChange={handleEditChange} placeholder="60" />
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Instructions</label>
                <textarea className={styles.textarea} name="instructions" value={editForm.instructions} onChange={handleEditChange} placeholder="Instructions…" />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setEditModal(null)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionBankBuilder;