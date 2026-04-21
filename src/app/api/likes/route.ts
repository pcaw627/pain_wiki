import { NextResponse } from "next/server";
import { incrementLike } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as unknown;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const id = (body as { id?: unknown }).id;
    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const likes = await incrementLike(id.trim());
    return NextResponse.json({ ok: true, likes });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to like submission";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

