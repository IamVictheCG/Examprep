"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { EXAMS } from "@/lib/constants";
import type { Exam } from "@/types";

// ─── Types & data ─────────────────────────────────────────────────────────────

type Filter = "all" | "live" | "coming_soon";

const FILTER_TABS: { id: Filter; label: string }[] = [
  { id: "all",         label: "All" },
  { id: "live",        label: "Live" },
  { id: "coming_soon", label: "Coming Soon" },
];

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: "easeOut" as const, delay: i * 0.055 },
  }),
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExamsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = EXAMS.filter(
    (e) => filter === "all" || e.status === filter
  );

  const countFor = (id: Filter) =>
    id === "all" ? EXAMS.length : EXAMS.filter((e) => e.status === id).length;

  return (
    <PageWrapper>
      <div className="section-container" style={{ padding: "5rem 2rem 6rem" }}>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          <p
            style={{
              color: "var(--accent-cyan)",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Exam Library
          </p>
          <h1
            className="font-heading"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              marginBottom: "0.875rem",
            }}
          >
            All Exams
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1rem",
              lineHeight: 1.7,
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            AI-powered preparation for every major Nigerian professional licensing exam.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
          }}
        >
          {FILTER_TABS.map(({ id, label }) => {
            const isActive = filter === id;
            return (
              <motion.button
                key={id}
                layout
                onClick={() => setFilter(id)}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: 999,
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  border: isActive ? "none" : "1px solid var(--border-cyan)",
                  backgroundColor: isActive ? "var(--accent-cyan)" : "transparent",
                  color: isActive ? "var(--bg-primary)" : "var(--text-muted)",
                  transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
                }}
              >
                {label}{" "}
                <span style={{ opacity: 0.65, fontSize: "0.75rem" }}>({countFor(id)})</span>
              </motion.button>
            );
          })}
        </div>

        {/* Cards grid — re-animates on filter change via key */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {filtered.map((exam, i) => (
              <ExamCard key={exam.id} exam={exam} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
    </PageWrapper>
  );
}

// ─── ExamCard ─────────────────────────────────────────────────────────────────

function ExamCard({ exam, index }: { exam: Exam; index: number }) {
  const isLive = exam.status === "live";
  const [hovered, setHovered] = useState(false);

  const card = (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      onMouseEnter={() => { if (isLive) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: `1px solid ${hovered ? "var(--border-cyan-hover)" : "var(--border-cyan)"}`,
        borderRadius: 12,
        padding: "1.5rem",
        opacity: isLive ? 1 : 0.6,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "border-color 0.2s ease, transform 0.2s ease",
        cursor: isLive ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "100%",
      }}
    >
      {/* Icon box */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          backgroundColor: "rgba(0,229,255,0.08)",
          border: "1px solid rgba(0,229,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          flexShrink: 0,
        }}
      >
        {exam.icon}
      </div>

      {/* Name + field */}
      <div>
        <p
          className="font-heading"
          style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "0.25rem" }}
        >
          {exam.name}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{exam.field}</p>
      </div>

      {/* Status badge */}
      <div>
        <Badge variant={isLive ? "live" : "coming-soon"}>
          {isLive ? "Live" : "Coming Soon"}
        </Badge>
      </div>

      {/* CTA */}
      <div style={{ marginTop: "auto" }}>
        {isLive ? (
          <Button variant="outline" style={{ width: "100%", justifyContent: "center" }}>
            Start Studying
          </Button>
        ) : (
          <Button variant="ghost" disabled style={{ width: "100%", justifyContent: "center" }}>
            Notify Me
          </Button>
        )}
      </div>
    </motion.div>
  );

  if (isLive) {
    return (
      <Link href={`/exam/${exam.id}`} style={{ textDecoration: "none", display: "flex" }}>
        {card}
      </Link>
    );
  }

  return card;
}
