"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(
  formData: FormData
): Promise<{ success: true } | { error: string }> {
  const fullName = (formData.get("fullName") as string | null)?.trim() ?? "";
  const email    = (formData.get("email")    as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo:
        (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000") +
        "/auth/callback",
    },
  });

  if (error) return { error: error.message };

  if (data.user) {
    await supabase
      .from("profiles")
      .upsert({ id: data.user.id, full_name: fullName });
  }

  return { success: true };
}

export async function signIn(
  formData: FormData
): Promise<{ error: string }> {
  const email    = (formData.get("email")    as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password" };

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(
  email: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  const redirectTo =
    (process.env.NEXT_PUBLIC_SITE_URL ?? "") + "/auth/callback?next=/account";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePassword(
  newPassword: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { success: true };
}
