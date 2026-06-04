"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PaywallOverlay from "@/components/exam/PaywallOverlay";
import { EXAMS } from "@/lib/constants";
import { BookOpen, ClipboardList, HelpCircle, BarChart2, ArrowRight } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { hasActiveSubscription } from "@/lib/subscriptions";

// ─── Design-system colours (CSS vars don't work in SVG/recharts props) ────────
const CYAN   = "#00e5ff";
const BORDER = "rgba(0,229,255,0.12)";

// MOCK DATA - replace with API call in Backend Phase 4
const MOCK_PERF = {
  overall: 73,
  strongest: "Financial Accounting",
  weakest: "Taxation",
  trend: [
    { week: "W1", score: 55 }, { week: "W2", score: 61 }, { week: "W3", score: 58 },
    { week: "W4", score: 67 }, { week: "W5", score: 70 }, { week: "W6", score: 73 },
  ],
};
const MOCK_SESSIONS = [
  { id: "s1", date: "1 Jun 2026", score: 73, duration: "1h 24m" },
  { id: "s2", date: "29 May 2026", score: 61, duration: "1h 38m" },
  { id: "s3", date: "26 May 2026", score: 68, duration: "1h 17m" },
];
// ─────────────────────────────────────────────────────────────────────────────

const NAV_CARDS = [
  {
    label: "Flashcards",
    description: "AI-generated flashcards organised by topic",
    icon: BookOpen,
    href: (id: string) => `/exam/${id}/flashcards`,
  },
  {
    label: "Mock Test",
    description: "Simulate the real exam under timed conditions",
    icon: ClipboardList,
    href: (id: string) => `/exam/${id}/mock-test`,
  },
  {
    label: "Question Bank",
    description: "Browse and filter the full question archive",
    icon: HelpCircle,
    href: (id: string) => `/exam/${id}/question-bank`,
  },
  {
    label: "Analytics",
    description: "Track your scores, streaks, and weak spots",
    icon: BarChart2,
    href: (id: string) => `/exam/${id}/analytics`,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: "easeOut", delay: i * 0.07 },
  }),
};

export default function ExamOverviewPage() {
  const { examId } = useParams<{ examId: string }>();
  const exam = EXAMS.find((e) => e.id === examId);

  const { user, loading: userLoading } = useUser();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      // No auth configured or not logged in — show content in dev mode
      setHasAccess(true);
      return;
    }
    hasActiveSubscription(user.id, examId)
      .then(setHasAccess)
      .catch(() => setHasAccess(true));
  }, [user, userLoading, examId]);

  if (!exam) {
    return (
      <DashboardWrapper>
        <p style={{ color: "var(--text-muted)" }}>Exam not found.</p>
      </DashboardWrapper>
    );
  }

  if (hasAccess === false) {
    return (
      <DashboardWrapper examId={examId} activePage="overview">
        <PaywallOverlay exam={exam} />
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper examId={examId} activePage="overview">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.75rem" }}>{exam.icon}</span>
            <h1 className="font-heading" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, color: "var(--text-primary)" }}>
              {exam.name}
            </h1>
          </div>
          <Badge variant="live">{exam.field}</Badge>
        </motion.div>

        {/* Navigation cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: "1rem" }}>
          {NAV_CARDS.map((card, i) => (
            <NavCard key={card.label} card={card} examId={examId} index={i} />
          ))}
        </div>

        {/* Performance summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* Score + badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
            style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.5rem" }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
              Overall Score
            </p>
            <p className="font-heading" style={{ fontSize: "3rem", fontWeight: 800, color: CYAN, lineHeight: 1, marginBottom: "1rem" }}>
              {MOCK_PERF.overall}%
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Badge variant="success">{MOCK_PERF.strongest}</Badge>
              <Badge variant="warning">{MOCK_PERF.weakest}</Badge>
            </div>
          </motion.div>

          {/* Mini line chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}
            style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.5rem" }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
              Score Trend
            </p>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={MOCK_PERF.trend}>
                <Line type="monotone" dataKey="score" stroke={CYAN} strokeWidth={2} dot={{ fill: CYAN, r: 3 }} />
                <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#080d1e", border: `1px solid ${BORDER}`, borderRadius: 6, color: "#e8eaf6" }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent sessions */}
        <div>
          <h2 className="font-heading" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
            Recent Sessions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {MOCK_SESSIONS.map((s, i) => (
              <motion.div
                key={s.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p className="font-heading" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{exam.name} Mock Test</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{s.date} · {s.duration}</p>
                </div>
                <Badge variant={s.score >= 50 ? "success" : "warning"}>{s.score}%</Badge>
                <Link href={`/exam/${examId}/mock-test/${s.id}/review`} style={{ textDecoration: "none" }}>
                  <Button variant="ghost" size="sm">Review</Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </DashboardWrapper>
  );
}

// ─── NavCard ──────────────────────────────────────────────────────────────────

function NavCard({
  card,
  examId,
  index,
}: {
  card: (typeof NAV_CARDS)[number];
  examId: string;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ borderColor: "var(--border-cyan-hover)", y: -2, transition: { duration: 0.2 } }}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: "1.75rem",
        cursor: "pointer",
      }}
    >
      <Link href={card.href(examId)} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <card.icon size={26} style={{ color: CYAN }} />
          <ArrowRight size={16} style={{ color: "var(--text-muted)" }} />
        </div>
        <p className="font-heading" style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1rem" }}>
          {card.label}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.55 }}>
          {card.description}
        </p>
      </Link>
    </motion.div>
  );
}
