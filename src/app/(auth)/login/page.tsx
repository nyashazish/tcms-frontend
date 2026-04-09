"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

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
          <div className="auth-info-links">
            <a href="#" className="text-muted" style={{ fontSize: 13 }}>
              Privacy
            </a>
            <a href="#" className="text-muted" style={{ fontSize: 13 }}>
              Terms
            </a>
          </div>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Sign in</h2>
            <p>Enter your credentials to access the dashboard.</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-with-icon">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-icon"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlash size={18} weight="regular" />
                  ) : (
                    <Eye size={18} weight="regular" />
                  )}
                </button>
              </div>
            </div>

            <div className="auth-form-links">
              <div className="checkbox-group">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Sign in
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don&apos;t have an account?{" "}
              <a href="mailto:admin@tcms.local">Contact your admin</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
