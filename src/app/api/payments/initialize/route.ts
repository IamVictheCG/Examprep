import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as { examId?: string };
  const { examId } = body;

  if (!examId) {
    return NextResponse.json({ error: "examId required" }, { status: 400 });
  }

  const { data: exam } = await supabase
    .from("exams")
    .select("id, name, price_monthly, slug")
    .eq("slug", examId)
    .single();

  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("exam_id", exam.id)
    .eq("status", "active")
    .gt("end_date", new Date().toISOString())
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "You already have an active subscription for this exam" },
      { status: 400 }
    );
  }

  const amountKobo = exam.price_monthly * 100;

  const { authorization_url } = await initializeTransaction(
    user.email ?? "",
    amountKobo,
    { userId: user.id, examId: exam.id }
  );

  return NextResponse.json({ authorization_url });
}
