"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import Button from "@/components/ui/Button";
import { EXAMS } from "@/lib/constants";
import { Send } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

// ─── Design-system colours ────────────────────────────────────────────────────
const CYAN   = "#00e5ff";
const BORDER = "rgba(0,229,255,0.12)";

const EXAM_PROMPTS: Record<string, string[]> = {
  default: [
    "Explain the most commonly tested concept in this exam",
    "Give me a worked example question and answer",
    "What topics should I focus on in the last week before the exam?",
  ],
  ican: [
    "Explain the revenue recognition principles under IFRS 15",
    "How does deferred tax work under IAS 12?",
    "What is the difference between control and significant influence?",
  ],
  "bar-finals": [
    "Explain the rule in Rylands v Fletcher",
    "What are the elements of a valid contract?",
    "How does adverse possession work under Nigerian law?",
  ],
  mdcn: [
    "Explain the mechanism of action of beta blockers",
    "What are the causes of hyperkalaemia?",
    "Describe the management of anaphylaxis",
  ],
};

type Message = { role: "user" | "assistant"; content: string; id: string };

export default function AiTutorPage() {
  const { examId } = useParams<{ examId: string }>();
  const exam    = EXAMS.find((e) => e.id === examId);
  const prompts = EXAM_PROMPTS[examId ?? ""] ?? EXAM_PROMPTS.default;

  const { user } = useUser();

  const WELCOME: Message = {
    id: "welcome",
    role: "assistant",
    content: `Hi! I'm your AI tutor for ${exam?.name ?? "this exam"}. Ask me anything — concepts, past questions, exam strategies. I'm here to help you pass! 🎯`,
  };

  const [messages,      setMessages]      = useState<Message[]>([WELCOME]);
  const [input,         setInput]         = useState("");
  const [typing,        setTyping]        = useState(false);
  const [sessionDbId,   setSessionDbId]   = useState<string | null>(null);
  const bottomRef                         = useRef<HTMLDivElement>(null);

  // Load previous session on mount
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    supabase.from("exams").select("id").eq("slug", examId).single()
      .then(({ data: examRow }) => {
        if (!examRow) return;
        return supabase
          .from("ai_tutor_sessions")
          .select("id, messages")
          .eq("user_id", user.id)
          .eq("exam_id", examRow.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();
      })
      .then((result) => {
        const data = result?.data;
        if (!data) return;
        setSessionDbId(data.id);
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages([
            WELCOME,
            ...data.messages.map(
              (m: { role: "user" | "assistant"; content: string }, i: number) => ({
                id:      `loaded-${i}`,
                role:    m.role,
                content: m.content,
              })
            ),
          ]);
        }
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, examId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function sendMessage(text: string) {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const updatedMessages  = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setTyping(true);

    const aiMsgId = crypto.randomUUID();

    try {
      const apiMessages = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setTyping(false);
      const aiMsg: Message = { id: aiMsgId, role: "assistant", content: "" };
      setMessages((prev) => [...prev, aiMsg]);

      const reader  = response.body!.getReader();
      const decoder = new TextDecoder();
      const chunks: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(decoder.decode(value, { stream: true }));
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: chunks.join("") } : m))
        );
      }

      const finalContent = chunks.join("");

      // Save full conversation to DB
      if (user) {
        const supabase   = createClient();
        const messagesToSave = updatedMessages
          .filter((m) => m.id !== "welcome")
          .concat({ id: aiMsgId, role: "assistant", content: finalContent })
          .map((m) => ({
            role:      m.role,
            content:   m.content,
            timestamp: new Date().toISOString(),
          }));

        const { data: examRow } = await supabase
          .from("exams")
          .select("id")
          .eq("slug", examId)
          .single();

        if (examRow) {
          if (sessionDbId) {
            await supabase
              .from("ai_tutor_sessions")
              .update({ messages: messagesToSave, updated_at: new Date().toISOString() })
              .eq("id", sessionDbId);
          } else {
            const { data: newSession } = await supabase
              .from("ai_tutor_sessions")
              .insert({ user_id: user.id, exam_id: examRow.id, messages: messagesToSave })
              .select("id")
              .single();
            if (newSession) setSessionDbId(newSession.id);
          }
        }
      }
    } catch {
      setTyping(false);
      const errMsg: Message = {
        id:      aiMsgId,
        role:    "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
  }

  const hasReplied = messages.length > 1;

  return (
    <DashboardWrapper examId={examId} activePage="ai tutor">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 64px - 4rem)",
          minHeight: 500,
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: `1px solid ${BORDER}`,
            paddingBottom: "1rem",
            marginBottom: "1rem",
            flexShrink: 0,
          }}
        >
          <h1 className="font-heading" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
            AI Tutor
          </h1>
          {exam && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{exam.name}</p>
          )}
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", paddingRight: "0.25rem" }}>

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                display: "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                gap: "0.6rem",
                alignItems: "flex-end",
              }}
            >
              {msg.role === "assistant" && (
                <div
                  style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    backgroundColor: "rgba(0,229,255,0.08)",
                    border: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.65rem", fontWeight: 700, color: CYAN,
                  }}
                >
                  AI
                </div>
              )}
              <div
                style={{
                  maxWidth: "75%",
                  padding: "0.875rem 1.125rem",
                  fontSize: "0.9rem",
                  lineHeight: 1.65,
                  ...(msg.role === "user"
                    ? {
                        backgroundColor: CYAN,
                        color: "var(--bg-primary)",
                        borderRadius: "16px 16px 4px 16px",
                      }
                    : {
                        backgroundColor: "var(--bg-surface-2)",
                        border: `1px solid ${BORDER}`,
                        color: "var(--text-primary)",
                        borderRadius: "16px 16px 16px 4px",
                      }),
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {typing && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "flex-end", gap: "0.6rem" }}
              >
                <div
                  style={{
                    width: 30, height: 30, borderRadius: "50%",
                    backgroundColor: "rgba(0,229,255,0.08)",
                    border: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.65rem", fontWeight: 700, color: CYAN, flexShrink: 0,
                  }}
                >
                  AI
                </div>
                <div
                  style={{
                    backgroundColor: "var(--bg-surface-2)",
                    border: `1px solid ${BORDER}`,
                    borderRadius: "16px 16px 16px 4px",
                    padding: "0.875rem 1.125rem",
                    display: "flex", gap: "0.3rem", alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.22 }}
                      style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: CYAN, display: "inline-block" }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts (shown before first user message) */}
        {!hasReplied && !typing && (
          <div style={{ paddingTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", flexShrink: 0 }}>
            {prompts.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 999,
                  padding: "0.4rem 0.9rem",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-cyan-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          style={{
            borderTop: `1px solid ${BORDER}`,
            paddingTop: "1rem",
            marginTop: "0.75rem",
            display: "flex",
            gap: "0.75rem",
            flexShrink: 0,
            backgroundColor: "var(--bg-surface-2)",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about the exam…"
            style={{
              flex: 1,
              backgroundColor: "var(--bg-surface)",
              border: `1px solid ${BORDER}`,
              color: "var(--text-primary)",
              borderRadius: 8,
              padding: "0.75rem 1rem",
              fontSize: "0.9rem",
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
            onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
          />
          <Button type="submit" variant="outline" disabled={!input.trim() || typing}>
            <Send size={16} />
          </Button>
        </form>
      </div>
    </DashboardWrapper>
  );
}
