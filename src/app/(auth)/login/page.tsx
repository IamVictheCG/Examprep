"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import { signIn } from "@/lib/auth/actions";

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};
  if (!email.trim()) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  else if (password.length < 8) errors.password = "Password must be at least 8 characters";
  return errors;
}

// ─── Input field ──────────────────────────────────────────────────────────────

function Field({
  label,
  type,
  value,
  onChange,
  error,
  placeholder,
  right,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label
        style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)" }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            backgroundColor: "var(--bg-surface)",
            border: `1px solid ${error ? "#ef4444" : "var(--border-cyan)"}`,
            color: "var(--text-primary)",
            borderRadius: 8,
            padding: right ? "0.75rem 2.75rem 0.75rem 1rem" : "0.75rem 1rem",
            fontSize: "0.9rem",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.borderColor = "var(--accent-cyan)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "#ef4444" : "var(--border-cyan)";
          }}
        />
        {right && (
          <div
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {right}
          </div>
        )}
      </div>
      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.75rem" }}>{error}</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPw, setShowPw]           = useState(false);
  const [remember, setRemember]       = useState(false);
  const [errors, setErrors]           = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setServerError("");

    const fd = new FormData();
    fd.append("email", email);
    fd.append("password", password);

    const result = await signIn(fd);
    // Only reached if signIn returned an error (redirect was not triggered)
    setLoading(false);
    if (result?.error) setServerError(result.error);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "2rem 1rem",
      }}
    >
      <div aria-hidden="true" className="grid-bg" />
      <div aria-hidden="true" className="glow-orb" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          maxWidth: 440,
          width: "100%",
          backgroundColor: "var(--bg-surface-2)",
          border: "1px solid var(--border-cyan)",
          borderRadius: 16,
          padding: "2.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span
              className="font-heading"
              style={{ fontSize: "1.5rem", fontWeight: 800 }}
            >
              <span style={{ color: "var(--text-primary)" }}>Prep</span>
              <span style={{ color: "var(--accent-cyan)" }}>AI</span>
            </span>
          </Link>
        </div>

        {/* Heading */}
        <h1
          className="font-heading"
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "0.4rem",
            textAlign: "center",
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          Continue your exam prep journey
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <Field
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            placeholder="you@example.com"
          />

          <Field
            label="Password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={setPassword}
            error={errors.password}
            placeholder="Min. 8 characters"
            right={
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {/* Remember me */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
            }}
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ accentColor: "var(--accent-cyan)", width: 14, height: 14 }}
            />
            Remember me
          </label>

          {serverError && (
            <p style={{ color: "#ef4444", fontSize: "0.8rem", textAlign: "center" }}>
              {serverError}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem" }}
          >
            Sign In
          </Button>
        </form>

        {/* Forgot password */}
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link
            href="/forgot-password"
            style={{
              color: "var(--accent-cyan)",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            Forgot your password?
          </Link>
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            margin: "1.5rem 0",
          }}
        >
          <div style={{ flex: 1, height: 1, backgroundColor: "var(--border-cyan)" }} />
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
            or continue with
          </span>
          <div style={{ flex: 1, height: 1, backgroundColor: "var(--border-cyan)" }} />
        </div>

        {/* Google button */}
        <Button
          type="button"
          variant="ghost"
          size="lg"
          style={{ width: "100%", justifyContent: "center", gap: "0.6rem" }}
          onClick={() => console.log("Google OAuth")}
        >
          <GoogleIcon />
          Continue with Google
        </Button>

        {/* Register link */}
        <p
          style={{
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            marginTop: "1.5rem",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 500 }}
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Google icon SVG ──────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
