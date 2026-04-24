"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { useState } from "react";

type Status = "idle" | "submitting" | "sent" | "error";

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setServerError(null);

    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;

    try {
      const res = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <div className="auth-split">
      <section className="auth-info-section">
        <div className="auth-info-content">
          <h1>TCMS Operations Dashboard</h1>
          <p>
            Internal client account health monitoring across all service lines.
          </p>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Reset password</h2>
            <p>
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>
          </div>

          {status === "sent" ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ marginBottom: 24, fontSize: 14, color: "var(--text-secondary)" }}>
                If that email is in our system, you&apos;ll receive a reset link
                shortly. Check your inbox.
              </p>
              <Link
                href="/login"
                className="btn-primary"
                style={{ justifyContent: "center" }}
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="you@company.com"
                  autoComplete="email"
                  autoFocus
                  required
                  onChange={() => setServerError(null)}
                />
              </div>

              {serverError && (
                <div className="form-server-error">{serverError}</div>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>
              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--accent-purple-hover)",
                  fontWeight: 500,
                  fontSize: 13,
                }}
              >
                <ArrowLeft size={14} weight="regular" />
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
