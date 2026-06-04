"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { resetPassword } from "@/lib/auth/actions";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);

    const result = await resetPassword(email.trim());
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
    } else {
      setSubmitted(true);
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
        {/* Back link */}
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            textDecoration: "none",
            marginBottom: "1.75rem",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft size={15} />
          Back to login
        </Link>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span className="font-heading" style={{ fontSize: "1.5rem", fontWeight: 800 }}>
              <span style={{ color: "var(--text-primary)" }}>Prep</span>
              <span style={{ color: "var(--accent-cyan)" }}>AI</span>
            </span>
          </Link>
        </div>

        {/* Form / success switcher */}
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.25 }}
            >
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
                Reset your password
              </h1>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  textAlign: "center",
                  marginBottom: "2rem",
                  lineHeight: 1.6,
                }}
              >
                Enter your email and we&apos;ll send you a reset link
              </p>

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
              >
                {/* Email */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label
                    style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)" }}
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    placeholder="you@example.com"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    style={{
                      width: "100%",
                      backgroundColor: "var(--bg-surface)",
                      border: `1px solid ${error ? "#ef4444" : "var(--border-cyan)"}`,
                      color: "var(--text-primary)",
                      borderRadius: 8,
                      padding: "0.75rem 1rem",
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
                  {error && (
                    <p style={{ color: "#ef4444", fontSize: "0.75rem" }}>{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Send Reset Link
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "1rem",
              }}
            >
              <CheckCircle size={52} style={{ color: "var(--accent-cyan)" }} />
              <h2
                className="font-heading"
                style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}
              >
                Check your email
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                We sent a reset link to{" "}
                <strong style={{ color: "var(--text-primary)" }}>{email}</strong>.
                Check your inbox and follow the instructions.
              </p>
              <Link
                href="/login"
                style={{
                  color: "var(--accent-cyan)",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  fontWeight: 500,
                  marginTop: "0.5rem",
                }}
              >
                Back to login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
