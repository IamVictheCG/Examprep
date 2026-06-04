"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { EXAMS } from "@/lib/constants";
import { Flag, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { getRandomQuestions } from "@/lib/api/questions";
import { createSession, completeSession } from "@/lib/api/mock-tests";

// ─── Design-system colours ────────────────────────────────────────────────────
const CYAN   = "#00e5ff";
const PURPLE = "#7b2fff";
const BORDER = "rgba(0,229,255,0.12)";

// ─── Local question type ──────────────────────────────────────────────────────
type Option   = { id: string; text: string };
type Question = { id: string; text: string; options: Option[]; correctId: string; topic: string };

function normalizeQuestion(dbQ: {
  id: string;
  question_text: string;
  options: Option[] | null;
  correct_option_id: string | null;
  topic?: { name: string } | null;
}): Question {
  return {
    id:        dbQ.id,
    text:      dbQ.question_text,
    options:   dbQ.options ?? [],
    correctId: dbQ.correct_option_id ?? "",
    topic:     (dbQ.topic as { name: string } | null)?.name ?? "General",
  };
}

const TIME_LIMIT = 90 * 60;

type Screen = "pretest" | "inprogress" | "results";

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmt(s: number) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

export default function MockTestPage() {
  const { examId } = useParams<{ examId: string }>();
  const exam = EXAMS.find((e) => e.id === examId);

  const { user } = useUser();

  const [questions,  setQuestions]  = useState<Question[]>([]);
  const [screen,     setScreen]     = useState<Screen>("pretest");
  const [current,    setCurrent]    = useState(0);
  const [answers,    setAnswers]    = useState<Record<string, string>>({});
  const [flagged,    setFlagged]    = useState<Set<string>>(new Set());
  const [timeLeft,   setTimeLeft]   = useState(TIME_LIMIT);
  const [confirm,    setConfirm]    = useState(false);
  const timerRef                    = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef                = useRef<string | null>(null);
  const startTimeRef                = useRef<number>(0);
  // Mirror of answers state kept in a ref so handleSubmit always reads the
  // latest value even when called from a stale useEffect closure.
  const answersRef                  = useRef<Record<string, string>>({});

  // Load random questions on mount
  useEffect(() => {
    getRandomQuestions(examId, 10)
      .then((qs) => setQuestions(qs.map(normalizeQuestion)))
      .catch(console.error);
  }, [examId]);

  useEffect(() => {
    if (screen !== "inprogress") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [screen]);

  function handleSubmit() {
    clearInterval(timerRef.current!);
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (sessionIdRef.current) {
      completeSession(sessionIdRef.current, answersRef.current, duration).catch(console.error);
    }
    setScreen("results");
    setConfirm(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (timeLeft === 0 && screen === "inprogress") handleSubmit();
  }, [timeLeft, screen]);

  async function startTest() {
    if (!user || questions.length === 0) {
      setScreen("inprogress");
      return;
    }
    startTimeRef.current = Date.now();
    try {
      const id = await createSession(user.id, examId, questions.map((q) => q.id));
      sessionIdRef.current = id;
    } catch {
      // Continue without a session ID — test still works locally
    }
    setScreen("inprogress");
  }

  function handleAnswer(questionId: string, optionId: string) {
    const updated = { ...answersRef.current, [questionId]: optionId };
    answersRef.current = updated;
    setAnswers(updated);
  }

  function toggleFlag(id: string) {
    setFlagged((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  const TOTAL_Q    = questions.length;
  const score      = questions.filter((q) => answers[q.id] === q.correctId).length;
  const pct        = TOTAL_Q > 0 ? Math.round((score / TOTAL_Q) * 100) : 0;
  const timeTaken  = TIME_LIMIT - timeLeft;
  const wrong      = TOTAL_Q - score;
  const r          = 54;
  const circ       = 2 * Math.PI * r;
  const dashOffset = circ - (pct / 100) * circ;

  const topicBreakdown = Array.from(new Set(questions.map((q) => q.topic))).map((t) => {
    const qs      = questions.filter((q) => q.topic === t);
    const correct = qs.filter((q) => answers[q.id] === q.correctId).length;
    return { topic: t, score: qs.length > 0 ? Math.round((correct / qs.length) * 100) : 0 };
  });

  const qn = questions[current];

  return (
    <DashboardWrapper examId={examId} activePage="mock test">
      {screen === "pretest" && (
        <PreTestScreen exam={exam} total={TOTAL_Q || 10} onStart={startTest} />
      )}

      {screen === "inprogress" && qn && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Top bar */}
          <div style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "0.875rem 1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Question {current + 1} of {TOTAL_Q}
              </span>
              <span
                className="font-heading"
                style={{ fontSize: "1.1rem", fontWeight: 700, color: timeLeft < 300 ? "#ef4444" : CYAN }}
              >
                ⏱ {fmt(timeLeft)}
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 2, backgroundColor: "rgba(0,229,255,0.1)", overflow: "hidden" }}>
              <div style={{ width: `${((current) / TOTAL_Q) * 100}%`, height: "100%", backgroundColor: CYAN, borderRadius: 2, transition: "width 0.3s" }} />
            </div>
          </div>

          {/* Question */}
          <div style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.5rem" }}>
            <p className="font-heading" style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 600, lineHeight: 1.6, marginBottom: "1.25rem" }}>
              {current + 1}. {qn.text}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {qn.options.map((opt) => {
                const selected = answers[qn.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(qn.id, opt.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.875rem 1rem",
                      borderRadius: 10,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                      backgroundColor: selected ? "rgba(0,229,255,0.08)" : "var(--bg-surface-2)",
                      border: `1px solid ${selected ? CYAN : BORDER}`,
                      color: selected ? CYAN : "var(--text-muted)",
                      width: "100%",
                    }}
                  >
                    <span style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${selected ? CYAN : BORDER}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                      {opt.id.toUpperCase()}
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Button variant="ghost" size="sm" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
              <ChevronLeft size={16} /> Prev
            </Button>
            <button
              onClick={() => toggleFlag(qn.id)}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                background: "none", border: `1px solid ${flagged.has(qn.id) ? PURPLE : BORDER}`,
                color: flagged.has(qn.id) ? PURPLE : "var(--text-muted)",
                borderRadius: 8, padding: "0.4rem 0.75rem", fontSize: "0.8rem", cursor: "pointer",
              }}
            >
              <Flag size={13} /> {flagged.has(qn.id) ? "Flagged" : "Flag"}
            </button>
            <div style={{ flex: 1 }} />
            {current < TOTAL_Q - 1 ? (
              <Button variant="outline" size="sm" onClick={() => setCurrent((c) => c + 1)}>
                Next <ChevronRight size={16} />
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setConfirm(true)}>
                Submit
              </Button>
            )}
          </div>

          {/* Question navigator */}
          <div style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.25rem" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
              Questions
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {questions.map((q, i) => {
                const isAnswered = !!answers[q.id];
                const isFlagged  = flagged.has(q.id);
                const isCurrent  = i === current;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrent(i)}
                    style={{
                      width: 32, height: 32,
                      borderRadius: "50%",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isCurrent ? `2px solid ${CYAN}` : "none",
                      backgroundColor: isFlagged ? PURPLE : isAnswered ? CYAN : "var(--bg-surface-2)",
                      color: (isFlagged || isAnswered) ? "#fff" : "var(--text-muted)",
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem" }}>
              {[
                { label: "Answered",  color: CYAN,   bg: CYAN   },
                { label: "Flagged",   color: "#fff",  bg: PURPLE },
                { label: "Unanswered",color: "var(--text-muted)", bg: "var(--bg-surface-2)"},
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: l.bg, display: "inline-block" }} />
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{l.label}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1rem" }}>
              <Button variant="primary" size="sm" onClick={() => setConfirm(true)}>
                Submit Test
              </Button>
            </div>
          </div>

          {/* Confirm modal */}
          <AnimatePresence>
            {confirm && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: "fixed", inset: 0, backgroundColor: "rgba(3,5,15,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
              >
                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.92, opacity: 0 }}
                  style={{ backgroundColor: "var(--bg-surface-2)", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "2rem", maxWidth: 400, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  <AlertCircle size={40} style={{ color: "#eab308", margin: "0 auto" }} />
                  <h2 className="font-heading" style={{ color: "var(--text-primary)", fontWeight: 800 }}>Submit Test?</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    You have answered {Object.keys(answers).length} of {TOTAL_Q} questions.
                    {flagged.size > 0 && ` ${flagged.size} flagged for review.`}
                  </p>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <Button variant="ghost" onClick={() => setConfirm(false)} style={{ flex: 1, justifyContent: "center" }}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit} style={{ flex: 1, justifyContent: "center" }}>Submit</Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {screen === "results" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", alignItems: "center" }}>
          {/* Score circle */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <h1 className="font-heading" style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Test Complete</h1>
            <div style={{ position: "relative", width: 160, height: 160 }}>
              <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(0,229,255,0.1)" strokeWidth="12" />
                <motion.circle
                  cx="80" cy="80" r={r}
                  fill="none" stroke={CYAN} strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="font-heading" style={{ fontSize: "2.2rem", fontWeight: 800, color: CYAN }}>{pct}%</span>
              </div>
            </div>
            <Badge variant={pct >= 50 ? "success" : "warning"}>{pct >= 50 ? "PASS" : "FAIL"}</Badge>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "0.75rem", width: "100%", maxWidth: 500 }}>
            {[
              { label: "Correct",   value: score,           color: "#22c55e" },
              { label: "Wrong",     value: wrong,           color: "#ef4444" },
              { label: "Time Taken",value: fmt(timeTaken),  color: CYAN      },
              { label: "Flagged",   value: flagged.size,    color: PURPLE    },
            ].map((s) => (
              <div key={s.label} style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1rem", textAlign: "center" }}>
                <p className="font-heading" style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Topic breakdown */}
          {topicBreakdown.length > 0 && (
            <div style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.5rem", width: "100%" }}>
              <p className="font-heading" style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "1rem" }}>Topic Breakdown</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topicBreakdown} layout="vertical" margin={{ left: 140 }}>
                  <XAxis type="number" domain={[0,100]} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="topic" tick={{ fill: "#6b7280", fontSize: 11 }} width={130} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#080d1e", border: `1px solid ${BORDER}`, borderRadius: 6, color: "#e8eaf6" }} />
                  <Bar dataKey="score" radius={[0,4,4,0]}>
                    {topicBreakdown.map((t) => (
                      <Cell key={t.topic} fill={t.score >= 50 ? CYAN : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <Button variant="outline" onClick={() => {
            setScreen("pretest"); setCurrent(0);
            answersRef.current = {}; setAnswers({});
            setFlagged(new Set()); setTimeLeft(TIME_LIMIT);
            sessionIdRef.current = null;
          }}>
            Take Another Test
          </Button>
        </div>
      )}
    </DashboardWrapper>
  );
}

// ─── PreTestScreen ────────────────────────────────────────────────────────────

function PreTestScreen({
  exam,
  total,
  onStart,
}: {
  exam: ReturnType<typeof EXAMS.find>;
  total: number;
  onStart: () => void;
}) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <h1 className="font-heading" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
          Mock Test
        </h1>
        {exam && <p style={{ color: "var(--text-muted)" }}>{exam.name}</p>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        {[
          { label: "Questions", value: String(total) },
          { label: "Time Limit", value: "90 minutes" },
          { label: "Pass Mark", value: "50%" },
          { label: "Format", value: "MCQ" },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1rem" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            <p className="font-heading" style={{ color: "#00e5ff", fontSize: "1.25rem", fontWeight: 700, marginTop: "0.25rem" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.5rem" }}>
        <p className="font-heading" style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "0.75rem" }}>Instructions</p>
        <ul style={{ paddingLeft: "1.25rem", color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.9 }}>
          <li>Read each question carefully before selecting an answer.</li>
          <li>You can navigate between questions freely.</li>
          <li>Flag questions to revisit before submitting.</li>
          <li>The timer starts as soon as you click Start.</li>
          <li>The test auto-submits when time runs out.</li>
        </ul>
      </div>

      <Button variant="primary" size="lg" onClick={onStart} style={{ justifyContent: "center" }}>
        Start Test
      </Button>
    </div>
  );
}
