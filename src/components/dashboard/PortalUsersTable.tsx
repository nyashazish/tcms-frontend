"use client";

import { useState } from "react";
import {
  PencilSimple,
  Prohibit,
  Trash,
  CheckCircle,
  CaretLeft,
  CaretRight,
  Plus,
  XCircle,
  CircleNotch,
} from "@phosphor-icons/react";
import { ROLE_LABELS } from "@/lib/auth/roles";
import type { Role } from "@/lib/auth/roles";
import { InviteUserModal } from "@/components/dashboard/InviteUserModal";
import { EditUserModal } from "@/components/dashboard/EditUserModal";

export type PortalUser = {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "account_manager" | "viewer";
  status: "active" | "inactive" | "invited";
  createdAt: string;
  updatedAt: string;
};

interface Props {
  users: PortalUser[];
  currentUserId: string;
}

const PAGE_SIZE = 10;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const actionBtn = (color: string, bg: string, border: string) =>
  ({
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 9px",
    fontSize: 11,
    fontWeight: 500,
    color,
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 5,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties);

const disabledOverlay: React.CSSProperties = { opacity: 0.4, cursor: "not-allowed" };

export function PortalUsersTable({ users: initial, currentUserId }: Props) {
  const [users, setUsers] = useState(initial);
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PortalUser | null>(null);

  // Sets of user IDs currently mid-request
  const [suspending, setSuspending] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [revoking, setRevoking] = useState<Set<string>>(new Set());

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const paged = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const start = users.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, users.length);

  function removeUser(id: string) {
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id);
      setPage((p) => Math.min(p, Math.max(1, Math.ceil(next.length / PAGE_SIZE))));
      return next;
    });
  }

  async function handleToggleSuspend(u: PortalUser) {
    const action = u.status === "active" ? "suspend" : "unsuspend";
    setSuspending((prev) => new Set(prev).add(u.id));
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        window.alert(data.error ?? `Failed to ${action} user.`);
        return;
      }

      setUsers((prev) =>
        prev.map((x) =>
          x.id === u.id
            ? { ...x, status: action === "suspend" ? "inactive" : "active" }
            : x
        )
      );
    } catch {
      window.alert("Network error — please try again.");
    } finally {
      setSuspending((prev) => { const s = new Set(prev); s.delete(u.id); return s; });
    }
  }

  async function handleDelete(u: PortalUser) {
    if (!window.confirm(`Permanently delete ${u.email}? This cannot be undone.`)) return;

    setDeleting((prev) => new Set(prev).add(u.id));
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        window.alert(data.error ?? "Failed to delete user.");
        return;
      }

      removeUser(u.id);
    } catch {
      window.alert("Network error — please try again.");
    } finally {
      setDeleting((prev) => { const s = new Set(prev); s.delete(u.id); return s; });
    }
  }

  async function handleRevoke(u: PortalUser) {
    if (!window.confirm(`Revoke invitation for ${u.email}? They will no longer be able to use their invite link.`)) return;

    setRevoking((prev) => new Set(prev).add(u.id));
    try {
      const res = await fetch("/api/invitations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: u.email }),
      });

      if (!res.ok) {
        const data = await res.json();
        window.alert(data.error ?? "Failed to revoke invitation.");
        return;
      }

      removeUser(u.id);
    } catch {
      window.alert("Network error — please try again.");
    } finally {
      setRevoking((prev) => { const s = new Set(prev); s.delete(u.id); return s; });
    }
  }

  function handleRoleSaved(id: string, newRole: Role) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
  }

  function handleInvited(email: string) {
    const now = new Date().toISOString();
    setUsers((prev) => [
      { id: `pending-${email}`, email, fullName: email, role: "viewer", status: "invited", createdAt: now, updatedAt: now },
      ...prev,
    ]);
  }

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Header */}
        <div
          className="card-header"
          style={{ padding: "20px 24px", marginBottom: 0, alignItems: "center" }}
        >
          <p className="card-title" style={{ margin: 0 }}>
            All Users
            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400, color: "var(--text-muted)" }}>
              {users.length} total
            </span>
          </p>
          <button className="btn-primary" onClick={() => setInviteOpen(true)}>
            <Plus size={14} weight="bold" />
            Invite User
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ padding: "0 24px 12px", textAlign: "left" }}>USER</th>
                <th style={{ padding: "0 12px 12px", textAlign: "left" }}>ROLE</th>
                <th style={{ padding: "0 12px 12px", textAlign: "left" }}>CREATED</th>
                <th style={{ padding: "0 12px 12px", textAlign: "left" }}>LAST UPDATED</th>
                <th style={{ padding: "0 12px 12px", textAlign: "center" }}>STATUS</th>
                <th style={{ padding: "0 24px 12px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                paged.map((u) => {
                  const isSelf = u.id === currentUserId;
                  const isSuspending = suspending.has(u.id);
                  const isDeleting = deleting.has(u.id);
                  const isRevoking = revoking.has(u.id);

                  return (
                    <tr key={u.id}>
                      <td style={{ padding: "12px 24px" }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{u.fullName}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</div>
                      </td>

                      <td style={{ padding: "12px 12px" }}>
                        <span className="service-badge">{ROLE_LABELS[u.role]}</span>
                      </td>

                      <td style={{ padding: "12px 12px", fontSize: 12, color: "var(--text-secondary)" }}>
                        {fmtDate(u.createdAt)}
                      </td>

                      <td style={{ padding: "12px 12px", fontSize: 12, color: "var(--text-secondary)" }}>
                        {fmtDate(u.updatedAt)}
                      </td>

                      <td style={{ padding: "12px 12px", textAlign: "center" }}>
                        <span
                          className={`badge ${
                            u.status === "active" ? "positive" : u.status === "invited" ? "neutral" : "negative"
                          }`}
                          style={{ textTransform: "capitalize" }}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td style={{ padding: "12px 24px" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>

                          {/* Edit role — only for non-invited, non-self */}
                          <button
                            onClick={() => !isSelf && u.status !== "invited" && setEditTarget(u)}
                            disabled={isSelf || u.status === "invited"}
                            title={isSelf ? "Cannot edit your own role" : u.status === "invited" ? "User hasn't accepted invite yet" : "Edit role"}
                            style={{
                              ...actionBtn("var(--accent-blue)", "rgba(59,130,246,0.08)", "rgba(59,130,246,0.25)"),
                              ...(isSelf || u.status === "invited" ? disabledOverlay : {}),
                            }}
                          >
                            <PencilSimple size={12} />
                            Edit
                          </button>

                          {/* Suspend / Activate — only for non-invited, non-self */}
                          {u.status !== "invited" && (
                            <button
                              onClick={() => !isSelf && !isSuspending && handleToggleSuspend(u)}
                              disabled={isSelf || isSuspending}
                              title={isSelf ? "Cannot suspend your own account" : undefined}
                              style={{
                                ...(u.status === "active"
                                  ? actionBtn("var(--accent-yellow)", "rgba(234,179,8,0.08)", "rgba(234,179,8,0.25)")
                                  : actionBtn("var(--accent-green)", "rgba(34,197,94,0.08)", "rgba(34,197,94,0.25)")),
                                ...(isSelf || isSuspending ? disabledOverlay : {}),
                              }}
                            >
                              {isSuspending ? (
                                <CircleNotch size={12} style={{ animation: "spin 0.8s linear infinite" }} />
                              ) : u.status === "active" ? (
                                <Prohibit size={12} />
                              ) : (
                                <CheckCircle size={12} />
                              )}
                              {isSuspending
                                ? u.status === "active" ? "Suspending…" : "Activating…"
                                : u.status === "active" ? "Suspend" : "Activate"}
                            </button>
                          )}

                          {/* Revoke (invited) / Delete (active or inactive) */}
                          {u.status === "invited" ? (
                            <button
                              onClick={() => !isRevoking && handleRevoke(u)}
                              disabled={isRevoking}
                              style={{
                                ...actionBtn("var(--accent-yellow)", "rgba(234,179,8,0.08)", "rgba(234,179,8,0.25)"),
                                ...(isRevoking ? disabledOverlay : {}),
                              }}
                            >
                              <XCircle size={12} />
                              {isRevoking ? "Revoking…" : "Revoke"}
                            </button>
                          ) : (
                            <button
                              onClick={() => !isSelf && !isDeleting && handleDelete(u)}
                              disabled={isSelf || isDeleting}
                              title={isSelf ? "Cannot delete your own account" : undefined}
                              style={{
                                ...actionBtn("var(--accent-red)", "rgba(239,68,68,0.08)", "rgba(239,68,68,0.25)"),
                                ...(isSelf || isDeleting ? disabledOverlay : {}),
                              }}
                            >
                              {isDeleting ? (
                                <CircleNotch size={12} style={{ animation: "spin 0.8s linear infinite" }} />
                              ) : (
                                <Trash size={12} />
                              )}
                              {isDeleting ? "Deleting…" : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 24px",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {users.length === 0 ? "No users" : `Showing ${start}–${end} of ${users.length} users`}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className="btn-secondary"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              style={{ padding: "5px 10px", fontSize: 12 }}
            >
              <CaretLeft size={12} style={{ marginRight: 4 }} />
              Prev
            </button>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", minWidth: 60, textAlign: "center" }}>
              {page} / {totalPages}
            </span>
            <button
              className="btn-secondary"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              style={{ padding: "5px 10px", fontSize: 12 }}
            >
              Next
              <CaretRight size={12} style={{ marginLeft: 4 }} />
            </button>
          </div>
        </div>
      </div>

      {inviteOpen && (
        <InviteUserModal
          onClose={() => setInviteOpen(false)}
          onInvited={(email) => {
            handleInvited(email);
            setInviteOpen(false);
          }}
        />
      )}

      {editTarget && (
        <EditUserModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={(newRole) => {
            handleRoleSaved(editTarget.id, newRole);
            setEditTarget(null);
          }}
        />
      )}
    </>
  );
}
