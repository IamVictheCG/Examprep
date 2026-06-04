"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { EXAMS } from "@/lib/constants";
import type { Exam } from "@/types";

// ─── Data ─────────────────────────────────────────────────────────────────────

const LIVE_EXAMS = EXAMS.filter((e) => e.status === "live");

const PRICES: Record<string, string> = {
  ican: "₦15,000",
  "bar-finals": "₦15,000",
  mdcn: "₦18,000",
  coren: "₦12,000",
  arcon: "₦12,000",
  nmcn: "₦10,000",
};

const FEATURES = [
  "Full question bank access",
  "Unlimited mock tests",
  "AI-powered flashcards",
  "Instant explanations",
  "Progress analytics",
  "AI Tutor chat",
];

const FAQS = [
  {
    q: "Can I subscribe to multiple exams?",
    a: "Yes. Subscriptions are per exam — subscribe to as many as you need. Your dashboard tracks progress across all active plans separately.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes, new accounts get a 3-day free trial on any single exam plan. No credit card required to start.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel any subscription at any time. You retain full access until the end of the current billing period.",
  },
  {
    q: "How often is content updated?",
    a: "Our question bank is reviewed continuously as new past questions are released and as exam bodies update their syllabuses.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept Visa, Mastercard, and Verve debit cards via Paystack. Bank transfer options are on the way.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  return (
    <PageWrapper>
      <div className="section-container" style={{ padding: "5rem 2rem 6rem" }}>

        {/* Hero */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{ textAlign: "center", marginBottom: "4rem" }}
        >
          <motion.p
            variants={fadeUp}
            style={{
              color: "var(--accent-cyan)",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Pricing
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="font-heading"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              marginBottom: "1rem",
            }}
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p
            variants={fadeUp}
            style={{
              color: "var(--text-muted)",
              fontSize: "1rem",
              lineHeight: 1.7,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            One flat monthly price per exam. No hidden fees. Cancel anytime.
          </motion.p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
            marginBottom: "4rem",
          }}
        >
          {LIVE_EXAMS.map((exam) => (
            <PricingCard key={exam.id} exam={exam} price={PRICES[exam.id] ?? "₦12,000"} />
          ))}
        </motion.div>

        {/* Team / bundle section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px 0px" }}
          transition={{ duration: 0.55 }}
          style={{
            backgroundColor: "var(--bg-surface-2)",
            border: "1px solid rgba(123,47,255,0.2)",
            borderRadius: 16,
            padding: "2.5rem",
            marginBottom: "5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.25rem",
          }}
        >
          <Badge variant="coming-soon">Coming Soon</Badge>

          <h2
            className="font-heading"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            Team and Institution Plans
          </h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 480, lineHeight: 1.7, fontSize: "0.95rem" }}>
            For schools, tutors, and study groups. Get bulk access across all exams.
          </p>

          {waitlistJoined ? (
            <p style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>
              ✓ You&apos;re on the waitlist — we&apos;ll reach out soon!
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
                justifyContent: "center",
                width: "100%",
                maxWidth: 460,
              }}
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 200,
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-cyan)",
                  color: "var(--text-primary)",
                  borderRadius: 8,
                  padding: "0.75rem 1rem",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-cyan)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-cyan)")}
              />
              <Button
                variant="outline"
                onClick={() => { if (waitlistEmail.trim()) setWaitlistJoined(true); }}
              >
                Notify Me
              </Button>
            </div>
          )}
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px 0px" }}
          transition={{ duration: 0.55 }}
          style={{ maxWidth: 680, margin: "0 auto" }}
        >
          <h2
            className="font-heading"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            Frequently asked questions
          </h2>

          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid var(--border-cyan)" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "1.25rem 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  textAlign: "left",
                  gap: "1rem",
                }}
              >
                <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>{faq.q}</span>
                <motion.div
                  animate={{ rotate: openFaq === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ flexShrink: 0 }}
                >
                  <ChevronDown size={18} style={{ color: "var(--text-muted)" }} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                        lineHeight: 1.7,
                        padding: "0 0 1.25rem",
                      }}
                    >
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

      </div>
    </PageWrapper>
  );
}

// ─── PricingCard ──────────────────────────────────────────────────────────────

function PricingCard({ exam, price }: { exam: Exam; price: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: `1px solid ${hovered ? "var(--border-cyan-hover)" : "var(--border-cyan)"}`,
        borderRadius: 12,
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "border-color 0.2s ease, transform 0.2s ease",
      }}
    >
      {/* Icon + name */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
        <span style={{ fontSize: "1.75rem" }}>{exam.icon}</span>
        <div>
          <p
            className="font-heading"
            style={{ color: "var(--text-primary)", fontWeight: 700, lineHeight: 1.2 }}
          >
            {exam.name}
          </p>
          <div style={{ marginTop: "0.3rem" }}>
            <Badge variant="live">{exam.field}</Badge>
          </div>
        </div>
      </div>

      {/* Price */}
      <div>
        <span
          className="font-heading"
          style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-cyan)", lineHeight: 1 }}
        >
          {price}
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginLeft: "0.35rem" }}>
          /month
        </span>
      </div>

      {/* Features */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          flex: 1,
        }}
      >
        {FEATURES.map((feat) => (
          <li key={feat} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Check size={14} style={{ color: "var(--accent-cyan)", flexShrink: 0 }} />
            <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link href={`/register?exam=${exam.id}`} style={{ textDecoration: "none" }}>
        <Button variant="outline" style={{ width: "100%", justifyContent: "center" }}>
          Get Access
        </Button>
      </Link>
    </motion.div>
  );
}
