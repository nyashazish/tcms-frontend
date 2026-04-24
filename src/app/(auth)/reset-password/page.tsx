"use client";

import { useEffect, useState } from "react";
import { Eye, EyeSlash, CheckCircle } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

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

export default function ResetPasswordPage() {
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

    if (!accessToken || !refreshToken || type !== "recovery") {
      setErrorMsg("This password reset link is invalid or has already been used.");
      setStage("error");
      return;
    }

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          setErrorMsg("This reset link has expired. Request a new one from the sign-in page.");
          setStage("error");
        } else {
          history.replaceState(null, "", window.location.pathname);
          setStage("form");
        }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (Object.keys(errors).length > 0) return;

    setStage("submitting");
    setServerError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setServerError(error.message ?? "Failed to update password. Please try again.");
      setStage("form");
      return;
    }

    setStage("done");
    setTimeout(() => {
      window.location.href = "/overview";
    }, 1800);
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

          {/* Loading */}
          {stage === "loading" && (
            <div className="auth-header">
              <h2>Verifying reset link…</h2>
              <p>Just a moment while we confirm your link.</p>
            </div>
          )}

          {/* Error */}
          {stage === "error" && (
            <>
              <div className="auth-header">
                <h2>Link invalid or expired</h2>
                <p>{errorMsg}</p>
              </div>
              <a
                href="/forgot-password"
                className="btn-primary"
                style={{ display: "flex", justifyContent: "center", textDecoration: "none", marginTop: 8 }}
              >
                Request a new link
              </a>
            </>
          )}

          {/* Password form */}
          {(stage === "form" || stage === "submitting") && (
            <>
              <div className="auth-header">
                <h2>Choose a new password</h2>
                <p>Enter your new password below to complete the reset.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    New password
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
                    Confirm new password
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
                  {stage === "submitting" ? "Updating password…" : "Set new password"}
                </button>
              </form>
            </>
          )}

          {/* Success */}
          {stage === "done" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <CheckCircle
                size={48}
                weight="fill"
                color="var(--accent-green)"
                style={{ marginBottom: 16 }}
              />
              <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Password updated!</h2>
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
