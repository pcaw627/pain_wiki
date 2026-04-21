"use client";

import { useState } from "react";
import type { SortMode, TopicTag } from "@/lib/types";
import { ThoughtMap } from "@/components/ThoughtMap";
import { SubmissionList } from "@/components/SubmissionList";

export default function HomePage() {
  const [selectedTopic, setSelectedTopic] = useState<TopicTag | null>(null);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900">Pain Wiki</div>
            <div className="text-xs text-slate-600">
              Community wisdom for profs, students, and alumni — scaled.
            </div>
          </div>
          <a
            href="/submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Submit wisdom
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[460px_1fr]">
        <ThoughtMap
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
          query={query}
          onQueryChange={setQuery}
        />
        <SubmissionList
          selectedTopic={selectedTopic}
          query={query}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          onSelectTopic={setSelectedTopic}
        />
      </div>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-slate-500" />
    </main>
  );
}

