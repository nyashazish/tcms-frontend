"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";

type FormValues = { email: string; password: string };
type FormErrors = Partial<FormValues>;

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.email) {
    e.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
    e.email = "Enter a valid email address";
  }
  if (!v.password) {
    e.password = "Password is required";
  }
  return e;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState<FormValues>({ email: "", password: "" });
  const [touched, setTouched] = useState<Record<keyof FormValues, boolean>>({
    email: false,
    password: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = validate(values);

  function inputClass(field: keyof FormValues) {
    if (!touched[field]) return "form-input";
    return errors[field] ? "form-input error" : "form-input success";
  }

  function handleChange(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (serverError) setServerError(null);
  }

  function handleBlur(field: keyof FormValues) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Read directly from the form so autofill values are captured reliably
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";
    const current = { email, password };

    setValues(current);
    setTouched({ email: true, password: true });

    if (Object.keys(validate(current)).length > 0) return;

    setIsLoading(true);
    setServerError(null);

    try {
      console.log("[login] POST /auth/login", { email });
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("[login] status:", res.status, "| final URL:", res.url);
      const contentType = res.headers.get("content-type") ?? "";
      console.log("[login] content-type:", contentType);

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("[login] non-JSON response — first 200 chars:", text.slice(0, 200));
        setServerError("Unexpected server response. Check the console.");
        return;
      }

      const data = await res.json();
      console.log("[login] response body:", data);

      if (res.ok) {
        // Full navigation so the proxy sees the new session cookie
        window.location.href = "/overview";
      } else {
        setServerError(data.message ?? "Sign in failed. Please try again.");
      }
    } catch (err) {
      console.error("[login] fetch error:", err);
      setServerError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
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

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={inputClass("email")}
                placeholder="you@company.com"
                autoComplete="email"
                value={values.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
              />
              {touched.email && errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-with-icon">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={inputClass("password")}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={values.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
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
              {touched.password && errors.password && (
                <span className="form-error">{errors.password}</span>
              )}
            </div>

            {serverError && (
              <div className="form-server-error">{serverError}</div>
            )}

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
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : "Sign in"}
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
