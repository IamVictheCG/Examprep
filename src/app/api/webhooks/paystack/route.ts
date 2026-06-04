import { type NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createClient } from "@/lib/supabase/server";

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY ?? "";
  const expected = createHmac("sha512", secret).update(body).digest("hex");
  return expected === signature;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    data: {
      reference?: string;
      subscription_code?: string;
      metadata?: { userId?: string; examId?: string };
      customer?: { id?: string };
    };
  };

  const supabase = await createClient();

  if (event.event === "charge.success") {
    const ref    = event.data.reference;
    const meta   = event.data.metadata;
    const userId = meta?.userId;
    const examId = meta?.examId;

    if (ref && userId && examId) {
      const now     = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 30);

      await supabase.from("subscriptions").upsert(
        {
          user_id:                    userId,
          exam_id:                    examId,
          status:                     "active",
          start_date:                 now.toISOString(),
          end_date:                   endDate.toISOString(),
          paystack_subscription_code: ref,
        },
        { onConflict: "paystack_subscription_code" }
      );
    }
  }

  if (event.event === "subscription.disable") {
    const code = event.data.subscription_code;
    if (code) {
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("paystack_subscription_code", code);
    }
  }

  if (event.event === "invoice.payment_failed") {
    const code = event.data.subscription_code;
    if (code) {
      await supabase
        .from("subscriptions")
        .update({ status: "expired" })
        .eq("paystack_subscription_code", code);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
