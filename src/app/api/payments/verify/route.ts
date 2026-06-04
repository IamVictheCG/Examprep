import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyTransaction } from "@/lib/paystack/client";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(`${origin}/pricing?error=missing_reference`);
  }

  let txn: Awaited<ReturnType<typeof verifyTransaction>>;
  try {
    txn = await verifyTransaction(reference);
  } catch {
    return NextResponse.redirect(`${origin}/pricing?error=verify_failed`);
  }

  if (txn.status !== "success") {
    return NextResponse.redirect(`${origin}/pricing?error=payment_failed`);
  }

  const meta = txn.metadata as { userId?: string; examId?: string } | null;
  const userId = meta?.userId;
  const examId = meta?.examId;

  if (!userId || !examId) {
    return NextResponse.redirect(`${origin}/pricing?error=invalid_metadata`);
  }

  const supabase = await createClient();

  const now     = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 30);

  await supabase.from("subscriptions").insert({
    user_id:                    userId,
    exam_id:                    examId,
    status:                     "active",
    start_date:                 now.toISOString(),
    end_date:                   endDate.toISOString(),
    paystack_subscription_code: reference,
  });

  const { data: exam } = await supabase
    .from("exams")
    .select("slug")
    .eq("id", examId)
    .single();

  const slug = exam?.slug ?? "dashboard";
  return NextResponse.redirect(`${origin}/exam/${slug}`);
}
