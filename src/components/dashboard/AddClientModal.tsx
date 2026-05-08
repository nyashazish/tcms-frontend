"use client";

import { useState } from "react";
import { X, Plus, CheckCircle } from "@phosphor-icons/react";
import type { Client } from "@/lib/types";

interface Props {
  onClose: () => void;
  onAdd: (client: Client) => void;
}

type FormValues = { name: string; googleId: string };
type FormErrors = Partial<FormValues>;

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.name.trim()) e.name = "Client name is required";
  if (!v.googleId.trim()) e.googleId = "Google ID is required";
  return e;
}

export function AddClientModal({ onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [googleId, setGoogleId] = useState("");
  const [touched, setTouched] = useState({ name: false, googleId: false });
  const [added, setAdded] = useState(false);

  const errors = validate({ name, googleId });

  function nameClass() {
    if (!touched.name) return "form-input";
    return errors.name ? "form-input error" : "form-input success";
  }

  function googleIdClass() {
    if (!touched.googleId) return "form-input";
    return errors.googleId ? "form-input error" : "form-input success";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, googleId: true });
    if (Object.keys(errors).length > 0) return;

    const client: Client = {
      id: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
      name: name.trim(),
      googleId: googleId.trim(),
      industry: "",
      activeServices: [],
      serviceHealth: {},
      overallHealth: "green",
    };

    onAdd(client);
    setAdded(true);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Client</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} weight="bold" />
          </button>
        </div>

        {added ? (
          <div className="modal-success">
            <CheckCircle size={36} weight="fill" color="var(--accent-green)" />
            <p className="modal-success-text">
              <strong>{name.trim()}</strong> has been added.
            </p>
            <button className="btn-secondary" onClick={onClose} style={{ marginTop: 16 }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="modal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="add-client-name">
                Client Name <span style={{ color: "var(--accent-red)" }}>*</span>
              </label>
              <input
                id="add-client-name"
                type="text"
                className={nameClass()}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="Acme Corp"
                autoFocus
              />
              {touched.name && errors.name && (
                <span className="form-error">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-client-google-id">
                Client Google ID <span style={{ color: "var(--accent-red)" }}>*</span>
              </label>
              <input
                id="add-client-google-id"
                type="text"
                className={googleIdClass()}
                value={googleId}
                onChange={(e) => setGoogleId(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, googleId: true }))}
                placeholder="123-456-7890"
              />
              {touched.googleId && errors.googleId && (
                <span className="form-error">{errors.googleId}</span>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Plus size={14} weight="bold" />
                Add Client
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
