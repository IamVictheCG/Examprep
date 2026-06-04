"use server";

import { createClient } from "@/lib/supabase/server";

async function resolveExamSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string
): Promise<string | null> {
  const { data } = await supabase.from("exams").select("id").eq("slug", slug).single();
  return data?.id ?? null;
}

export async function getUserTopicPerformance(
  userId: string,
  examId: string
): Promise<{ topicId: string; topic: string; score: number; attempted: number }[]> {
  const supabase = await createClient();
  const examUUID = await resolveExamSlug(supabase, examId);
  if (!examUUID) return [];

  const { data: perfRows } = await supabase
    .from("topic_performance")
    .select("topic_id, total_attempted, total_correct")
    .eq("user_id", userId)
    .eq("exam_id", examUUID)
    .gt("total_attempted", 0);

  if (!perfRows?.length) return [];

  const { data: topicRows } = await supabase
    .from("topics")
    .select("id, name")
    .in("id", perfRows.map((r) => r.topic_id));

  const nameMap = Object.fromEntries((topicRows ?? []).map((t) => [t.id, t.name]));

  return perfRows.map((row) => ({
    topicId:   row.topic_id,
    topic:     nameMap[row.topic_id] ?? "Unknown",
    score:     row.total_attempted > 0
      ? Math.round((row.total_correct / row.total_attempted) * 100)
      : 0,
    attempted: row.total_attempted,
  }));
}

export async function getScoreTrend(
  userId: string,
  examId: string,
  days = 30
): Promise<{ date: string; score: number }[]> {
  const supabase = await createClient();
  const examUUID = await resolveExamSlug(supabase, examId);
  if (!examUUID) return [];

  const since = new Date(Date.now() - days * 86400000).toISOString();

  const { data } = await supabase
    .from("mock_test_sessions")
    .select("score, completed_at")
    .eq("user_id", userId)
    .eq("exam_id", examUUID)
    .eq("completed", true)
    .gte("completed_at", since)
    .order("completed_at", { ascending: true });

  return (data ?? []).map((s) => ({
    date:  new Date(s.completed_at!).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    score: s.score,
  }));
}

export async function getStudyTime(
  userId: string,
  days = 7
): Promise<{ day: string; minutes: number }[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const { data } = await supabase
    .from("mock_test_sessions")
    .select("started_at, duration_seconds")
    .eq("user_id", userId)
    .eq("completed", true)
    .gte("started_at", since);

  const result: { day: string; minutes: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d       = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

    const totalSec = (data ?? [])
      .filter((s) => s.started_at.startsWith(dateStr))
      .reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0);

    result.push({ day: dayName, minutes: Math.round(totalSec / 60) });
  }

  return result;
}

export async function getReadinessScore(
  userId: string,
  examId: string
): Promise<number> {
  const supabase = await createClient();
  const examUUID = await resolveExamSlug(supabase, examId);
  if (!examUUID) return 0;

  const { data: topicPerf } = await supabase
    .from("topic_performance")
    .select("total_attempted, total_correct")
    .eq("user_id", userId)
    .eq("exam_id", examUUID)
    .gt("total_attempted", 0);

  const avgTopicScore =
    topicPerf?.length
      ? topicPerf.reduce(
          (sum, t) => sum + (t.total_correct / t.total_attempted) * 100,
          0
        ) / topicPerf.length
      : 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: sessions } = await supabase
    .from("mock_test_sessions")
    .select("score")
    .eq("user_id", userId)
    .eq("exam_id", examUUID)
    .eq("completed", true)
    .gte("completed_at", thirtyDaysAgo)
    .order("completed_at", { ascending: false })
    .limit(5);

  const avgRecentScore =
    sessions?.length
      ? sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length
      : 0;

  const readiness = avgTopicScore * 0.7 + avgRecentScore * 0.3;
  return Math.min(100, Math.round(readiness));
}

export async function updateTopicPerformance(
  userId: string,
  examId: string,
  topicId: string,
  attempted: number,
  correct: number
): Promise<void> {
  const supabase = await createClient();
  const examUUID = await resolveExamSlug(supabase, examId);
  if (!examUUID) return;

  const { data: existing } = await supabase
    .from("topic_performance")
    .select("id, total_attempted, total_correct")
    .eq("user_id", userId)
    .eq("exam_id", examUUID)
    .eq("topic_id", topicId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("topic_performance")
      .update({
        total_attempted: existing.total_attempted + attempted,
        total_correct:   existing.total_correct   + correct,
        last_updated:    new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("topic_performance").insert({
      user_id:         userId,
      exam_id:         examUUID,
      topic_id:        topicId,
      total_attempted: attempted,
      total_correct:   correct,
      last_updated:    new Date().toISOString(),
    });
  }
}
