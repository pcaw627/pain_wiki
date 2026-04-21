import { sql } from "@vercel/postgres";
import seed from "@/data/seedSubmissions.json";
import type { Submission, TopicTag } from "./types";

type SeedSubmission = Submission;

export async function ensureSchema() {
  await sql`
    create table if not exists submissions (
      id text primary key,
      title text not null,
      body text not null,
      author_name text not null,
      contact_email text null,
      contact_phone text null,
      created_at timestamptz not null default now()
    );
  `;

  await sql`
    create table if not exists submission_tags (
      submission_id text not null references submissions(id) on delete cascade,
      tag text not null,
      primary key (submission_id, tag)
    );
  `;

  await sql`
    create table if not exists submission_likes (
      submission_id text primary key references submissions(id) on delete cascade,
      likes_count integer not null default 0
    );
  `;
}

export async function ensureSeedData() {
  await ensureSchema();

  const countRes = await sql`select count(*)::int as count from submissions;`;
  const count = (countRes.rows?.[0]?.count ?? 0) as number;
  if (count > 0) return;

  const seeds = seed as SeedSubmission[];

  for (const s of seeds) {
    await sql`
      insert into submissions (id, title, body, author_name, contact_email, contact_phone, created_at)
      values (${s.id}, ${s.title}, ${s.body}, ${s.authorName}, ${s.contactEmail ?? null}, ${s.contactPhone ?? null}, ${s.createdAt}::timestamptz)
      on conflict (id) do nothing;
    `;

    for (const t of s.tags) {
      await sql`
        insert into submission_tags (submission_id, tag)
        values (${s.id}, ${t})
        on conflict do nothing;
      `;
    }

    await sql`
      insert into submission_likes (submission_id, likes_count)
      values (${s.id}, 0)
      on conflict (submission_id) do nothing;
    `;
  }
}

export async function listSubmissions(params: {
  topic?: TopicTag | null;
  query?: string | null;
  sort?: "recent" | "likes" | null;
}): Promise<Array<Submission & { likes: number }>> {
  await ensureSeedData();

  const topic = params.topic?.trim() || null;
  const q = params.query?.trim() || null;
  const sort = params.sort ?? "recent";

  const baseQuery =
    sort === "likes"
      ? sql`
          select
            s.id,
            s.title,
            s.body,
            s.author_name,
            s.contact_email,
            s.contact_phone,
            s.created_at,
            coalesce(l.likes_count, 0) as likes,
            coalesce(array_agg(st.tag) filter (where st.tag is not null), '{}') as tags
          from submissions s
          left join submission_likes l on l.submission_id = s.id
          left join submission_tags st on st.submission_id = s.id
          where
            (${topic}::text is null or exists (
              select 1 from submission_tags stx where stx.submission_id = s.id and stx.tag = ${topic}
            ))
            and (${q}::text is null or (
              s.title ilike '%' || ${q} || '%'
              or s.body ilike '%' || ${q} || '%'
              or exists (
                select 1 from submission_tags st2
                where st2.submission_id = s.id and st2.tag ilike '%' || ${q} || '%'
              )
            ))
          group by s.id, l.likes_count
          order by coalesce(l.likes_count, 0) desc, s.created_at desc;
        `
      : sql`
          select
            s.id,
            s.title,
            s.body,
            s.author_name,
            s.contact_email,
            s.contact_phone,
            s.created_at,
            coalesce(l.likes_count, 0) as likes,
            coalesce(array_agg(st.tag) filter (where st.tag is not null), '{}') as tags
          from submissions s
          left join submission_likes l on l.submission_id = s.id
          left join submission_tags st on st.submission_id = s.id
          where
            (${topic}::text is null or exists (
              select 1 from submission_tags stx where stx.submission_id = s.id and stx.tag = ${topic}
            ))
            and (${q}::text is null or (
              s.title ilike '%' || ${q} || '%'
              or s.body ilike '%' || ${q} || '%'
              or exists (
                select 1 from submission_tags st2
                where st2.submission_id = s.id and st2.tag ilike '%' || ${q} || '%'
              )
            ))
          group by s.id, l.likes_count
          order by s.created_at desc;
        `;

  const res = await baseQuery;

  return res.rows.map((r) => ({
    id: r.id as string,
    title: r.title as string,
    body: r.body as string,
    tags: ((r.tags as unknown as string[]) ?? []) as TopicTag[],
    createdAt: new Date(r.created_at as unknown as string).toISOString(),
    authorName: r.author_name as string,
    contactEmail: (r.contact_email as string | null) ?? undefined,
    contactPhone: (r.contact_phone as string | null) ?? undefined,
    likes: (r.likes as number) ?? 0
  }));
}

export async function createSubmission(input: {
  title: string;
  body: string;
  tags: TopicTag[];
  authorName: string;
  contactEmail?: string;
  contactPhone?: string;
}) {
  await ensureSeedData();

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `sub-${Date.now()}`;
  const createdAt = new Date().toISOString();

  await sql`
    insert into submissions (id, title, body, author_name, contact_email, contact_phone, created_at)
    values (${id}, ${input.title}, ${input.body}, ${input.authorName}, ${input.contactEmail ?? null}, ${input.contactPhone ?? null}, ${createdAt}::timestamptz);
  `;

  for (const t of input.tags) {
    await sql`
      insert into submission_tags (submission_id, tag)
      values (${id}, ${t})
      on conflict do nothing;
    `;
  }

  await sql`
    insert into submission_likes (submission_id, likes_count)
    values (${id}, 0)
    on conflict (submission_id) do nothing;
  `;

  return { id, createdAt };
}

export async function incrementLike(submissionId: string) {
  await ensureSeedData();
  const res = await sql`
    insert into submission_likes (submission_id, likes_count)
    values (${submissionId}, 1)
    on conflict (submission_id)
    do update set likes_count = submission_likes.likes_count + 1
    returning likes_count;
  `;
  return (res.rows?.[0]?.likes_count ?? 0) as number;
}

