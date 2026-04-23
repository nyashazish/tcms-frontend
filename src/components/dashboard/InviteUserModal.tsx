"use client";

import { useState } from "react";
import { X, PaperPlaneTilt, CheckCircle } from "@phosphor-icons/react";
import { ROLE_LABELS } from "@/lib/auth/roles";
import type { Role } from "@/lib/auth/roles";

interface Props {
  onClose: () => void;
  onInvited: (email: string) => void;
}

type FormValues = { email: string };
type FormErrors = Partial<FormValues>;

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.email) {
    e.email = "Email address is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
    e.email = "Enter a valid email address";
  }
  return e;
}

export function InviteUserModal({ onClose, onInvited }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [fullName, setFullName] = useState("");
  const [touched, setTouched] = useState({ email: false });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const errors = validate({ email });

  function emailClass() {
    if (!touched.email) return "form-input";
    return errors.email ? "form-input error" : "form-input success";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true });
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, fullName: fullName || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
      onInvited(email);
    } catch {
      setServerError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">Invite Team Member</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} weight="bold" />
          </button>
        </div>

        {sent ? (
          <div className="modal-success">
            <CheckCircle size={36} weight="fill" color="var(--accent-green)" />
            <p className="modal-success-text">
              Invitation sent to <strong>{email}</strong>
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              They&apos;ll receive an email with a link to set their password.
            </p>
            <button className="btn-secondary" onClick={onClose} style={{ marginTop: 16 }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="modal-form">
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="invite-email">
                Email address <span style={{ color: "var(--accent-red)" }}>*</span>
              </label>
              <input
                id="invite-email"
                type="email"
                className={emailClass()}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setServerError(null); }}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="colleague@company.com"
                autoFocus
              />
              {touched.email && errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>

            {/* Role */}
            <div className="form-group">
              <label className="form-label" htmlFor="invite-role">
                Role <span style={{ color: "var(--accent-red)" }}>*</span>
              </label>
              <select
                id="invite-role"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Full name (optional) */}
            <div className="form-group">
              <label className="form-label" htmlFor="invite-name">
                Full name{" "}
                <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="invite-name"
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
              />
            </div>

            {/* Server-level error — uses form-server-error so it sits in-flow
                at a predictable location and doesn't shift the fields above */}
            {serverError && (
              <div className="form-server-error" style={{ marginBottom: 0 }}>
                {serverError}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  "Sending…"
                ) : (
                  <>
                    <PaperPlaneTilt size={14} weight="bold" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
