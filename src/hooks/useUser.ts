"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useUser(): { user: User | null; profile: Profile | null; loading: boolean } {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let _client: ReturnType<typeof createClient>;
    try {
      _client = createClient();
    } catch {
      setLoading(false);
      return;
    }
    const supabase = _client;

    async function fetchProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data);
    }

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) await fetchProfile(currentUser.id);
      } catch {
        // Supabase not configured — silently fail
      } finally {
        setLoading(false);
      }
    }

    init();

    let unsubscribe: (() => void) | undefined;
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            await fetchProfile(currentUser.id);
          } else {
            setProfile(null);
          }
        }
      );
      unsubscribe = () => subscription.unsubscribe();
    } catch {
      // ignore
    }

    return () => unsubscribe?.();
  }, []);

  return { user, profile, loading };
}
