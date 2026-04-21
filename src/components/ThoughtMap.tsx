"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { TopicTag } from "@/lib/types";
import { TOPIC_LABEL, TOPIC_TAGS } from "@/lib/topics";

type Props = {
  selectedTopic: TopicTag | null;
  onSelectTopic: (topic: TopicTag | null) => void;
  query: string;
  onQueryChange: (q: string) => void;
};

type Node = {
  id: string;
  label: string;
  topic?: TopicTag;
  x: number;
  y: number;
};

export function ThoughtMap({ selectedTopic, onSelectTopic, query, onQueryChange }: Props) {
  const { center, topics, radius } = useMemo(() => {
    const r = 160;
    const cx = 220;
    const cy = 220;
    const centerNode: Node = { id: "center", label: "Search", x: cx, y: cy };

    const topicNodes: Node[] = TOPIC_TAGS.map((t, i) => {
      const angle = (i / TOPIC_TAGS.length) * Math.PI * 2 - Math.PI / 2;
      return {
        id: `topic:${t}`,
        label: TOPIC_LABEL[t],
        topic: t,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      };
    });

    return { center: centerNode, topics: topicNodes, radius: r };
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">Thought map</div>
          <div className="text-xs text-slate-600">
            Click a topic node to filter submissions.
          </div>
        </div>
        <Link
          className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100"
          href="/submit"
        >
          Submit wisdom
        </Link>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-700">Search</label>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Try “office hours”, “burnout”, “presentation”…"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
        />
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
          <button
            type="button"
            onClick={() => onSelectTopic(null)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 hover:bg-slate-50"
          >
            Clear topic
          </button>
          {selectedTopic ? (
            <span className="truncate">
              Filtering by <span className="font-semibold">{TOPIC_LABEL[selectedTopic]}</span>
            </span>
          ) : (
            <span className="truncate">No topic selected</span>
          )}
        </div>
      </div>

      <svg viewBox="0 0 440 440" className="h-[420px] w-full">
        {/* edges */}
        {topics.map((t) => (
          <line
            key={`edge:${t.id}`}
            x1={center.x}
            y1={center.y}
            x2={t.x}
            y2={t.y}
            stroke="#e2e8f0"
            strokeWidth="2"
          />
        ))}

        {/* outer guide */}
        <circle
          cx={center.x}
          cy={center.y}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="2"
        />

        {/* center node */}
        <g>
          <circle cx={center.x} cy={center.y} r="56" fill="#0f172a" />
          <text
            x={center.x}
            y={center.y - 6}
            textAnchor="middle"
            className="select-none fill-white text-[14px] font-semibold"
          >
            Search
          </text>
          <text
            x={center.x}
            y={center.y + 14}
            textAnchor="middle"
            className="select-none fill-slate-200 text-[10px]"
          >
            community wisdom
          </text>
        </g>

        {/* topic nodes */}
        {topics.map((t) => {
          const isSelected = t.topic === selectedTopic;
          return (
            <g
              key={t.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectTopic(t.topic ?? null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectTopic(t.topic ?? null);
              }}
              className="cursor-pointer"
            >
              <circle
                cx={t.x}
                cy={t.y}
                r={36}
                fill={isSelected ? "#0ea5e9" : "#ffffff"}
                stroke={isSelected ? "#0284c7" : "#cbd5e1"}
                strokeWidth={isSelected ? 3 : 2}
              />
              <text
                x={t.x}
                y={t.y}
                textAnchor="middle"
                className={`select-none text-[10px] font-semibold ${
                  isSelected ? "fill-white" : "fill-slate-800"
                }`}
              >
                {t.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

