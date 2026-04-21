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
  const created = new Date(submission.createdAt);
  const createdLabel = Number.isNaN(created.getTime())
    ? submission.createdAt
    : created.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{submission.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
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
              ? "border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100"
              : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
          }`}
          aria-pressed={likedByMe}
        >
          {likedByMe ? "Liked" : "Like"} · {likes}
        </button>
      </div>

      <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
        {submission.body}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {submission.tags.map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => onTagClick(t)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            {TOPIC_LABEL[t]}
          </button>
        ))}
      </div>

      {(submission.contactEmail || submission.contactPhone) && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <div className="font-semibold text-slate-800">Optional contact</div>
          <div className="mt-1 space-y-1">
            {submission.contactEmail && (
              <div>
                Email:{" "}
                <a className="font-medium underline" href={`mailto:${submission.contactEmail}`}>
                  {submission.contactEmail}
                </a>
              </div>
            )}
            {submission.contactPhone && <div>Phone: {submission.contactPhone}</div>}
          </div>
        </div>
      )}
    </article>
  );
}

