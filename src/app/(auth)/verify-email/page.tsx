"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleResend() {
    console.log("Resend verification email");
    setCountdown(60);
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "1.25rem",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span className="font-heading" style={{ fontSize: "1.5rem", fontWeight: 800 }}>
            <span style={{ color: "var(--text-primary)" }}>Prep</span>
            <span style={{ color: "var(--accent-cyan)" }}>AI</span>
          </span>
        </Link>

        {/* Mail icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "rgba(0,229,255,0.08)",
            border: "1px solid rgba(0,229,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "0.5rem",
          }}
        >
          <Mail size={32} style={{ color: "var(--accent-cyan)" }} />
        </div>

        {/* Heading */}
        <h1
          className="font-heading"
          style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)" }}
        >
          Verify your email
        </h1>

        {/* Subtext */}
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            lineHeight: 1.65,
            maxWidth: 340,
          }}
        >
          We sent a verification link to your email address. Click the link to activate your account.
        </p>

        {/* Resend with countdown */}
        <div style={{ marginTop: "0.5rem" }}>
          {countdown > 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Resend email{" "}
              <span
                style={{
                  display: "inline-block",
                  minWidth: "2.5ch",
                  color: "var(--accent-cyan)",
                  fontWeight: 600,
                }}
              >
                ({countdown}s)
              </span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-cyan)",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Resend email
            </button>
          )}
        </div>

        {/* Back to login */}
        <Link
          href="/login"
          style={{
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            textDecoration: "none",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          ← Back to login
        </Link>
      </motion.div>
    </div>
  );
}
