"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Exam } from "@/types";

// Matches pricing page price map
const PRICE_MAP: Record<string, number> = {
  ican:       15000,
  "bar-finals": 15000,
  mdcn:       18000,
  coren:      12000,
  arcon:      12000,
  nmcn:       10000,
};

const FEATURES = [
  "Unlimited past questions with AI explanations",
  "3D flashcards organised by topic",
  "Timed mock exams with detailed analytics",
  "AI tutor available 24/7",
  "Progress tracking and weak-spot detection",
];

interface PaywallOverlayProps {
  exam: Exam;
}

export default function PaywallOverlay({ exam }: PaywallOverlayProps) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const price = PRICE_MAP[exam.id] ?? 10000;

  async function handleGetAccess() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: exam.id }),
      });

      const json = await res.json() as { authorization_url?: string; error?: string };

      if (!res.ok || !json.authorization_url) {
        setError(json.error ?? "Could not start payment. Try again.");
        setLoading(false);
        return;
      }

      window.location.href = json.authorization_url;
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 40,
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-surface-2)",
          border: "1px solid var(--border-cyan)",
          borderRadius: 16,
          padding: "2.5rem",
          maxWidth: 480,
          width: "100%",
        }}
      >
        {/* Exam header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "2.5rem" }}>{exam.icon}</span>
          <div>
            <h1
              className="font-heading"
              style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}
            >
              Unlock {exam.name}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{exam.field}</p>
          </div>
        </div>

        {/* Features */}
        <ul style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "1.75rem", listStyle: "none", padding: 0 }}>
          {FEATURES.map((feat) => (
            <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <CheckCircle size={15} style={{ color: "var(--accent-cyan)", flexShrink: 0, marginTop: 2 }} />
              <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{feat}</span>
            </li>
          ))}
        </ul>

        {/* Price */}
        <div style={{ marginBottom: "1.5rem" }}>
          <span
            className="font-heading"
            style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-cyan)" }}
          >
            ₦{price.toLocaleString()}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginLeft: "0.4rem" }}>
            / month
          </span>
        </div>

        {error && (
          <p style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "1rem" }}>{error}</p>
        )}

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          isLoading={loading}
          onClick={handleGetAccess}
          style={{ width: "100%", justifyContent: "center" }}
        >
          Get Access
        </Button>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link
            href="/dashboard"
            style={{ color: "var(--text-muted)", fontSize: "0.875rem", textDecoration: "none" }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
