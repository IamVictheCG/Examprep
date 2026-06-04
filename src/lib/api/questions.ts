"use server";

import { createClient } from "@/lib/supabase/server";

async function resolveExamSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string
): Promise<string | null> {
  const { data } = await supabase.from("exams").select("id").eq("slug", slug).single();
  return data?.id ?? null;
}

export async function getQuestionsByExam(
  examId: string,
  filters?: {
    topicId?: string;
    difficulty?: string;
    year?: number;
    type?: string;
    limit?: number;
    offset?: number;
  }
) {
  const supabase = await createClient();
  const examUUID = await resolveExamSlug(supabase, examId);
  if (!examUUID) return [];

  let query = supabase
    .from("questions")
    .select("*, topic:topics(id, name)")
    .eq("exam_id", examUUID);

  if (filters?.topicId)   query = query.eq("topic_id", filters.topicId);
  if (filters?.difficulty) query = query.eq("difficulty", filters.difficulty.toLowerCase() as "easy" | "medium" | "hard");
  if (filters?.year)       query = query.eq("year", filters.year);
  if (filters?.type)       query = query.eq("question_type", filters.type.toLowerCase() as "mcq" | "theory");

  const limit  = filters?.limit  ?? 20;
  const offset = filters?.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data } = await query;
  return data ?? [];
}

export async function getTopicsByExam(examId: string) {
  const supabase = await createClient();
  const examUUID = await resolveExamSlug(supabase, examId);
  if (!examUUID) return [];

  const { data } = await supabase
    .from("topics")
    .select("id, name")
    .eq("exam_id", examUUID)
    .order("order_index");

  return data ?? [];
}

export async function getQuestionById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .select("*, topic:topics(id, name)")
    .eq("id", id)
    .single();
  return data;
}

export async function getRandomQuestions(
  examId: string,
  count: number,
  topicIds?: string[]
) {
  const supabase = await createClient();
  const examUUID = await resolveExamSlug(supabase, examId);
  if (!examUUID) return [];

  let query = supabase
    .from("questions")
    .select("*, topic:topics(id, name)")
    .eq("exam_id", examUUID)
    .eq("question_type", "mcq")
    .limit(count * 3); // fetch 3× to allow shuffling without fetching the entire bank

  if (topicIds?.length) query = query.in("topic_id", topicIds);

  const { data } = await query;
  if (!data) return [];

  // Shuffle and return the requested count
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [data[i], data[j]] = [data[j], data[i]];
  }
  return data.slice(0, count);
}

export async function searchQuestions(examId: string, query: string) {
  const supabase = await createClient();
  const examUUID = await resolveExamSlug(supabase, examId);
  if (!examUUID) return [];

  const { data } = await supabase
    .from("questions")
    .select("*, topic:topics(id, name)")
    .eq("exam_id", examUUID)
    .ilike("question_text", `%${query}%`)
    .limit(20);

  return data ?? [];
}

export async function updateQuestionExplanation(id: string, explanation: string) {
  const supabase = await createClient();
  await supabase.from("questions").update({ explanation }).eq("id", id);
}
