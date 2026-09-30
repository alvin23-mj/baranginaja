import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { expireAllLapsedHolds } from "@/lib/orders";

export async function GET() {
  try {
    const supabase = await createClient();
    const result = await expireAllLapsedHolds(supabase);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      expiredCount: result.expiredCount,
      error: result.error,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
