"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function updateProfile(
  userId: string,
  data: { fullName?: string; avatarUrl?: string }
): Promise<void> {
  const supabase = await createClient();
  const update: ProfileUpdate = { updated_at: new Date().toISOString() };
  if (data.fullName  !== undefined) update.full_name   = data.fullName;
  if (data.avatarUrl !== undefined) update.avatar_url  = data.avatarUrl;
  await supabase.from("profiles").update(update).eq("id", userId);
}

export async function updateStreak(userId: string): Promise<void> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, streak_last_date")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const today     = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const lastDate  = profile.streak_last_date;

  if (lastDate === today) return;

  const newStreak = lastDate === yesterday ? profile.streak_count + 1 : 1;

  await supabase
    .from("profiles")
    .update({
      streak_count:     newStreak,
      streak_last_date: today,
      updated_at:       new Date().toISOString(),
    })
    .eq("id", userId);
}
