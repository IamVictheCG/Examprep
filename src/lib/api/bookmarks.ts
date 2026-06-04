"use server";

import { createClient } from "@/lib/supabase/server";

export async function getUserBookmarks(userId: string, examId: string) {
  const supabase = await createClient();

  const { data: examRow } = await supabase
    .from("exams")
    .select("id")
    .eq("slug", examId)
    .single();

  if (!examRow) return [];

  const { data } = await supabase
    .from("bookmarked_questions")
    .select("question_id, question:questions!inner(*, topic:topics(name))")
    .eq("user_id", userId)
    .eq("questions.exam_id", examRow.id);

  return data ?? [];
}

export async function getAllUserBookmarkIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookmarked_questions")
    .select("question_id")
    .eq("user_id", userId);
  return (data ?? []).map((b) => b.question_id);
}

export async function addBookmark(userId: string, questionId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("bookmarked_questions").insert({ user_id: userId, question_id: questionId });
}

export async function removeBookmark(userId: string, questionId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("bookmarked_questions")
    .delete()
    .eq("user_id", userId)
    .eq("question_id", questionId);
}

export async function isBookmarked(userId: string, questionId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookmarked_questions")
    .select("id")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle();
  return !!data;
}
