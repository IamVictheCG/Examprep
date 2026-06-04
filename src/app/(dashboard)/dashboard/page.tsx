"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { EXAMS } from "@/lib/constants";
import {
  BookOpen, ClipboardList, Flame, TrendingUp,
  Clock, BarChart2, BookMarked, ChevronRight,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { getSubscribedExams } from "@/lib/subscriptions";
import { getUserSessions } from "@/lib/api/mock-tests";
import { getUserTopicPerformance, getStudyTime } from "@/lib/api/analytics";
import { updateStreak } from "@/lib/api/profile";

// ─── Design-system colours (recharts / SVG cannot consume CSS vars) ───────────
const CYAN   = "#00e5ff";
const BORDER = "rgba(0,229,255,0.12)";

// ─── Local data shapes ────────────────────────────────────────────────────────
type ExamCard = { id: string; name: string; field: string; icon: string; progress: number; lastActivity: string };
type FocusItem = { examId: string; exam: string; topic: string; lastScore: number };
type ActivityItem = { type: string; exam: string; description: string; date: string; score: number | null };
type StatItem = { label: string; value: string; trend: string | null; icon: React.ElementType };

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "No activity yet";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
// ─────────────────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.42, ease: "easeOut", delay: i * 0.06 },
  }),
};

export default function DashboardHome() {
  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const { user, profile } = useUser();

  const [exams,           setExams]           = useState<ExamCard[]>([]);
  const [focus,           setFocus]           = useState<FocusItem[]>([]);
  const [activity,        setActivity]        = useState<ActivityItem[]>([]);
  const [stats,           setStats]           = useState<StatItem[]>([
    { label: "Study Time",       value: "—",  trend: null, icon: Clock        },
    { label: "Mock Tests",       value: "—",  trend: null, icon: ClipboardList },
    { label: "Average Score",    value: "—",  trend: null, icon: TrendingUp   },
    { label: "Exams Subscribed", value: "—",  trend: null, icon: BookMarked   },
  ]);
  const [subscribedIds,   setSubscribedIds]   = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    // Update streak on dashboard visit
    updateStreak(user.id).catch(console.error);

    Promise.all([
      getSubscribedExams(user.id),
      getUserSessions(user.id),
      getStudyTime(user.id, 7),
    ])
      .then(([dbExams, sessions, studyDays]) => {
        // Subscribed exam IDs (slugs)
        const slugSet = new Set(dbExams.map((e) => e.slug));
        setSubscribedIds(slugSet);

        // Build exam cards
        const cards: ExamCard[] = dbExams.map((dbExam) => {
          const examSessions = sessions.filter(
            (s) => (s.exam as { slug: string } | null)?.slug === dbExam.slug
          );
          const avgScore =
            examSessions.length > 0
              ? Math.round(examSessions.reduce((sum, s) => sum + s.score, 0) / examSessions.length)
              : 0;
          const lastSession = examSessions[0];
          return {
            id:           dbExam.slug,
            name:         dbExam.name,
            field:        dbExam.field,
            icon:         dbExam.icon,
            progress:     avgScore,
            lastActivity: relativeTime(lastSession?.completed_at ?? lastSession?.started_at),
          };
        });
        setExams(cards);

        // Activity feed
        const activityItems: ActivityItem[] = sessions.slice(0, 5).map((s) => ({
          type:        "mock",
          exam:        (s.exam as { name: string } | null)?.name ?? "Exam",
          description: `Completed Mock Test`,
          date:        relativeTime(s.completed_at),
          score:       s.score,
        }));
        setActivity(activityItems);

        // Stats
        const totalStudyMins = studyDays.reduce((sum, d) => sum + d.minutes, 0);
        const totalHours     = Math.round(totalStudyMins / 60);
        const avgScore =
          sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
            : 0;

        setStats([
          { label: "Study Time",       value: `${totalHours}h`,      trend: null, icon: Clock        },
          { label: "Mock Tests",       value: String(sessions.length), trend: null, icon: ClipboardList },
          { label: "Average Score",    value: sessions.length ? `${avgScore}%` : "—", trend: null, icon: TrendingUp },
          { label: "Exams Subscribed", value: String(dbExams.length), trend: null, icon: BookMarked   },
        ]);

        // Recommended focus: weakest topics across all subscribed exams
        const focusPromises = dbExams.slice(0, 2).map((dbExam) =>
          getUserTopicPerformance(user.id, dbExam.slug).then((perf) =>
            perf
              .filter((t) => t.score < 65)
              .sort((a, b) => a.score - b.score)
              .slice(0, 2)
              .map((t) => ({
                examId:    dbExam.slug,
                exam:      dbExam.name,
                topic:     t.topic,
                lastScore: t.score,
              }))
          )
        );

        Promise.all(focusPromises)
          .then((all) => setFocus(all.flat().slice(0, 3)))
          .catch(console.error);
      })
      .catch(console.error);
  }, [user]);

  const userName = profile?.full_name?.split(" ")[0] ?? "there";
  const streakCount = profile?.streak_count ?? 0;
  const unsubscribed = EXAMS.filter((e) => e.status === "live" && !subscribedIds.has(e.id));

  return (
    <DashboardWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* ── Greeting ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-heading" style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            Good morning, {userName} 👋
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{today}</p>
        </motion.div>

        {/* ── Streak banner ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
          style={{
            backgroundColor: "rgba(0,229,255,0.06)",
            border: "1px solid var(--border-cyan)",
            borderRadius: 12,
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Flame size={22} style={{ color: CYAN, flexShrink: 0 }} />
          <div>
            <span className="font-heading" style={{ color: CYAN, fontWeight: 700, fontSize: "1rem" }}>
              {streakCount} day streak
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginLeft: "0.75rem" }}>
              Keep it up — you&apos;re building a winning habit!
            </span>
          </div>
        </motion.div>

        {/* ── Stats row ────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "1rem" }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-cyan)",
                borderRadius: 12,
                padding: "1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {s.label}
                </p>
                <s.icon size={16} style={{ color: "var(--text-muted)" }} />
              </div>
              <p className="font-heading" style={{ color: CYAN, fontSize: "1.75rem", fontWeight: 800, lineHeight: 1 }}>
                {s.value}
              </p>
              {s.trend && (
                <p style={{ color: "#22c55e", fontSize: "0.75rem", marginTop: "0.4rem" }}>
                  {s.trend} this week
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── My Exams ─────────────────────────────────────────────────── */}
        {exams.length > 0 && (
          <div>
            <h2 className="font-heading" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
              My Exams
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: "1rem" }}>
              {exams.map((exam, i) => (
                <motion.div
                  key={exam.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.5rem" }}>{exam.icon}</span>
                    <div>
                      <p className="font-heading" style={{ fontWeight: 700, color: "var(--text-primary)" }}>{exam.name}</p>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{exam.field}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Progress</span>
                      <span style={{ color: CYAN, fontSize: "0.75rem", fontWeight: 600 }}>{exam.progress}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, backgroundColor: "rgba(0,229,255,0.1)", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${exam.progress}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        style={{ height: "100%", borderRadius: 2, backgroundColor: CYAN }}
                      />
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "0.35rem" }}>
                      Last activity: {exam.lastActivity}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <Link href={`/exam/${exam.id}/flashcards`} style={{ flex: 1, textDecoration: "none" }}>
                      <Button variant="outline" size="sm" style={{ width: "100%", justifyContent: "center" }}>
                        Study
                      </Button>
                    </Link>
                    <Link href={`/exam/${exam.id}/mock-test`} style={{ flex: 1, textDecoration: "none" }}>
                      <Button variant="ghost" size="sm" style={{ width: "100%", justifyContent: "center" }}>
                        Mock Test
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recommended Focus ────────────────────────────────────────── */}
        {focus.length > 0 && (
          <div>
            <h2 className="font-heading" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
              Recommended Focus
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: "1rem" }}>
              {focus.map((f, i) => (
                <motion.div
                  key={`${f.examId}-${f.topic}`}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  <Badge variant="live">{f.exam}</Badge>
                  <p className="font-heading" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{f.topic}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    Last score: <span style={{ color: "#ef4444" }}>{f.lastScore}%</span>
                  </p>
                  <Link
                    href={`/exam/${f.examId}/question-bank`}
                    style={{ color: CYAN, fontSize: "0.85rem", fontWeight: 500, textDecoration: "none", marginTop: "0.25rem" }}
                  >
                    Practice →
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent Activity ──────────────────────────────────────────── */}
        {activity.length > 0 && (
          <div>
            <h2 className="font-heading" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
              Recent Activity
            </h2>
            <div
              style={{
                backgroundColor: "var(--bg-surface)",
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {activity.map((item, i) => {
                const Icon = item.type === "mock" ? ClipboardList : BookOpen;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                      padding: "0.875rem 1.25rem",
                      borderBottom: i < activity.length - 1 ? `1px solid ${BORDER}` : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        backgroundColor: "rgba(0,229,255,0.08)",
                        border: `1px solid ${BORDER}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} style={{ color: CYAN }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.description}
                      </p>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{item.exam} · {item.date}</p>
                    </div>
                    {item.score !== null && (
                      <span
                        style={{
                          color: item.score >= 50 ? "#22c55e" : "#ef4444",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {item.score}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Explore More Exams (horizontal scroll) ───────────────────── */}
        {unsubscribed.length > 0 && (
          <div>
            <h2 className="font-heading" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
              Explore More Exams
            </h2>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                overflowX: "auto",
                paddingBottom: "0.5rem",
              }}
            >
              {unsubscribed.map((exam) => (
                <div
                  key={exam.id}
                  style={{
                    flexShrink: 0,
                    width: 200,
                    backgroundColor: "var(--bg-surface)",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>{exam.icon}</span>
                  <div>
                    <p className="font-heading" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{exam.name}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{exam.field}</p>
                  </div>
                  <Link href={`/pricing`} style={{ textDecoration: "none" }}>
                    <Button variant="outline" size="sm" style={{ width: "100%", justifyContent: "center" }}>
                      Get Access
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardWrapper>
  );
}
