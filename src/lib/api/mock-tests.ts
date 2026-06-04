"use server";

import { createClient } from "@/lib/supabase/server";

async function resolveExamSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string
): Promise<string | null> {
  const { data } = await supabase.from("exams").select("id").eq("slug", slug).single();
  return data?.id ?? null;
}

export async function createSession(
  userId: string,
  examId: string,
  questionIds: string[]
): Promise<string> {
  const supabase = await createClient();
  const examUUID = await resolveExamSlug(supabase, examId);
  if (!examUUID) throw new Error("Exam not found");

  const { data, error } = await supabase
    .from("mock_test_sessions")
    .insert({
      user_id: userId,
      exam_id: examUUID,
      questions: questionIds,
      answers: {},
      score: 0,
      duration_seconds: 0,
      completed: false,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function saveAnswer(
  sessionId: string,
  questionId: string,
  answerId: string
): Promise<void> {
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("mock_test_sessions")
    .select("answers")
    .eq("id", sessionId)
    .single();

  const updatedAnswers = { ...(session?.answers ?? {}), [questionId]: answerId };
  await supabase
    .from("mock_test_sessions")
    .update({ answers: updatedAnswers })
    .eq("id", sessionId);
}

export async function completeSession(
  sessionId: string,
  clientAnswers: Record<string, string>,
  durationSeconds?: number
): Promise<number> {
  const supabase = await createClient();

  // Fetch only the minimal fields we need — no need to read back answers
  const { data: session } = await supabase
    .from("mock_test_sessions")
    .select("user_id, exam_id, questions")
    .eq("id", sessionId)
    .single();

  if (!session) throw new Error("Session not found");

  const { data: questions } = await supabase
    .from("questions")
    .select("id, correct_option_id, topic_id")
    .in("id", session.questions as string[]);

  if (!questions?.length) throw new Error("Questions not found");

  const correctCount = questions.filter(
    (q) => clientAnswers[q.id] === q.correct_option_id
  ).length;

  const score = Math.round((correctCount / questions.length) * 100);
  const now   = new Date().toISOString();

  // Save answers + completion in one single update
  await supabase
    .from("mock_test_sessions")
    .update({
      answers:          clientAnswers,
      score,
      completed:        true,
      completed_at:     now,
      duration_seconds: durationSeconds ?? 0,
    })
    .eq("id", sessionId);

  // Build per-topic delta
  const topicDelta: Record<string, { attempted: number; correct: number }> = {};
  for (const q of questions) {
    if (!q.topic_id) continue;
    if (!topicDelta[q.topic_id]) topicDelta[q.topic_id] = { attempted: 0, correct: 0 };
    topicDelta[q.topic_id].attempted++;
    if (clientAnswers[q.id] === q.correct_option_id) topicDelta[q.topic_id].correct++;
  }

  const topicIds = Object.keys(topicDelta);
  if (!topicIds.length) return score;

  // One SELECT for all existing records instead of N selects
  const { data: existing } = await supabase
    .from("topic_performance")
    .select("topic_id, total_attempted, total_correct")
    .eq("user_id", session.user_id)
    .eq("exam_id", session.exam_id)
    .in("topic_id", topicIds);

  const existingMap = Object.fromEntries(
    (existing ?? []).map((r) => [r.topic_id, r])
  );

  // One batch upsert instead of N insert/updates
  const upsertRows = topicIds.map((topicId) => {
    const delta = topicDelta[topicId];
    const prev  = existingMap[topicId];
    return {
      user_id:         session.user_id,
      exam_id:         session.exam_id,
      topic_id:        topicId,
      total_attempted: (prev?.total_attempted ?? 0) + delta.attempted,
      total_correct:   (prev?.total_correct   ?? 0) + delta.correct,
      last_updated:    now,
    };
  });

  await supabase
    .from("topic_performance")
    .upsert(upsertRows, { onConflict: "user_id,exam_id,topic_id" });

  return score;
}

export async function getSession(sessionId: string) {
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("mock_test_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (!session) return null;

  const { data: questions } = await supabase
    .from("questions")
    .select("*, topic:topics(name)")
    .in("id", session.questions);

  return { session, questions: questions ?? [] };
}

export async function getUserSessions(userId: string, examId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("mock_test_sessions")
    .select("*, exam:exams(slug, name, icon)")
    .eq("user_id", userId)
    .eq("completed", true)
    .order("completed_at", { ascending: false })
    .limit(20);

  if (examId) {
    const examUUID = await resolveExamSlug(supabase, examId);
    if (examUUID) query = query.eq("exam_id", examUUID);
  }

  const { data } = await query;
  return data ?? [];
}
