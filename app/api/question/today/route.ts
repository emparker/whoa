import { NextRequest, NextResponse } from "next/server";
import { getTodayQuestion } from "@/lib/questions";

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date") ?? undefined;
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : undefined;
  return NextResponse.json(getTodayQuestion(date));
}
