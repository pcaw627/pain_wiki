"use client";

import type { Submission, TopicTag } from "@/lib/types";
import { TOPIC_LABEL } from "@/lib/topics";

export function SubmissionCard({
  submission,
  likes,
  likedByMe,
  onToggleLike,
  onTagClick
}: {
  submission: Submission;
  likes: number;
  likedByMe: boolean;
  onToggleLike: () => void;
  onTagClick: (tag: TopicTag) => void;
}) {
  const firstName = submission.authorName.trim().split(/\s+/)[0] || submission.authorName;
  const created = new Date(submission.createdAt);
  const createdLabel = Number.isNaN(created.getTime())
    ? submission.createdAt
    : created.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {submission.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
            <span className="truncate">by {submission.authorName}</span>
            <span className="text-slate-300">•</span>
            <span>{createdLabel}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleLike}
          className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
            likedByMe
              ? "border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-200 dark:hover:bg-sky-950/40"
              : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          }`}
          aria-pressed={likedByMe}
        >
          {likedByMe ? "Liked" : "Like"} · {likes}
        </button>
      </div>

      <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800 dark:text-slate-200">
        {submission.body}
      </div>

      {submission.shareEmail && submission.authorEmail && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          If you want to reach out to {firstName} and ask more, contact them via{" "}
          <a className="font-semibold underline" href={`mailto:${submission.authorEmail}`}>
            {submission.authorEmail}
          </a>
          .
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {submission.tags.map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => onTagClick(t)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {TOPIC_LABEL[t]}
          </button>
        ))}
      </div>
    </article>
  );
}

