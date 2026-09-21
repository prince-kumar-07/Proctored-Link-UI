import { useEffect, useState } from "react";
import useModalDismiss from "../../hooks/useModalDismiss";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Students.module.css";
import {
  FiUsers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMail,
  FiUser,
  FiSearch,
  FiBookOpen,
  FiClock,
  FiCheckCircle,
  FiLoader,
} from "react-icons/fi";
import {
  createStudent,
  fetchAllStudents,
  updateStudent,
  deleteStudent,
} from "../../Services/Oprations/Student";

const STATUS_META = {
  assigned: {
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.10)",
    dot: "#60a5fa",
    label: "Assigned",
  },
  started: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.10)",
    dot: "#f59e0b",
    label: "Started",
  },
  completed: {
    color: "#34d399",
    bg: "rgba(52,211,153,0.10)",
    dot: "#34d399",
    label: "Completed",
  },
};

const StatusIcon = ({ status }) => {
  if (status === "completed") return <FiCheckCircle />;
  if (status === "started") return <FiLoader />;
  return <FiClock />;
};

export default function Students() {
  const { students } = useSelector((state) => state.Students) || {
    students: [],
  };
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const [form, setForm] = useState({ name: "", email: "" });
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  useEffect(() => {
    fetchAllStudents(dispatch);
  }, []);

  useModalDismiss(Boolean(createModal || editModal || deleteModal), () => {
    setCreateModal(false);
    setEditModal(null);
    setDeleteModal(null);
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createStudent(dispatch, form);
    setForm({ name: "", email: "" });
    setCreateModal(false);
  };

  const openEdit = (student) => {
    setEditForm({ name: student.name, email: student.email, id: student._id });
    setEditModal(student);
  };

  const handleEditSave = () => {
    updateStudent(dispatch, editForm);
    setEditModal(null);
  };

  const handleDelete = () => {
    deleteStudent(dispatch, deleteModal._id);
    setDeleteModal(null);
  };

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.grain} />

      <div className={styles.container}>
        {/* ── PAGE HEADER ── */}
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <span className={styles.logoMark}>
              <FiUsers />
            </span>
            <div>
              <h1 className={styles.pageTitle}>Students</h1>
              <p className={styles.pageSubtitle}>
                Manage enrolled students and their exam assignments
              </p>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{students.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <button
              className={styles.createBtn}
              onClick={() => setCreateModal(true)}
            >
              <FiPlus /> Add Student
            </button>
          </div>
        </header>

        {/* ── MAIN CARD ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <FiUsers className={styles.cardIcon} />
              <span className={styles.cardTitle}>All Students</span>
              <span className={styles.countPill}>{filtered.length} shown</span>
            </div>

            {/* Search */}
            <div className={styles.searchWrap}>
              <FiSearch className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <FiUsers className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>No students found</p>
              <p className={styles.emptyText}>
                Add your first student or try a different search.
              </p>
              <button
                className={styles.emptyBtn}
                onClick={() => setCreateModal(true)}
              >
                <FiPlus /> Add Student
              </button>
            </div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Student</span>
                <span>Assigned Exams</span>
                <span>Joined</span>
                <span>Actions</span>
              </div>

              {filtered.map((student, idx) => (
                <div key={student._id}>
                  <div
                    className={styles.tableRow}
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    {/* Student info */}
                    <div className={styles.studentCell}>
                      <div className={styles.studentAvatar}>
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.studentInfo}>
                        <span className={styles.studentName}>
                          {student.name}
                        </span>
                        <span className={styles.studentEmail}>
                          <FiMail className={styles.emailIcon} />
                          {student.email}
                        </span>
                      </div>
                    </div>

                    {/* Exam count */}
                    <div className={styles.examsCell}>
                      {student.assignedExams?.length > 0 ? (
                        <button
                          className={styles.examsBadge}
                          onClick={() =>
                            setExpandedRow(
                              expandedRow === student._id ? null : student._id,
                            )
                          }
                        >
                          <FiBookOpen />
                          {student.assignedExams.length} exam
                          {student.assignedExams.length !== 1 ? "s" : ""}
                          <span
                            className={`${styles.expandArrow} ${expandedRow === student._id ? styles.expanded : ""}`}
                          >
                            ▾
                          </span>
                        </button>
                      ) : (
                        <span className={styles.noExams}>
                          No exams assigned
                        </span>
                      )}
                    </div>

                    {/* Joined date */}
                    <span className={styles.dateCell}>
                      {new Date(student.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>

                    {/* Actions */}
                    <div className={styles.actionBtns}>
                      <button
                        className={styles.editBtn}
                        onClick={() => openEdit(student)}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className={styles.delBtn}
                        onClick={() => setDeleteModal(student)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  {/* Expanded exams */}
                  {expandedRow === student._id &&
                    student.assignedExams?.length > 0 && (
                      <div className={styles.examsExpanded}>
                        <div className={styles.examsGrid}>
                          {student.assignedExams.map((exam, ei) => (
                            <div key={ei} className={styles.examCard}>
                              <div className={styles.examCardLeft}>
                                <FiBookOpen className={styles.examCardIcon} />
                                <span className={styles.examId}>
                                  {String(exam.questionBankId)
                                    .slice(-8)
                                    .toUpperCase()}
                                </span>
                              </div>
                              <div className={styles.examCardRight}>
                                <span
                                  className={styles.examStatus}
                                  style={{
                                    background: STATUS_META[exam.status]?.bg,
                                    color: STATUS_META[exam.status]?.color,
                                  }}
                                >
                                  <span
                                    className={styles.examStatusDot}
                                    style={{
                                      background: STATUS_META[exam.status]?.dot,
                                    }}
                                  />
                                  {STATUS_META[exam.status]?.label}
                                </span>
                                <span className={styles.examDate}>
                                  {new Date(exam.assignedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE MODAL ── */}
      {createModal && (
        <div
          className={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && setCreateModal(false)}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <FiPlus className={styles.modalHeaderIcon} />
                <h3 className={styles.modalTitle}>Add New Student</h3>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form className={styles.modalBody} onSubmit={handleCreate}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Full Name</label>
                <div className={styles.inputWrap}>
                  <FiUser className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    placeholder="e.g. Jane Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrap}>
                  <FiMail className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="e.g. jane@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  <FiPlus /> Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editModal && (
        <div
          className={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && setEditModal(null)}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <FiEdit2 className={styles.modalHeaderIcon} />
                <h3 className={styles.modalTitle}>Edit Student</h3>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setEditModal(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Full Name</label>
                <div className={styles.inputWrap}>
                  <FiUser className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrap}>
                  <FiMail className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setEditModal(null)}
                >
                  Cancel
                </button>
                <button className={styles.saveBtn} onClick={handleEditSave}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteModal && (
        <div
          className={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && setDeleteModal(null)}
        >
          <div className={`${styles.modal} ${styles.deleteModal}`}>
            <div className={styles.deleteIconWrap}>
              <FiTrash2 />
            </div>
            <h3 className={styles.modalTitle} style={{ textAlign: "center" }}>
              Remove Student
            </h3>
            <p className={styles.deleteText}>
              You're about to permanently remove{" "}
              <strong className={styles.deleteName}>{deleteModal.name}</strong>{" "}
              and all their exam assignments. This cannot be undone.
            </p>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteModal(null)}
              >
                Cancel
              </button>
              <button
                className={styles.deleteConfirmBtn}
                onClick={handleDelete}
              >
                Remove Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
