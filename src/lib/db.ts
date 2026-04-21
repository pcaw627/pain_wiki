import seed from "@/data/seedSubmissions.json";
import type { Submission, TopicTag } from "./types";
import { query } from "./pg";

type SeedSubmission = Submission;

export async function ensureSchema() {
  await query(`
    create table if not exists submissions (
      id text primary key,
      title text not null,
      body text not null,
      author_name text not null,
      contact_email text null,
      contact_phone text null,
      created_at timestamptz not null default now()
    );
  `);

  await query(`
    create table if not exists submission_tags (
      submission_id text not null references submissions(id) on delete cascade,
      tag text not null,
      primary key (submission_id, tag)
    );
  `);

  await query(`
    create table if not exists submission_likes (
      submission_id text primary key references submissions(id) on delete cascade,
      likes_count integer not null default 0
    );
  `);
}

export async function ensureSeedData() {
  await ensureSchema();

  const countRes = await query<{ count: number }>(`select count(*)::int as count from submissions;`);
  const count = countRes.rows?.[0]?.count ?? 0;
  if (count > 0) return;

  const seeds = seed as SeedSubmission[];

  for (const s of seeds) {
    await query(
      `
      insert into submissions (id, title, body, author_name, contact_email, contact_phone, created_at)
      values ($1, $2, $3, $4, $5, $6, $7::timestamptz)
      on conflict (id) do nothing;
    `,
      [
        s.id,
        s.title,
        s.body,
        s.authorName,
        s.contactEmail ?? null,
        s.contactPhone ?? null,
        s.createdAt
      ]
    );

    for (const t of s.tags) {
      await query(
        `
        insert into submission_tags (submission_id, tag)
        values ($1, $2)
        on conflict do nothing;
      `,
        [s.id, t]
      );
    }

    await query(
      `
      insert into submission_likes (submission_id, likes_count)
      values ($1, 0)
      on conflict (submission_id) do nothing;
    `,
      [s.id]
    );
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

  const orderBy =
    sort === "likes"
      ? `coalesce(l.likes_count, 0) desc, s.created_at desc`
      : `s.created_at desc`;

  const res = await query<{
    id: string;
    title: string;
    body: string;
    author_name: string;
    contact_email: string | null;
    contact_phone: string | null;
    created_at: string;
    likes: number;
    tags: string[];
  }>(
    `
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
      ($1::text is null or exists (
        select 1 from submission_tags stx where stx.submission_id = s.id and stx.tag = $1
      ))
      and ($2::text is null or (
        s.title ilike '%' || $2 || '%'
        or s.body ilike '%' || $2 || '%'
        or exists (
          select 1 from submission_tags st2
          where st2.submission_id = s.id and st2.tag ilike '%' || $2 || '%'
        )
      ))
    group by s.id, l.likes_count
    order by ${orderBy};
  `,
    [topic, q]
  );

  return res.rows.map((r: (typeof res.rows)[number]) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    tags: (r.tags ?? []) as TopicTag[],
    createdAt: new Date(r.created_at).toISOString(),
    authorName: r.author_name,
    contactEmail: r.contact_email ?? undefined,
    contactPhone: r.contact_phone ?? undefined,
    likes: r.likes ?? 0
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

  await query(
    `
    insert into submissions (id, title, body, author_name, contact_email, contact_phone, created_at)
    values ($1, $2, $3, $4, $5, $6, $7::timestamptz);
  `,
    [
      id,
      input.title,
      input.body,
      input.authorName,
      input.contactEmail ?? null,
      input.contactPhone ?? null,
      createdAt
    ]
  );

  for (const t of input.tags) {
    await query(
      `
      insert into submission_tags (submission_id, tag)
      values ($1, $2)
      on conflict do nothing;
    `,
      [id, t]
    );
  }

  await query(
    `
    insert into submission_likes (submission_id, likes_count)
    values ($1, 0)
    on conflict (submission_id) do nothing;
  `,
    [id]
  );

  return { id, createdAt };
}

export async function incrementLike(submissionId: string) {
  await ensureSeedData();
  const res = await query<{ likes_count: number }>(
    `
    insert into submission_likes (submission_id, likes_count)
    values ($1, 1)
    on conflict (submission_id)
    do update set likes_count = submission_likes.likes_count + 1
    returning likes_count;
  `,
    [submissionId]
  );
  return res.rows?.[0]?.likes_count ?? 0;
}

export async function decrementLike(submissionId: string) {
  await ensureSeedData();
  const res = await query<{ likes_count: number }>(
    `
    insert into submission_likes (submission_id, likes_count)
    values ($1, 0)
    on conflict (submission_id)
    do update set likes_count = greatest(submission_likes.likes_count - 1, 0)
    returning likes_count;
  `,
    [submissionId]
  );
  return res.rows?.[0]?.likes_count ?? 0;
}

