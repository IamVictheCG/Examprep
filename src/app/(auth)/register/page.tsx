"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import { signUp } from "@/lib/auth/actions";

// ─── Password strength ────────────────────────────────────────────────────────

function getStrength(pw: string): { label: string; score: 1 | 2 | 3; color: string } {
  if (pw.length === 0) return { label: "", score: 1, color: "#ef4444" };
  if (pw.length < 8)   return { label: "Weak",   score: 1, color: "#ef4444" };
  const checks = [/[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  const passed = checks.filter(Boolean).length;
  if (passed === 3)    return { label: "Strong", score: 3, color: "#22c55e" };
  if (passed >= 1)     return { label: "Fair",   score: 2, color: "#eab308" };
  return { label: "Weak", score: 1, color: "#ef4444" };
}

// ─── Validation ───────────────────────────────────────────────────────────────

type Errors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

function validate(fullName: string, email: string, password: string, confirm: string): Errors {
  const e: Errors = {};
  if (!fullName.trim())    e.fullName = "Full name is required";
  if (!email.trim())       e.email    = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address";
  if (!password)           e.password = "Password is required";
  else if (password.length < 8) e.password = "Password must be at least 8 characters";
  if (!confirm)            e.confirm  = "Please confirm your password";
  else if (confirm !== password) e.confirm = "Passwords do not match";
  return e;
}

// ─── Input field ──────────────────────────────────────────────────────────────

function Field({
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  right,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
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
      {error && <p style={{ color: "#ef4444", fontSize: "0.75rem" }}>{error}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showCp, setShowCp]       = useState(false);
  const [errors, setErrors]       = useState<Errors>({});
  const [loading, setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");

  const strength = getStrength(password);

  function validateField(field: keyof Errors) {
    const errs = validate(fullName, email, password, confirm);
    setErrors((prev) => ({ ...prev, [field]: errs[field] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(fullName, email, password, confirm);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setServerError("");

    const fd = new FormData();
    fd.append("fullName", fullName);
    fd.append("email", email);
    fd.append("password", password);

    const result = await signUp(fd);
    setLoading(false);

    if ("error" in result) {
      setServerError(result.error);
    } else {
      router.push("/verify-email");
    }
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
            <span className="font-heading" style={{ fontSize: "1.5rem", fontWeight: 800 }}>
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
          Create your account
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          Start preparing for your professional exam today
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <Field
            label="Full name"
            type="text"
            value={fullName}
            onChange={setFullName}
            onBlur={() => validateField("fullName")}
            error={errors.fullName}
            placeholder="Dr. Chukwuemeka Obi"
          />

          <Field
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            onBlur={() => validateField("email")}
            error={errors.email}
            placeholder="you@example.com"
          />

          {/* Password with strength indicator */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Field
              label="Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              onBlur={() => validateField("password")}
              error={errors.password}
              placeholder="Min. 8 characters"
              right={
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 0 }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* Strength bar */}
            {password.length > 0 && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.3rem",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", color: strength.color, fontWeight: 600 }}>
                    {strength.label}
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "var(--bg-surface)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    animate={{ width: `${(strength.score / 3) * 100}%` }}
                    transition={{ duration: 0.3 }}
                    style={{
                      height: "100%",
                      borderRadius: 2,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <Field
            label="Confirm password"
            type={showCp ? "text" : "password"}
            value={confirm}
            onChange={setConfirm}
            onBlur={() => validateField("confirm")}
            error={errors.confirm}
            placeholder="Repeat your password"
            right={
              <button
                type="button"
                onClick={() => setShowCp((s) => !s)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 0 }}
              >
                {showCp ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {serverError && (
            <p style={{ color: "#ef4444", fontSize: "0.8rem", textAlign: "center" }}>
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem" }}
          >
            Create Account
          </Button>
        </form>

        {/* Login link */}
        <p
          style={{
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            marginTop: "1.5rem",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 500 }}
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
