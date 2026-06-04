import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamTutorResponse } from "@/lib/ai/tutor";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json() as {
    examId:   string;
    messages: { role: string; content: string }[];
  };

  const { examId, messages } = body;

  // Verify active subscription
  const { data: examRow } = await supabase
    .from("exams")
    .select("id, name, field")
    .eq("slug", examId)
    .single();

  if (!examRow) {
    return new Response("Exam not found", { status: 404 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("exam_id", examRow.id)
    .eq("status", "active")
    .gt("end_date", new Date().toISOString())
    .maybeSingle();

  if (!sub) {
    return new Response("No active subscription", { status: 403 });
  }

  // Rate limit: 20 messages in the last hour
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { data: recentSessions } = await supabase
    .from("ai_tutor_sessions")
    .select("messages")
    .eq("user_id", user.id)
    .gte("updated_at", oneHourAgo);

  const totalMessages = (recentSessions ?? []).reduce(
    (sum, s) => sum + (Array.isArray(s.messages) ? s.messages.length : 0),
    0
  );

  if (totalMessages > 20) {
    return new Response("Rate limit exceeded — try again in an hour", { status: 429 });
  }

  const stream = await streamTutorResponse(messages, {
    name:  examRow.name,
    field: examRow.field,
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
