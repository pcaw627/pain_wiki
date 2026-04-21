import { NextResponse } from "next/server";
import type { SortMode, TopicTag } from "@/lib/types";
import { createSubmission, listSubmissions } from "@/lib/db";
import { TOPIC_TAGS } from "@/lib/topics";

export const runtime = "nodejs";

function isTopicTag(x: unknown): x is TopicTag {
  return typeof x === "string" && (TOPIC_TAGS as readonly string[]).includes(x);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const topicRaw = searchParams.get("topic");
    const query = searchParams.get("q");
    const sortRaw = searchParams.get("sort");

    const topic = topicRaw && isTopicTag(topicRaw) ? (topicRaw as TopicTag) : null;
    const sort: SortMode = sortRaw === "likes" ? "likes" : "recent";

    const rows = await listSubmissions({ topic, query, sort });
    return NextResponse.json({ submissions: rows });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load submissions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as unknown;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const b = body as {
      title?: unknown;
      body?: unknown;
      tags?: unknown;
      authorName?: unknown;
      contactEmail?: unknown;
      contactPhone?: unknown;
    };

    const title = typeof b.title === "string" ? b.title.trim() : "";
    const story = typeof b.body === "string" ? b.body.trim() : "";
    const authorName = typeof b.authorName === "string" ? b.authorName.trim() : "";

    const tags =
      Array.isArray(b.tags) && b.tags.every(isTopicTag)
        ? (b.tags as TopicTag[])
        : ([] as TopicTag[]);

    const contactEmail = typeof b.contactEmail === "string" ? b.contactEmail.trim() : "";
    const contactPhone = typeof b.contactPhone === "string" ? b.contactPhone.trim() : "";

    if (title.length < 6) return NextResponse.json({ error: "Title too short" }, { status: 400 });
    if (story.length < 80) return NextResponse.json({ error: "Story too short" }, { status: 400 });
    if (authorName.length < 2)
      return NextResponse.json({ error: "Name too short" }, { status: 400 });
    if (tags.length < 1)
      return NextResponse.json({ error: "Pick at least 1 tag" }, { status: 400 });

    const created = await createSubmission({
      title,
      body: story,
      tags,
      authorName,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined
    });

    return NextResponse.json({ ok: true, id: created.id, createdAt: created.createdAt });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to save submission";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

