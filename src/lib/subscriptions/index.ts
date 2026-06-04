"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
type Exam = Database["public"]["Tables"]["exams"]["Row"];

export async function getUserSubscriptions(
  userId: string
): Promise<(Subscription & { exam: Exam | null })[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("*, exam:exams(*)")
    .eq("user_id", userId);

  return (data ?? []) as (Subscription & { exam: Exam | null })[];
}

export async function hasActiveSubscription(
  userId: string,
  examSlug: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data: examRow } = await supabase
    .from("exams")
    .select("id")
    .eq("slug", examSlug)
    .single();

  if (!examRow) return false;

  const { data } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("exam_id", examRow.id)
    .eq("status", "active")
    .gt("end_date", new Date().toISOString())
    .maybeSingle();

  return !!data;
}

export async function getSubscribedExams(userId: string): Promise<Exam[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("exam:exams(*)")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("end_date", new Date().toISOString());

  return ((data ?? []) as { exam: Exam | null }[])
    .map((d) => d.exam)
    .filter((e): e is Exam => e !== null);
}
