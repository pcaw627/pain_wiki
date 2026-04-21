"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { TopicTag } from "@/lib/types";
import { TOPIC_LABEL, TOPIC_TAGS } from "@/lib/topics";
import { recommendTags } from "@/lib/tagging";

export function SubmitForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [shareEmail, setShareEmail] = useState(false);
  const [tags, setTags] = useState<TopicTag[]>(["building confidence"]);
  const [autoRecommended, setAutoRecommended] = useState<TopicTag[]>(["building confidence"]);
  const [notice, setNotice] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      title.trim().length >= 6 &&
      body.trim().length >= 80 &&
      authorName.trim().length >= 2 &&
      authorEmail.trim().includes("@") &&
      tags.length >= 1
    );
  }, [title, body, authorName, authorEmail, tags.length]);

  useEffect(() => {
    const rec = recommendTags({ title, body });
    setAutoRecommended(rec);
    if (tags.length === 0) setTags(rec);
  }, [title, body, tags.length]);

  function toggleTag(t: TopicTag) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function applyRecommended() {
    setTags(autoRecommended);
  }

  function onSubmit() {
    setNotice(null);
    const trimmedEmail = authorEmail.trim();

    fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        body: body.trim(),
        tags,
        authorName: authorName.trim(),
        authorEmail: trimmedEmail,
        shareEmail
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error ?? "Failed to save");
        }
        setNotice("Saved to the community database. Go back to the map to see it in the feed.");
        setTitle("");
        setBody("");
        setAuthorName("");
        setAuthorEmail("");
        setShareEmail(false);
        setTags(["building confidence"]);
      })
      .catch((e: unknown) => {
        setNotice(e instanceof Error ? e.message : "Failed to save");
      });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Submit wisdom</div>
      <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Share what helped you—specific, kind, and practical. Email is required; sharing it is optional.
      </div>

      {notice && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {notice}
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
            placeholder="Ex: ‘How I got over my fear of office hours’"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
            Your story / wisdom
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 min-h-[180px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none ring-slate-300 focus:ring-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
            placeholder="2–3 paragraphs is perfect. What happened, what changed, what you’d tell someone else…"
          />
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-500">Aim for 80+ characters.</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">Name</label>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
              placeholder="First name + last initial is fine"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
              Email (required)
            </label>
            <div className="mt-1 grid gap-2">
              <input
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
                placeholder="you@school.edu"
              />
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={shareEmail}
                  onChange={(e) => setShareEmail(e.target.checked)}
                />
                Share my email?
              </label>
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">Tags</label>
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Recommended:{" "}
            <span className="font-semibold">
              {autoRecommended.map((t) => TOPIC_LABEL[t]).join(", ")}
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {TOPIC_TAGS.map((t) => {
              const checked = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                    checked
                      ? "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-200"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  }`}
                  aria-pressed={checked}
                >
                  <span className="font-medium">{TOPIC_LABEL[t]}</span>
                  <span className="text-xs">{checked ? "Selected" : "Add"}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">Pick 1–3 tags.</div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900"
          >
            Save submission
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Back to map
          </Link>
        </div>
      </div>
    </div>
  );
}

