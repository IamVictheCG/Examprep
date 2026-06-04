"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import Button from "@/components/ui/Button";
import { EXAMS } from "@/lib/constants";

// ─── Design-system colours ────────────────────────────────────────────────────
const CYAN   = "#00e5ff";
const BORDER = "rgba(0,229,255,0.12)";

// MOCK DATA - replace with API call in Backend Phase 4
const MOCK_TOPICS = ["Financial Accounting", "Management Accounting", "Audit & Assurance", "Taxation"];
const MOCK_CARDS = [
  {
    front: "What is the purpose of IFRS 15?",
    back: "To establish principles for reporting useful information about revenue.",
    explanation: "IFRS 15 provides a single, comprehensive model for recognising revenue from contracts with customers, replacing IAS 18 and IAS 11.",
  },
  {
    front: "Define 'going concern' in accounting.",
    back: "The assumption that an entity will continue to operate for the foreseeable future.",
    explanation: "It underpins the preparation of financial statements under the accruals basis. If it doesn't apply, assets are valued at liquidation amounts.",
  },
  {
    front: "What is the difference between capital and revenue expenditure?",
    back: "Capital expenditure provides long-term benefit (asset); revenue expenditure benefits the current period (expense).",
    explanation: "Misclassifying can overstate profits (expensing capex) or understate them (capitalising opex), affecting the income statement and balance sheet.",
  },
  {
    front: "State the accounting equation.",
    back: "Assets = Liabilities + Equity",
    explanation: "This fundamental equation ensures the balance sheet always balances and reflects the dual entry principle: every debit has a corresponding credit.",
  },
  {
    front: "What is depreciation?",
    back: "The systematic allocation of a tangible asset's cost over its useful life.",
    explanation: "IAS 16 requires depreciation to be recognised in profit or loss. Common methods are straight-line, reducing balance, and units-of-production.",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

type CardState = { got: Set<number>; review: Set<number> };

export default function FlashcardsPage() {
  const { examId } = useParams<{ examId: string }>();
  const exam = EXAMS.find((e) => e.id === examId);

  const [topic,   setTopic]   = useState(MOCK_TOPICS[0]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [state,   setState]   = useState<CardState>({ got: new Set(), review: new Set() });
  const [done,    setDone]    = useState(false);

  const card  = MOCK_CARDS[current];
  const total = MOCK_CARDS.length;

  function respond(type: "got" | "review") {
    setState((prev) => {
      const next = { got: new Set(prev.got), review: new Set(prev.review) };
      next[type].add(current);
      return next;
    });
    setFlipped(false);
    if (current + 1 >= total) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
    }
  }

  function restart() {
    setCurrent(0);
    setFlipped(false);
    setState({ got: new Set(), review: new Set() });
    setDone(false);
  }

  const progress = Math.round(((state.got.size + state.review.size) / total) * 100);

  return (
    <DashboardWrapper examId={examId} activePage="flashcards">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>

        {/* Header */}
        <div style={{ width: "100%", textAlign: "left" }}>
          <h1 className="font-heading" style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            Flashcards
          </h1>
          {exam && <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{exam.name}</p>}
        </div>

        {/* Topic tabs */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", width: "100%" }}>
          {MOCK_TOPICS.map((t) => {
            const active = t === topic;
            return (
              <button
                key={t}
                onClick={() => { setTopic(t); restart(); }}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: 999,
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  border: active ? "none" : `1px solid ${BORDER}`,
                  backgroundColor: active ? CYAN : "transparent",
                  color: active ? "var(--bg-primary)" : "var(--text-muted)",
                  transition: "background-color 0.15s, color 0.15s",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Card */}
        <div
          style={{ width: "100%", maxWidth: 640, perspective: "1000px", cursor: "pointer" }}
          onClick={() => setFlipped((f) => !f)}
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d", position: "relative", minHeight: 300 }}
          >
            {/* Front */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                backgroundColor: "var(--bg-surface-2)",
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2.5rem",
                textAlign: "center",
                gap: "0.75rem",
                minHeight: 300,
              }}
            >
              <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Question
              </p>
              <p className="font-heading" style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.5 }}>
                {card.front}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                Tap to reveal answer
              </p>
            </div>

            {/* Back */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                backgroundColor: "var(--bg-surface-2)",
                border: `1px solid ${CYAN}`,
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2.5rem",
                textAlign: "center",
                gap: "1rem",
                minHeight: 300,
              }}
            >
              <p style={{ color: CYAN, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Answer
              </p>
              <p className="font-heading" style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 700, lineHeight: 1.55 }}>
                {card.back}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.6, maxWidth: 460 }}>
                {card.explanation}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%", maxWidth: 640 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Card {current + 1} of {total}</span>
            <span style={{ color: CYAN, fontSize: "0.8rem", fontWeight: 600 }}>{progress}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, backgroundColor: "rgba(0,229,255,0.1)", overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: "100%", borderRadius: 2, backgroundColor: CYAN }}
            />
          </div>
        </div>

        {/* Response buttons */}
        <div style={{ display: "flex", gap: "1rem", width: "100%", maxWidth: 640, justifyContent: "center" }}>
          <button
            onClick={() => respond("review")}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: 10,
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#ef4444",
              transition: "background-color 0.15s",
            }}
          >
            Review Again
          </button>
          <button
            onClick={() => respond("got")}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: 10,
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.4)",
              color: "#22c55e",
              transition: "background-color 0.15s",
            }}
          >
            Got It ✓
          </button>
        </div>

        {/* Session complete modal */}
        <AnimatePresence>
          {done && (
            <motion.div
              key="summary-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(3,5,15,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
                padding: "1rem",
              }}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                style={{
                  backgroundColor: "var(--bg-surface-2)",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 20,
                  padding: "2.5rem",
                  maxWidth: 440,
                  width: "100%",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <h2 className="font-heading" style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  Session Complete! 🎉
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "1rem" }}>
                    <p className="font-heading" style={{ fontSize: "1.75rem", fontWeight: 800, color: "#22c55e" }}>{state.got.size}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Got It</p>
                  </div>
                  <div style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "1rem" }}>
                    <p className="font-heading" style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ef4444" }}>{state.review.size}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Review Again</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <Button variant="ghost" onClick={restart} style={{ flex: 1, justifyContent: "center" }}>
                    Retry
                  </Button>
                  <Button variant="primary" style={{ flex: 1, justifyContent: "center" }}>
                    Finish
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardWrapper>
  );
}
