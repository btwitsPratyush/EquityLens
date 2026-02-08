// GET /api/portfolio - returns the static holdings from our json file
import { NextResponse } from "next/server";
import portfolio from "@/data/portfolio.json";

export async function GET() {
  return NextResponse.json(portfolio);
}
