"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import Badge from "@/components/ui/Badge";
import { EXAMS } from "@/lib/constants";
import { TrendingUp, BookOpen, Flame } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import {
  getScoreTrend,
  getUserTopicPerformance,
  getStudyTime,
  getReadinessScore,
} from "@/lib/api/analytics";
import { getUserSessions } from "@/lib/api/mock-tests";

// ─── Design-system colours ────────────────────────────────────────────────────
const CYAN   = "#00e5ff";
const PURPLE = "#7b2fff";
const MUTED  = "#6b7280";
const SURFACE  = "#080d1e";
const BORDER = "rgba(0,229,255,0.12)";

const TOOLTIP_STYLE = {
  backgroundColor: SURFACE,
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  color: "#e8eaf6",
};

export default function AnalyticsPage() {
  const { examId } = useParams<{ examId: string }>();
  const exam = EXAMS.find((e) => e.id === examId);

  const { user, profile } = useUser();

  const [scoreTrend, setScoreTrend] = useState<{ date: string; score: number }[]>([]);
  const [topicPerf,  setTopicPerf]  = useState<{ topicId: string; topic: string; score: number; attempted: number }[]>([]);
  const [studyTime,  setStudyTime]  = useState<{ day: string; minutes: number }[]>([]);
  const [readiness,  setReadiness]  = useState(0);
  const [metrics,    setMetrics]    = useState([
    { label: "Overall Score",        value: "—",   icon: TrendingUp },
    { label: "Questions Attempted",  value: "—",   icon: BookOpen   },
    { label: "Study Streak",         value: "—",   icon: Flame      },
  ]);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      getScoreTrend(user.id, examId, 30),
      getUserTopicPerformance(user.id, examId),
      getStudyTime(user.id, 7),
      getReadinessScore(user.id, examId),
      getUserSessions(user.id, examId),
    ])
      .then(([trend, perf, study, ready, sessions]) => {
        setScoreTrend(trend);
        setTopicPerf(perf);
        setStudyTime(study);
        setReadiness(ready);

        const avgScore =
          sessions.length > 0
            ? Math.round(sessions.reduce((s, x) => s + x.score, 0) / sessions.length)
            : 0;
        const totalAttempted = perf.reduce((s, t) => s + t.attempted, 0);

        setMetrics([
          { label: "Overall Score",       value: sessions.length ? `${avgScore}%` : "—",          icon: TrendingUp },
          { label: "Questions Attempted", value: totalAttempted > 0 ? totalAttempted.toLocaleString() : "—", icon: BookOpen   },
          { label: "Study Streak",        value: profile ? `${profile.streak_count} days` : "—",  icon: Flame      },
        ]);
      })
      .catch(console.error);
  }, [user, examId, profile]);

  const r      = 54;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (readiness / 100) * circ;

  const weakTopics = topicPerf.filter((t) => t.score < 65).sort((a, b) => a.score - b.score);

  return (
    <DashboardWrapper examId={examId} activePage="analytics">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Header */}
        <div>
          <h1 className="font-heading" style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            Analytics
          </h1>
          {exam && <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{exam.name}</p>}
        </div>

        {/* Metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "1rem" }}>
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.25rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <p style={{ color: MUTED, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</p>
                <m.icon size={15} style={{ color: MUTED }} />
              </div>
              <p className="font-heading" style={{ fontSize: "1.75rem", fontWeight: 800, color: CYAN, lineHeight: 1 }}>{m.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Score over time */}
        <div style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.5rem" }}>
          <p className="font-heading" style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "1.25rem" }}>
            Score Over Time
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={scoreTrend.length ? scoreTrend : [{ date: "—", score: 0 }]}>
              <CartesianGrid stroke={BORDER} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="score" stroke={CYAN} strokeWidth={2} dot={{ fill: CYAN, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Topic performance (horizontal bar) */}
        {topicPerf.length > 0 && (
          <div style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.5rem" }}>
            <p className="font-heading" style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "1.25rem" }}>
              Topic Performance
            </p>
            <ResponsiveContainer width="100%" height={Math.max(120, topicPerf.length * 36)}>
              <BarChart data={topicPerf} layout="vertical" margin={{ left: 120 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="topic" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {topicPerf.map((entry) => (
                    <Cell key={entry.topicId} fill={entry.score >= 65 ? CYAN : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Study time per day */}
        <div style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.5rem" }}>
          <p className="font-heading" style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "1.25rem" }}>
            Study Time (Last 7 Days)
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={studyTime}>
              <CartesianGrid stroke={BORDER} horizontal={true} vertical={false} />
              <XAxis dataKey="day" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} min`, "Study Time"]} />
              <Bar dataKey="minutes" fill={PURPLE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Readiness + Weakest topics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: "1rem" }}>

          {/* Readiness circle */}
          <div style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <p className="font-heading" style={{ color: "var(--text-primary)", fontWeight: 700 }}>Exam Readiness</p>
            <div style={{ position: "relative", width: 140, height: 140 }}>
              <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(0,229,255,0.1)" strokeWidth="10" />
                <motion.circle
                  cx="70" cy="70" r={r}
                  fill="none"
                  stroke={CYAN}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="font-heading" style={{ fontSize: "2rem", fontWeight: 800, color: CYAN }}>
                  {readiness}%
                </span>
              </div>
            </div>
            <p style={{ color: MUTED, fontSize: "0.8rem", textAlign: "center" }}>Based on your recent scores across all topics</p>
          </div>

          {/* Weakest topics */}
          {weakTopics.length > 0 && (
            <div style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.5rem" }}>
              <p className="font-heading" style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "1rem" }}>Topics to Improve</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {weakTopics.map((t) => (
                  <div key={t.topicId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{t.topic}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Badge variant="warning">{t.score}%</Badge>
                      <Link
                        href={`/exam/${examId}/question-bank`}
                        style={{ color: CYAN, fontSize: "0.8rem", textDecoration: "none" }}
                      >
                        Practice
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardWrapper>
  );
}
