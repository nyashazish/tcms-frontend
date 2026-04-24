"use client";

import { useState } from "react";
import { X, CheckCircle } from "@phosphor-icons/react";
import { ROLE_LABELS } from "@/lib/auth/roles";
import type { Role } from "@/lib/auth/roles";
import type { PortalUser } from "@/components/dashboard/PortalUsersTable";

interface Props {
  user: PortalUser;
  onClose: () => void;
  onSaved: (updatedRole: Role) => void;
}

export function EditUserModal({ user, onClose, onSaved }: Props) {
  const [role, setRole] = useState<Role>(user.role);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const unchanged = role === user.role;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (unchanged) return;

    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "role", role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSaved(true);
      onSaved(role);
    } catch {
      setServerError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit User</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} weight="bold" />
          </button>
        </div>

        {saved ? (
          <div className="modal-success">
            <CheckCircle size={36} weight="fill" color="var(--accent-green)" />
            <p className="modal-success-text">Role updated successfully</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              <strong>{user.email}</strong> is now a{" "}
              <strong>{ROLE_LABELS[role]}</strong>. They have been notified by email.
            </p>
            <button className="btn-secondary" onClick={onClose} style={{ marginTop: 16 }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="modal-form">
            <div className="form-group">
              <label className="form-label">User</label>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                {user.fullName !== user.email ? (
                  <>
                    <strong>{user.fullName}</strong>
                    <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>
                      {user.email}
                    </span>
                  </>
                ) : (
                  <strong>{user.email}</strong>
                )}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-role">
                Role <span style={{ color: "var(--accent-red)" }}>*</span>
              </label>
              <select
                id="edit-role"
                className="form-select"
                value={role}
                onChange={(e) => { setRole(e.target.value as Role); setServerError(null); }}
              >
                {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {serverError && (
              <div className="form-server-error" style={{ marginBottom: 0 }}>
                {serverError}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || unchanged}
              >
                {loading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
