import { useEffect, useMemo, useState } from "react";
import useModalDismiss from "../../hooks/useModalDismiss";
import { useSelector, useDispatch } from "react-redux";
import styles from "./ManageProctors.module.css";
import {
  MdOutlineRemoveRedEye,
  MdOutlineMailOutline,
  MdOutlinePhone,
  MdOutlinePauseCircle,
  MdOutlinePlayCircle,
  MdOutlineDeleteOutline,
  MdOutlineSearch,
  MdOutlinePersonAddAlt,
  MdOutlineEdit,
  MdOutlineDomain,
} from "react-icons/md";
import { fetchAllOrganisations } from "../../Services/Oprations/Admin";
import {
  fetchAllProctors,
  createProctor,
  updateProctorAssignments,
  suspendProctor,
  reactivateProctor,
  deleteProctor,
} from "../../Services/Oprations/Admin";

const EMPTY_FORM = { name: "", email: "", phone: "" };

export default function ManageProctors() {
  const { proctors, organisations } = useSelector((state) => state.Admin) || { proctors: [], organisations: [] };
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [assignSelection, setAssignSelection] = useState([]);

  useEffect(() => {
    fetchAllProctors(dispatch);
    fetchAllOrganisations(dispatch);
  }, []);

  useModalDismiss(Boolean(createModal || assignModal || deleteModal), () => {
    setCreateModal(false);
    setAssignModal(null);
    setDeleteModal(null);
  });

  const approvedOrgs = useMemo(
    () => organisations.filter((o) => o.status === "approved"),
    [organisations],
  );

  const filtered = proctors.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleOrg = (list, setList, id) => {
    setList(list.includes(id) ? list.filter((o) => o !== id) : [...list, id]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const ok = await createProctor(dispatch, { ...form, assignedOrganisations: selectedOrgs });
    if (ok) {
      setForm(EMPTY_FORM);
      setSelectedOrgs([]);
      setCreateModal(false);
    }
  };

  const openAssign = (proctor) => {
    setAssignSelection((proctor.assignedOrganisations || []).map((o) => o._id));
    setAssignModal(proctor);
  };

  const handleAssignSave = () => {
    updateProctorAssignments(dispatch, assignModal._id, assignSelection);
    setAssignModal(null);
  };

  const handleDelete = () => {
    deleteProctor(dispatch, deleteModal._id);
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
              <MdOutlineRemoveRedEye />
            </span>
            <div>
              <h1 className={styles.pageTitle}>Manage Proctors</h1>
              <p className={styles.pageSubtitle}>
                Create proctor accounts and assign them to organisations they'll monitor
              </p>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{proctors.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <button className={styles.createBtn} onClick={() => setCreateModal(true)}>
              <MdOutlinePersonAddAlt /> Add Proctor
            </button>
          </div>
        </header>

        {/* ── MAIN CARD ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <MdOutlineRemoveRedEye className={styles.cardIcon} />
              <span className={styles.cardTitle}>All Proctors</span>
              <span className={styles.countPill}>{filtered.length} shown</span>
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
              <MdOutlineRemoveRedEye className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>No proctors found</p>
              <p className={styles.emptyText}>Add your first proctor or try a different search.</p>
              <button className={styles.emptyBtn} onClick={() => setCreateModal(true)}>
                <MdOutlinePersonAddAlt /> Add Proctor
              </button>
            </div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Proctor</span>
                <span>Assigned Organisations</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {filtered.map((proctor, idx) => (
                <div
                  key={proctor._id}
                  className={styles.tableRow}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  <div className={styles.proctorCell}>
                    <div className={styles.proctorAvatar}>
                      {proctor.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.proctorInfo}>
                      <span className={styles.proctorName}>{proctor.name}</span>
                      <span className={styles.proctorEmail}>
                        <MdOutlineMailOutline className={styles.metaIcon} />
                        {proctor.email}
                      </span>
                      {proctor.phone && (
                        <span className={styles.proctorEmail}>
                          <MdOutlinePhone className={styles.metaIcon} />
                          {proctor.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.orgsCell}>
                    {proctor.assignedOrganisations?.length > 0 ? (
                      <button className={styles.orgsBadge} onClick={() => openAssign(proctor)}>
                        <MdOutlineDomain />
                        {proctor.assignedOrganisations.length} organisation
                        {proctor.assignedOrganisations.length !== 1 ? "s" : ""}
                      </button>
                    ) : (
                      <button className={styles.noOrgs} onClick={() => openAssign(proctor)}>
                        No organisations — assign
                      </button>
                    )}
                  </div>

                  <div>
                    <span
                      className={styles.statusBadge}
                      style={
                        proctor.isSuspended
                          ? { background: "rgba(248,113,113,0.10)", color: "#f87171" }
                          : { background: "rgba(52,211,153,0.10)", color: "#34d399" }
                      }
                    >
                      <span
                        className={styles.statusDot}
                        style={{ background: proctor.isSuspended ? "#f87171" : "#34d399" }}
                      />
                      {proctor.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </div>

                  <div className={styles.actionBtns}>
                    <button className={styles.editBtn} title="Edit assignments" onClick={() => openAssign(proctor)}>
                      <MdOutlineEdit />
                    </button>
                    {proctor.isSuspended ? (
                      <button
                        className={styles.reactivateBtn}
                        title="Reactivate"
                        onClick={() => reactivateProctor(dispatch, proctor._id)}
                      >
                        <MdOutlinePlayCircle />
                      </button>
                    ) : (
                      <button
                        className={styles.suspendBtn}
                        title="Suspend"
                        onClick={() => suspendProctor(dispatch, proctor._id)}
                      >
                        <MdOutlinePauseCircle />
                      </button>
                    )}
                    <button className={styles.delBtn} title="Delete" onClick={() => setDeleteModal(proctor)}>
                      <MdOutlineDeleteOutline />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE MODAL ── */}
      {createModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setCreateModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <MdOutlinePersonAddAlt className={styles.modalHeaderIcon} />
                <h3 className={styles.modalTitle}>Add New Proctor</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setCreateModal(false)}>✕</button>
            </div>

            <form className={styles.modalBody} onSubmit={handleCreate}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  className={styles.input}
                  placeholder="e.g. Anjali Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="e.g. anjali@proctoredlink.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Phone</label>
                <input
                  className={styles.input}
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>

              <p className={styles.inviteNote}>
                They'll receive an email to set their own password and activate the account.
              </p>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Assign Organisations (optional)</label>
                {approvedOrgs.length === 0 ? (
                  <p className={styles.noOrgsNote}>No approved organisations yet.</p>
                ) : (
                  <div className={styles.orgChecklist}>
                    {approvedOrgs.map((org) => (
                      <label key={org._id} className={styles.orgCheckItem}>
                        <input
                          type="checkbox"
                          checked={selectedOrgs.includes(org._id)}
                          onChange={() => toggleOrg(selectedOrgs, setSelectedOrgs, org._id)}
                        />
                        <span>{org.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  <MdOutlinePersonAddAlt /> Add Proctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ASSIGN MODAL ── */}
      {assignModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setAssignModal(null)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <MdOutlineDomain className={styles.modalHeaderIcon} />
                <h3 className={styles.modalTitle}>Assign Organisations — {assignModal.name}</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setAssignModal(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              {approvedOrgs.length === 0 ? (
                <p className={styles.noOrgsNote}>No approved organisations yet.</p>
              ) : (
                <div className={styles.orgChecklist}>
                  {approvedOrgs.map((org) => (
                    <label key={org._id} className={styles.orgCheckItem}>
                      <input
                        type="checkbox"
                        checked={assignSelection.includes(org._id)}
                        onChange={() => toggleOrg(assignSelection, setAssignSelection, org._id)}
                      />
                      <span>{org.name}</span>
                    </label>
                  ))}
                </div>
              )}

              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setAssignModal(null)}>
                  Cancel
                </button>
                <button className={styles.saveBtn} onClick={handleAssignSave}>
                  Save Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setDeleteModal(null)}>
          <div className={`${styles.modal} ${styles.deleteModal}`}>
            <div className={styles.deleteIconWrap}>
              <MdOutlineDeleteOutline />
            </div>
            <h3 className={styles.modalTitle} style={{ textAlign: "center" }}>
              Delete Proctor
            </h3>
            <p className={styles.deleteText}>
              You're about to permanently remove{" "}
              <strong className={styles.deleteName}>{deleteModal.name}</strong> and all their
              organisation assignments. This cannot be undone.
            </p>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeleteModal(null)}>
                Cancel
              </button>
              <button className={styles.deleteConfirmBtn} onClick={handleDelete}>
                Delete Proctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
