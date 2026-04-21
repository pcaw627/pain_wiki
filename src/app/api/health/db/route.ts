import { NextResponse } from "next/server";
import { query } from "@/lib/pg";

export const runtime = "nodejs";

export async function GET() {
  try {
    const hasPostgresUrl = Boolean(process.env.POSTGRES_URL);
    const hasPostgresPrismaUrl = Boolean(process.env.POSTGRES_PRISMA_URL);
    const hasPostgresUrlNonPooling = Boolean(process.env.POSTGRES_URL_NON_POOLING);

    const res = await query<{ ok: number }>("select 1 as ok;");
    return NextResponse.json({
      ok: true,
      env: {
        POSTGRES_URL: hasPostgresUrl,
        POSTGRES_PRISMA_URL: hasPostgresPrismaUrl,
        POSTGRES_URL_NON_POOLING: hasPostgresUrlNonPooling
      },
      probe: res.rows?.[0] ?? null
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "DB health check failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

