"use server";

import { createClient } from "@/lib/supabase/server";

async function resolveExamSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string
): Promise<string | null> {
  const { data } = await supabase.from("exams").select("id").eq("slug", slug).single();
  return data?.id ?? null;
}

export async function createFlashcardSession(
  userId: string,
  examId: string,
  topicId?: string
): Promise<string> {
  const supabase = await createClient();
  const examUUID = await resolveExamSlug(supabase, examId);
  if (!examUUID) throw new Error("Exam not found");

  const { data, error } = await supabase
    .from("flashcard_sessions")
    .insert({
      user_id:  userId,
      exam_id:  examUUID,
      topic_id: topicId ?? null,
      cards_reviewed:    0,
      got_it_count:      0,
      review_again_count: 0,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function completeFlashcardSession(
  sessionId: string,
  gotIt: number,
  reviewAgain: number
): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("flashcard_sessions")
    .update({
      cards_reviewed:     gotIt + reviewAgain,
      got_it_count:       gotIt,
      review_again_count: reviewAgain,
    })
    .eq("id", sessionId);
}
