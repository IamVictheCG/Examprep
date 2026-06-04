"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CheckCircle, XCircle } from "lucide-react";
import { EXAMS } from "@/lib/constants";
import { generateExplanation } from "@/lib/ai/explanations";
import { updateQuestionExplanation } from "@/lib/api/questions";

// ─── Design-system colours ────────────────────────────────────────────────────
const CYAN   = "#00e5ff";
const BORDER = "rgba(0,229,255,0.12)";

// MOCK DATA - replace with API call in Backend Phase 4
type Option   = { id: string; text: string };
type ReviewQ  = {
  id: string; text: string; topic: string;
  options: Option[]; correctId: string;
  userAnswer: string | null; flagged: boolean;
  explanation: string;
};
const MOCK_REVIEW: ReviewQ[] = [
  { id:"q1",topic:"Financial Accounting",text:"According to IFRS 15, revenue should be recognised when performance obligations are:",options:[{id:"a",text:"Promised"},{id:"b",text:"Satisfied"},{id:"c",text:"Invoiced"},{id:"d",text:"Contracted"}],correctId:"b",userAnswer:"b",flagged:false,explanation:"IFRS 15 requires recognition when (or as) an entity satisfies a performance obligation by transferring a promised good or service."},
  { id:"q2",topic:"Taxation",           text:"Under CITA, minimum tax for dormant companies is:",options:[{id:"a",text:"0%"},{id:"b",text:"0.5% of gross turnover"},{id:"c",text:"2% of net assets"},{id:"d",text:"30% of taxable profit"}],correctId:"b",userAnswer:"a",flagged:true, explanation:""},
  { id:"q3",topic:"Audit & Assurance",  text:"Which is NOT an element of audit risk?",options:[{id:"a",text:"Inherent risk"},{id:"b",text:"Control risk"},{id:"c",text:"Detection risk"},{id:"d",text:"Business risk"}],correctId:"d",userAnswer:"d",flagged:false,explanation:"Audit risk = Inherent × Control × Detection. Business risk is an entity-level concept, not a component of the audit risk model."},
  { id:"q4",topic:"Management Accounting",text:"Contribution margin ratio equals:",options:[{id:"a",text:"(Sales − Fixed) / Sales"},{id:"b",text:"(Sales − Variable) / Sales"},{id:"c",text:"Net Profit / Sales"},{id:"d",text:"Fixed / Sales"}],correctId:"b",userAnswer:"c",flagged:true, explanation:""},
  { id:"q5",topic:"Financial Accounting",text:"Impairment loss is recognised when carrying amount exceeds:",options:[{id:"a",text:"Net realisable value"},{id:"b",text:"Historical cost"},{id:"c",text:"Recoverable amount"},{id:"d",text:"Replacement cost"}],correctId:"c",userAnswer:"c",flagged:false,explanation:"Under IAS 36, recoverable amount = higher of (fair value less costs of disposal) and (value in use)."},
];
// ─────────────────────────────────────────────────────────────────────────────

type Filter = "all" | "correct" | "wrong" | "flagged";

export default function ReviewPage() {
  const { examId, sessionId } = useParams<{ examId: string; sessionId: string }>();
  const exam = EXAMS.find((e) => e.id === examId);
  const [filter, setFilter] = useState<Filter>("all");

  // Dynamic AI explanations state
  const [explanations,   setExplanations]   = useState<Record<string, string>>({});
  const [loadingExpl,    setLoadingExpl]     = useState<Record<string, boolean>>({});

  const correct = MOCK_REVIEW.filter((q) => q.userAnswer === q.correctId).length;
  const wrong   = MOCK_REVIEW.filter((q) => q.userAnswer !== q.correctId).length;
  const flagged = MOCK_REVIEW.filter((q) => q.flagged).length;

  const TABS: { id: Filter; label: string; count: number }[] = [
    { id: "all",     label: "All",     count: MOCK_REVIEW.length },
    { id: "correct", label: "Correct", count: correct },
    { id: "wrong",   label: "Wrong",   count: wrong   },
    { id: "flagged", label: "Flagged", count: flagged },
  ];

  const filtered = MOCK_REVIEW.filter((q) => {
    if (filter === "correct") return q.userAnswer === q.correctId;
    if (filter === "wrong")   return q.userAnswer !== q.correctId;
    if (filter === "flagged") return q.flagged;
    return true;
  });

  // Generate missing explanations for wrong answers
  useEffect(() => {
    const wrongWithoutExplanation = MOCK_REVIEW.filter(
      (q) => q.userAnswer !== q.correctId && !q.explanation.trim()
    );

    for (const q of wrongWithoutExplanation) {
      const userOpt    = q.options.find((o) => o.id === q.userAnswer);
      const correctOpt = q.options.find((o) => o.id === q.correctId);
      if (!userOpt || !correctOpt) continue;

      setLoadingExpl((prev) => ({ ...prev, [q.id]: true }));

      generateExplanation(q.text, userOpt.text, correctOpt.text, exam?.name ?? "this exam")
        .then((text) => {
          setExplanations((prev) => ({ ...prev, [q.id]: text }));
          // Save back to DB for future use
          updateQuestionExplanation(q.id, text).catch(console.error);
        })
        .catch(() => {
          setExplanations((prev) => ({
            ...prev,
            [q.id]: "Could not generate explanation at this time.",
          }));
        })
        .finally(() => {
          setLoadingExpl((prev) => ({ ...prev, [q.id]: false }));
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  void sessionId;

  return (
    <DashboardWrapper examId={examId} activePage="mock test">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Header */}
        <h1 className="font-heading" style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: "var(--text-primary)" }}>
          Review Answers
        </h1>

        {/* Summary bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: "0.75rem" }}>
          {[
            { label: "Score",   value: `${Math.round((correct / MOCK_REVIEW.length) * 100)}%`, color: CYAN       },
            { label: "Correct", value: correct, color: "#22c55e" },
            { label: "Wrong",   value: wrong,   color: "#ef4444" },
            { label: "Flagged", value: flagged, color: "#a78bfa" },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1rem", textAlign: "center" }}>
              <p className="font-heading" style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {TABS.map(({ id, label, count }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: 999,
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  border: active ? "none" : `1px solid ${BORDER}`,
                  backgroundColor: active ? CYAN : "transparent",
                  color: active ? "var(--bg-primary)" : "var(--text-muted)",
                  transition: "all 0.15s",
                }}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Question list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filtered.map((q, i) => {
            const isCorrect = q.userAnswer === q.correctId;
            return (
              <div
                key={q.id}
                style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}
              >
                {/* Question header */}
                <div style={{ padding: "1.25rem 1.25rem 0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <span
                      style={{
                        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                        backgroundColor: isCorrect ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        border: `1px solid ${isCorrect ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: 700,
                        color: isCorrect ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {i + 1}
                    </span>
                    <p style={{ color: "var(--text-primary)", fontSize: "0.9rem", lineHeight: 1.55, flex: 1 }}>
                      {q.text}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  {q.options.map((opt) => {
                    const userPicked   = q.userAnswer === opt.id;
                    const rightAnswer  = q.correctId  === opt.id;
                    const wrongPick    = userPicked && !rightAnswer;

                    let bg = "transparent", border = BORDER, color = "var(--text-muted)", Icon = null as React.ReactNode | null;

                    if (wrongPick) {
                      bg = "rgba(239,68,68,0.08)"; border = "rgba(239,68,68,0.3)"; color = "#ef4444";
                      Icon = <XCircle size={14} style={{ color: "#ef4444", flexShrink: 0 }} />;
                    } else if (rightAnswer) {
                      bg = "rgba(34,197,94,0.08)"; border = "rgba(34,197,94,0.3)"; color = "#22c55e";
                      Icon = <CheckCircle size={14} style={{ color: "#22c55e", flexShrink: 0 }} />;
                    }

                    return (
                      <div
                        key={opt.id}
                        style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.6rem 0.875rem", borderRadius: 8, backgroundColor: bg, border: `1px solid ${border}` }}
                      >
                        {Icon ?? <span style={{ width: 14, flexShrink: 0 }} />}
                        <span style={{ fontSize: "0.875rem", color }}>
                          <strong style={{ marginRight: "0.35rem" }}>{opt.id.toUpperCase()}.</strong>
                          {opt.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* AI Explanation (only on wrong answers) */}
                {!isCorrect && (
                  <div style={{ margin: "0 1.25rem 1.25rem", backgroundColor: "rgba(0,229,255,0.04)", borderLeft: `2px solid ${CYAN}`, padding: "1rem", borderRadius: "0 8px 8px 0" }}>
                    <p style={{ color: CYAN, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
                      AI Explanation
                    </p>
                    {loadingExpl[q.id] ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.65 }}>
                        {explanations[q.id] ?? q.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </DashboardWrapper>
  );
}
