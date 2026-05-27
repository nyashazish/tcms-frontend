"use client";

import { useEffect, useState } from "react";
import { Eye, EyeSlash, CheckCircle } from "@phosphor-icons/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Stage = "loading" | "error" | "form" | "submitting" | "done";

function validate(password: string, confirm: string) {
  const errors: { password?: string; confirm?: string } = {};
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }
  if (!confirm) {
    errors.confirm = "Please confirm your password";
  } else if (password && confirm !== password) {
    errors.confirm = "Passwords do not match";
  }
  return errors;
}

export default function AcceptInvitePage() {
  const [stage, setStage] = useState<Stage>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = validate(password, confirm);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || !refreshToken || type !== "invite") {
      setErrorMsg("This invite link is invalid or has already been used.");
      setStage("error");
      return;
    }

    document.cookie = `tcms-access-token=${accessToken}; path=/; max-age=3600; SameSite=Lax`;
    document.cookie = `tcms-refresh-token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

    history.replaceState(null, "", window.location.pathname);
    setStage("form");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (Object.keys(errors).length > 0) return;

    setStage("submitting");
    setServerError(null);

    const accessToken = new URLSearchParams(window.location.hash.slice(1)).get("access_token");
    const refreshToken = new URLSearchParams(window.location.hash.slice(1)).get("refresh_token");

    if (!accessToken || !refreshToken) {
      setServerError("Session expired. Ask an admin to send a new invitation.");
      setStage("form");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || "Failed to set password. Please try again.");
        setStage("form");
        return;
      }

      setStage("done");
      setTimeout(() => {
        window.location.href = "/overview";
      }, 1800);
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setStage("form");
    }
  }

  return (
    <div className="auth-split">
      <section className="auth-info-section">
        <div className="auth-info-content">
          <h1>TCMS Operations Dashboard</h1>
          <p>
            Internal client account health monitoring across all service lines.
            Preemptively flag issues before clients notice them.
          </p>
        </div>
        <div className="auth-info-footer">
          <span className="text-muted" style={{ fontSize: 13 }}>
            © {new Date().getFullYear()} TCMS
          </span>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-card">
          {stage === "loading" && (
            <div className="auth-header">
              <h2>Verifying your invite…</h2>
              <p>Just a moment while we confirm your link.</p>
            </div>
          )}

          {stage === "error" && (
            <>
              <div className="auth-header">
                <h2>Invite link invalid</h2>
                <p>{errorMsg}</p>
              </div>
              <a
                href="/login"
                className="btn-primary"
                style={{ display: "flex", justifyContent: "center", textDecoration: "none", marginTop: 8 }}
              >
                Back to sign in
              </a>
            </>
          )}

          {(stage === "form" || stage === "submitting") && (
            <>
              <div className="auth-header">
                <h2>Set your password</h2>
                <p>Choose a password to complete your account setup.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    Password
                  </label>
                  <div className="input-with-icon">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className={
                        !touched.password
                          ? "form-input"
                          : errors.password
                          ? "form-input error"
                          : "form-input success"
                      }
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      autoFocus
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setServerError(null); }}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    />
                    <button
                      type="button"
                      className="input-icon"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <span className="form-error">{errors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirm">
                    Confirm password
                  </label>
                  <div className="input-with-icon">
                    <input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      className={
                        !touched.confirm
                          ? "form-input"
                          : errors.confirm
                          ? "form-input error"
                          : "form-input success"
                      }
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setServerError(null); }}
                      onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                    />
                    <button
                      type="button"
                      className="input-icon"
                      onClick={() => setShowConfirm((s) => !s)}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {touched.confirm && errors.confirm && (
                    <span className="form-error">{errors.confirm}</span>
                  )}
                </div>

                {serverError && (
                  <div className="form-server-error">{serverError}</div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                  disabled={stage === "submitting"}
                >
                  {stage === "submitting" ? "Setting password…" : "Set password & sign in"}
                </button>
              </form>
            </>
          )}

          {stage === "done" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <CheckCircle
                size={48}
                weight="fill"
                color="var(--accent-green)"
                style={{ marginBottom: 16 }}
              />
              <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>You&apos;re all set!</h2>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
                Taking you to the dashboard…
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}