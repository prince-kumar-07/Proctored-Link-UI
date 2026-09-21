import { useEffect, useMemo, useState } from "react";
import useModalDismiss from "../../hooks/useModalDismiss";
import { useSelector, useDispatch } from "react-redux";
import styles from "./ManageOrganisations.module.css";
import {
  MdManageAccounts,
  MdOutlineMailOutline,
  MdOutlinePhone,
  MdOutlineCheckCircle,
  MdOutlineCancel,
  MdOutlinePauseCircle,
  MdOutlinePlayCircle,
  MdOutlineDeleteOutline,
  MdOutlineHourglassEmpty,
  MdOutlineSearch,
} from "react-icons/md";
import {
  fetchAllOrganisations,
  approveOrganisation,
  rejectOrganisation,
  suspendOrganisation,
  reactivateOrganisation,
  deleteOrganisation,
} from "../../Services/Oprations/Admin";

const STATUS_META = {
  pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.10)", dot: "#f59e0b" },
  approved:  { label: "Approved",  color: "#34d399", bg: "rgba(52,211,153,0.10)", dot: "#34d399" },
  suspended: { label: "Suspended", color: "#f87171", bg: "rgba(248,113,113,0.10)", dot: "#f87171" },
  rejected:  { label: "Rejected",  color: "#636880", bg: "rgba(99,102,128,0.14)", dot: "#636880" },
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "suspended", label: "Suspended" },
  { key: "rejected", label: "Rejected" },
];

export default function ManageOrganisations() {
  const { organisations } = useSelector((state) => state.Admin) || { organisations: [] };
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    fetchAllOrganisations(dispatch);
  }, []);

  useModalDismiss(Boolean(rejectModal || deleteModal), () => {
    setRejectModal(null);
    setDeleteModal(null);
  });

  const counts = useMemo(() => {
    const c = { all: organisations.length, pending: 0, approved: 0, suspended: 0, rejected: 0 };
    organisations.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [organisations]);

  const filtered = organisations.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesSearch =
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleReject = () => {
    rejectOrganisation(dispatch, rejectModal._id, rejectReason.trim() || undefined);
    setRejectModal(null);
    setRejectReason("");
  };

  const handleDelete = () => {
    deleteOrganisation(dispatch, deleteModal._id);
    setDeleteModal(null);
  };

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
              <MdManageAccounts />
            </span>
            <div>
              <h1 className={styles.pageTitle}>Manage Organisations</h1>
              <p className={styles.pageSubtitle}>
                Review signups and manage access for every organisation on the platform
              </p>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{counts.pending || 0}</span>
              <span className={styles.statLabel}>Pending</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{counts.approved || 0}</span>
              <span className={styles.statLabel}>Approved</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{organisations.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
          </div>
        </header>

        {/* ── MAIN CARD ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.filterTabs}>
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  className={`${styles.filterTab} ${statusFilter === tab.key ? styles.filterTabActive : ""}`}
                  onClick={() => setStatusFilter(tab.key)}
                >
                  {tab.label}
                  <span className={styles.filterCount}>{counts[tab.key] || 0}</span>
                </button>
              ))}
            </div>

            <div className={styles.searchWrap}>
              <MdOutlineSearch className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <MdManageAccounts className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>No organisations found</p>
              <p className={styles.emptyText}>
                Try a different filter or search term.
              </p>
            </div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Organisation</span>
                <span>Status</span>
                <span>Students / Exams</span>
                <span>Joined</span>
                <span>Actions</span>
              </div>

              {filtered.map((org, idx) => {
                const meta = STATUS_META[org.status];
                return (
                  <div
                    key={org._id}
                    className={styles.tableRow}
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    <div className={styles.orgCell}>
                      <div className={styles.orgAvatar}>
                        {org.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.orgInfo}>
                        <span className={styles.orgName}>{org.name}</span>
                        <span className={styles.orgEmail}>
                          <MdOutlineMailOutline className={styles.metaIcon} />
                          {org.email}
                        </span>
                        {org.phone && (
                          <span className={styles.orgEmail}>
                            <MdOutlinePhone className={styles.metaIcon} />
                            {org.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span
                        className={styles.statusBadge}
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <span className={styles.statusDot} style={{ background: meta.dot }} />
                        {meta.label}
                      </span>
                    </div>

                    <div className={styles.countsCell}>
                      <span>{org.studentCount} students</span>
                      <span className={styles.countsSub}>
                        {org.questionBankCount} banks · {org.examSessionCount} sessions
                      </span>
                    </div>

                    <span className={styles.dateCell}>
                      {new Date(org.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>

                    <div className={styles.actionBtns}>
                      {org.status === "pending" && (
                        <>
                          <button
                            className={styles.approveBtn}
                            title="Approve"
                            onClick={() => approveOrganisation(dispatch, org._id)}
                          >
                            <MdOutlineCheckCircle />
                          </button>
                          <button
                            className={styles.rejectBtn}
                            title="Reject"
                            onClick={() => setRejectModal(org)}
                          >
                            <MdOutlineCancel />
                          </button>
                        </>
                      )}

                      {org.status === "approved" && (
                        <button
                          className={styles.suspendBtn}
                          title="Suspend"
                          onClick={() => suspendOrganisation(dispatch, org._id)}
                        >
                          <MdOutlinePauseCircle />
                        </button>
                      )}

                      {org.status === "suspended" && (
                        <button
                          className={styles.reactivateBtn}
                          title="Reactivate"
                          onClick={() => reactivateOrganisation(dispatch, org._id)}
                        >
                          <MdOutlinePlayCircle />
                        </button>
                      )}

                      {org.status === "rejected" && (
                        <button
                          className={styles.approveBtn}
                          title="Approve"
                          onClick={() => approveOrganisation(dispatch, org._id)}
                        >
                          <MdOutlineCheckCircle />
                        </button>
                      )}

                      <button
                        className={styles.delBtn}
                        title="Delete"
                        onClick={() => setDeleteModal(org)}
                      >
                        <MdOutlineDeleteOutline />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── REJECT MODAL ── */}
      {rejectModal && (
        <div
          className={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && setRejectModal(null)}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <MdOutlineCancel className={styles.modalHeaderIcon} />
                <h3 className={styles.modalTitle}>Reject Organisation</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setRejectModal(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.deleteText} style={{ padding: 0, textAlign: "left" }}>
                Rejecting <strong className={styles.deleteName}>{rejectModal.name}</strong> blocks
                them from logging in. You can optionally give a reason — it will be emailed to them.
              </p>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Reason (optional)</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="e.g. Unable to verify organisation details"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setRejectModal(null)}>
                  Cancel
                </button>
                <button className={styles.deleteConfirmBtn} onClick={handleReject}>
                  Reject Organisation
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
              <MdOutlineDeleteOutline />
            </div>
            <h3 className={styles.modalTitle} style={{ textAlign: "center" }}>
              Delete Organisation
            </h3>
            <p className={styles.deleteText}>
              You're about to permanently remove{" "}
              <strong className={styles.deleteName}>{deleteModal.name}</strong>. Their{" "}
              <strong>{deleteModal.studentCount} students</strong>,{" "}
              <strong>{deleteModal.questionBankCount} question banks</strong> and{" "}
              <strong>{deleteModal.examSessionCount} exam sessions</strong> will be orphaned, not
              deleted. This cannot be undone.
            </p>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeleteModal(null)}>
                Cancel
              </button>
              <button className={styles.deleteConfirmBtn} onClick={handleDelete}>
                Delete Organisation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
