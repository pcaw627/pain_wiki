"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SortMode, Submission, TopicTag } from "@/lib/types";
import { SubmissionCard } from "./SubmissionCard";
import { TOPIC_LABEL } from "@/lib/topics";

type LikesState = {
  countsById: Record<string, number>;
  likedByMe: Record<string, boolean>;
};

function loadLikedByMe(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return (JSON.parse(window.localStorage.getItem("pain_wiki:liked_by_me:v1") ?? "{}") ??
      {}) as Record<string, boolean>;
  } catch {
    return {};
  }
}

function saveLikedByMe(next: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("pain_wiki:liked_by_me:v1", JSON.stringify(next));
}

export function SubmissionList({
  selectedTopic,
  query,
  sortMode,
  onSortModeChange,
  onSelectTopic
}: {
  selectedTopic: TopicTag | null;
  query: string;
  sortMode: SortMode;
  onSortModeChange: (m: SortMode) => void;
  onSelectTopic: (t: TopicTag | null) => void;
}) {
  const [subs, setSubs] = useState<Array<Submission & { likes?: number }>>([]);
  const [likesState, setLikesState] = useState<LikesState>({ countsById: {}, likedByMe: {} });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setLikesState((prev) => ({ ...prev, likedByMe: loadLikedByMe() }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setLoadError(null);
      try {
        const sp = new URLSearchParams();
        if (selectedTopic) sp.set("topic", selectedTopic);
        if (query.trim()) sp.set("q", query.trim());
        sp.set("sort", sortMode);
        const res = await fetch(`/api/submissions?${sp.toString()}`, { cache: "no-store" });
        const raw = await res.text();
        const json = (raw ? JSON.parse(raw) : null) as
          | { submissions: Array<Submission & { likes: number }> }
          | { error?: string }
          | null;
        if (!res.ok) {
          const message =
            (json && "error" in json && typeof json.error === "string" && json.error) ||
            raw ||
            `Request failed (${res.status})`;
          throw new Error(message);
        }
        if (cancelled) return;
        const submissions = (json && "submissions" in json ? json.submissions : []) ?? [];
        setSubs(submissions);
        setLikesState((prev) => {
          const nextCounts: Record<string, number> = {};
          for (const s of submissions ?? []) nextCounts[s.id] = s.likes ?? 0;
          return { ...prev, countsById: nextCounts };
        });
      } catch (e: unknown) {
        if (!cancelled) {
          setSubs([]);
          setLoadError(e instanceof Error ? e.message : "Failed to load submissions");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedTopic, query, sortMode]);

  const shown = useMemo(() => subs, [subs]);

  async function toggleLike(id: string) {
    const wasLiked = Boolean(likesState.likedByMe[id]);

    setLikesState((prev) => {
      const nextLiked = { ...prev.likedByMe };
      if (wasLiked) delete nextLiked[id];
      else nextLiked[id] = true;
      saveLikedByMe(nextLiked);
      return {
        countsById: {
          ...prev.countsById,
          [id]: Math.max(0, (prev.countsById[id] ?? 0) + (wasLiked ? -1 : 1))
        },
        likedByMe: nextLiked
      };
    });

    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action: wasLiked ? "unlike" : "like" })
    });
    if (!res.ok) {
      // revert optimistic update on failure
      setLikesState((prev) => {
        const nextLiked = { ...prev.likedByMe };
        if (wasLiked) nextLiked[id] = true;
        else delete nextLiked[id];
        saveLikedByMe(nextLiked);
        return {
          countsById: {
            ...prev.countsById,
            [id]: Math.max(0, (prev.countsById[id] ?? 0) + (wasLiked ? 1 : -1))
          },
          likedByMe: nextLiked
        };
      });
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Gems & Stories{" "}
            <span className="font-normal text-slate-500 dark:text-slate-400">
              ({shown.length}
              {selectedTopic ? ` in ${TOPIC_LABEL[selectedTopic]}` : ""}
              {query.trim() ? ` matching “${query.trim()}”` : ""})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Sort by…</span>
          <button
            type="button"
            onClick={() => onSortModeChange("recent")}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
              sortMode === "recent"
                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Recent
          </button>
          <button
            type="button"
            onClick={() => onSortModeChange("likes")}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
              sortMode === "likes"
                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Likes
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div
                className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-200"
                aria-hidden="true"
              />
              <span>Loading submissions…</span>
            </div>
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <div className="font-semibold">Couldn’t load submissions</div>
            <div className="mt-1 whitespace-pre-wrap text-rose-800">{loadError}</div>
            <div className="mt-2 text-xs text-rose-700">
              Tip: open your Vercel deployment logs to see the server-side error.
            </div>
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
            No matches yet. Try a different search or topic, or{" "}
            <Link className="font-semibold underline" href="/submit">
              share your wisdom...
            </Link>
            .
          </div>
        ) : (
          shown.map((s) => (
            <SubmissionCard
              key={s.id}
              submission={s as Submission}
              likes={likesState.countsById[s.id] ?? 0}
              likedByMe={Boolean(likesState.likedByMe[s.id])}
              onToggleLike={() => toggleLike(s.id)}
              onTagClick={(t) => onSelectTopic(t)}
            />
          ))
        )}
      </div>
    </div>
  );
}

