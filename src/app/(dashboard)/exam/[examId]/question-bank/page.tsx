"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bookmark, BookmarkCheck, ChevronDown, CheckCircle, XCircle } from "lucide-react";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { EXAMS } from "@/lib/constants";
import { useUser } from "@/hooks/useUser";
import { getQuestionsByExam, getTopicsByExam, searchQuestions } from "@/lib/api/questions";
import { getAllUserBookmarkIds, addBookmark, removeBookmark } from "@/lib/api/bookmarks";

// ─── Design-system colours ────────────────────────────────────────────────────
const CYAN   = "#00e5ff";
const BORDER = "rgba(0,229,255,0.12)";

// ─── Static filter options (difficulty, type, year are fixed) ─────────────────
const STATIC_YEARS  = ["All Years",  "2024", "2023", "2022", "2021", "2020"];
const STATIC_DIFFS  = ["All Difficulties", "Easy", "Medium", "Hard"];
const STATIC_TYPES  = ["All Types",  "MCQ",  "Theory"];
const PAGE_SIZE     = 20;
// ─────────────────────────────────────────────────────────────────────────────

type Option   = { id: string; text: string };
type Question = {
  id: string; topic: string; year: number;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "MCQ" | "Theory";
  text: string; options: Option[];
  correctId: string; explanation: string;
};

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function normalizeQuestion(dbQ: {
  id: string;
  question_text: string;
  options: Option[] | null;
  correct_option_id: string | null;
  difficulty: string;
  question_type: string;
  year: number | null;
  explanation: string;
  topic?: { name: string } | null;
}): Question {
  return {
    id:          dbQ.id,
    text:        dbQ.question_text,
    topic:       (dbQ.topic as { name: string } | null)?.name ?? "General",
    year:        dbQ.year ?? 0,
    difficulty:  capitalize(dbQ.difficulty) as Question["difficulty"],
    type:        dbQ.question_type.toLowerCase() === "mcq" ? "MCQ" : "Theory",
    options:     dbQ.options ?? [],
    correctId:   dbQ.correct_option_id ?? "",
    explanation: dbQ.explanation ?? "",
  };
}

export default function QuestionBankPage() {
  const { examId } = useParams<{ examId: string }>();
  const exam = EXAMS.find((e) => e.id === examId);

  const { user } = useUser();

  const [questions,   setQuestions]   = useState<Question[]>([]);
  const [topics,      setTopics]      = useState(["All Topics"]);
  const [search,      setSearch]      = useState("");
  const [topic,       setTopic]       = useState("All Topics");
  const [year,        setYear]        = useState("All Years");
  const [difficulty,  setDifficulty]  = useState("All Difficulties");
  const [type,        setType]        = useState("All Types");
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const [bookmarked,  setBookmarked]  = useState<Set<string>>(new Set());
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);

  // Load topics on mount
  useEffect(() => {
    getTopicsByExam(examId)
      .then((dbTopics) => {
        setTopics(["All Topics", ...dbTopics.map((t) => t.name)]);
      })
      .catch(console.error);
  }, [examId]);

  // Load bookmarks on mount
  useEffect(() => {
    if (!user) return;
    getAllUserBookmarkIds(user.id)
      .then((ids) => setBookmarked(new Set(ids)))
      .catch(console.error);
  }, [user]);

  // Fetch questions when filters or page change
  const fetchQuestions = useCallback(() => {
    const topicObj = topics.find((t) => t === topic && t !== "All Topics");

    if (search.trim()) {
      searchQuestions(examId, search.trim())
        .then((data) => {
          setQuestions(data.map(normalizeQuestion));
          setTotalPages(1);
        })
        .catch(console.error);
      return;
    }

    getQuestionsByExam(examId, {
      difficulty: difficulty !== "All Difficulties" ? difficulty : undefined,
      year:       year !== "All Years" ? Number(year) : undefined,
      type:       type !== "All Types" ? type : undefined,
      limit:      PAGE_SIZE,
      offset:     (page - 1) * PAGE_SIZE,
    })
      .then((data) => {
        setQuestions(data.map(normalizeQuestion));
        // Update total pages based on whether we got a full page
        if (data.length === PAGE_SIZE) {
          setTotalPages(Math.max(totalPages, page + 1));
        } else {
          setTotalPages(page);
        }
      })
      .catch(console.error);

    void topicObj;
  }, [examId, search, topic, topics, year, difficulty, type, page, totalPages]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, topic, year, difficulty, type]);

  async function toggleBookmark(id: string) {
    if (!user) return;
    const isMarked = bookmarked.has(id);
    setBookmarked((prev) => {
      const next = new Set(prev);
      isMarked ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      if (isMarked) await removeBookmark(user.id, id);
      else          await addBookmark(user.id, id);
    } catch {
      // Revert on error
      setBookmarked((prev) => {
        const next = new Set(prev);
        isMarked ? next.add(id) : next.delete(id);
        return next;
      });
    }
  }

  const selectStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-surface)",
    border: `1px solid ${BORDER}`,
    color: "var(--text-muted)",
    borderRadius: 8,
    padding: "0.6rem 0.75rem",
    fontSize: "0.85rem",
    outline: "none",
  };

  return (
    <DashboardWrapper examId={examId} activePage="question bank">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Header */}
        <div>
          <h1 className="font-heading" style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            Question Bank
          </h1>
          {exam && <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{exam.name}</p>}
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "var(--bg-surface)",
              border: `1px solid ${BORDER}`,
              color: "var(--text-primary)",
              borderRadius: 8,
              padding: "0.75rem 1rem 0.75rem 2.5rem",
              fontSize: "0.9rem",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
            onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
          />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {[
            { value: topic,      setter: setTopic,      options: topics      },
            { value: year,       setter: setYear,       options: STATIC_YEARS },
            { value: difficulty, setter: setDifficulty, options: STATIC_DIFFS },
            { value: type,       setter: setType,       options: STATIC_TYPES },
          ].map((f, i) => (
            <select key={i} value={f.value} onChange={(e) => f.setter(e.target.value)} style={selectStyle}>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>

        {/* Question list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {questions.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>No questions match your filters.</p>
          ) : (
            questions.map((q) => {
              const isOpen       = expanded === q.id;
              const isBookmarked = bookmarked.has(q.id);

              return (
                <div
                  key={q.id}
                  style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}
                >
                  {/* Collapsed header */}
                  <div
                    style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem 1.25rem", cursor: "pointer" }}
                    onClick={() => setExpanded(isOpen ? null : q.id)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: isOpen ? undefined : 2, WebkitBoxOrient: "vertical" }}>
                        {q.text}
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                        <Badge variant="live">{q.topic}</Badge>
                        <Badge variant={q.difficulty === "Easy" ? "success" : q.difficulty === "Medium" ? "warning" : "coming-soon"}>
                          {q.difficulty}
                        </Badge>
                        {q.year > 0 && (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.2rem 0.5rem", border: `1px solid ${BORDER}`, borderRadius: 999 }}>
                            {q.year}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(q.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", color: isBookmarked ? CYAN : "var(--text-muted)" }}
                      >
                        {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={15} style={{ color: "var(--text-muted)" }} />
                      </motion.div>
                    </div>
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="expanded"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ borderTop: `1px solid ${BORDER}`, padding: "1.25rem" }}>
                          {/* Options */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
                            {q.options.map((opt) => {
                              const isCorrect = opt.id === q.correctId;
                              return (
                                <div
                                  key={opt.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.6rem",
                                    padding: "0.65rem 1rem",
                                    borderRadius: 8,
                                    backgroundColor: isCorrect ? "rgba(34,197,94,0.08)" : "transparent",
                                    border: `1px solid ${isCorrect ? "rgba(34,197,94,0.3)" : BORDER}`,
                                  }}
                                >
                                  {isCorrect
                                    ? <CheckCircle size={15} style={{ color: "#22c55e", flexShrink: 0 }} />
                                    : <span style={{ width: 15, height: 15, flexShrink: 0 }} />
                                  }
                                  <span style={{ fontSize: "0.875rem", color: isCorrect ? "#22c55e" : "var(--text-muted)" }}>
                                    <strong style={{ marginRight: "0.4rem" }}>{opt.id.toUpperCase()}.</strong>
                                    {opt.text}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {q.explanation && (
                            <div
                              style={{
                                backgroundColor: "rgba(0,229,255,0.04)",
                                borderLeft: `2px solid ${CYAN}`,
                                padding: "1rem",
                                borderRadius: "0 8px 8px 0",
                              }}
                            >
                              <p style={{ color: CYAN, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
                                AI Explanation
                              </p>
                              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.65 }}>
                                {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
          <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Page {page} of {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>

      </div>
    </DashboardWrapper>
  );
}
