"use client";

import { useMemo, useRef, useState } from "react";
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
    const r = 165;
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

  const svgRef = useRef<SVGSVGElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);

  function toggleTopic(t: TopicTag | null) {
    if (!t) return onSelectTopic(null);
    onSelectTopic(selectedTopic === t ? null : t);
  }

  function setMouseFromEvent(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 440;
    const y = ((e.clientY - rect.top) / rect.height) * 440;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setMouse({ x, y }));
  }

  function clearMouse() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setMouse(null);
  }

  function nodeTransform(node: Node) {
    if (!mouse) return "";
    const dx = mouse.x - node.x;
    const dy = mouse.y - node.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // influence: 0..1 within radius
    const influenceRadius = 140;
    const t = Math.max(0, Math.min(1, 1 - dist / influenceRadius));
    if (t <= 0) return "";

    // pull a few px toward cursor + a subtle scale
    const pull = 10 * t;
    const ux = dx / (dist || 1);
    const uy = dy / (dist || 1);
    const tx = ux * pull;
    const ty = uy * pull;
    const scale = 1 + 0.08 * t;
    return `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(3)})`;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Filter by topic...</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Click a topic below to find the gems & stories that can help you on your path.</div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Search</label>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Try “office hours”, “burnout”, “presentation”…"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
        />
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => toggleTopic(null)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
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

      <svg
        ref={svgRef}
        viewBox="0 0 440 440"
        className="h-[440px] w-full"
        onMouseMove={setMouseFromEvent}
        onMouseLeave={clearMouse}
      >
        {/* edges */}
        {topics.map((t) => (
          <line
            key={`edge:${t.id}`}
            x1={center.x}
            y1={center.y}
            x2={t.x}
            y2={t.y}
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-200 dark:text-slate-800"
          />
        ))}

        {/* outer guide */}
        <circle
          cx={center.x}
          cy={center.y}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-slate-100 dark:text-slate-900"
        />

        {/* center node */}
        <g>
          <circle cx={center.x} cy={center.y} r="54" className="fill-slate-900 dark:fill-slate-50" />
          <text
            x={center.x}
            y={center.y - 6}
            textAnchor="middle"
            className="select-none fill-white text-[14px] font-semibold dark:fill-slate-900"
          >
            Find wisdom
          </text>
          <text
            x={center.x}
            y={center.y + 14}
            textAnchor="middle"
            className="select-none fill-slate-200 text-[10px] dark:fill-slate-600"
          >
            about…
          </text>
        </g>

        {/* topic nodes */}
        {topics.map((t) => {
          const isSelected = t.topic === selectedTopic;
          const transform = nodeTransform(t);
          return (
            <g
              key={t.id}
              role="button"
              tabIndex={0}
              onClick={() => toggleTopic(t.topic ?? null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleTopic(t.topic ?? null);
              }}
              className="cursor-pointer focus:outline-none focus-visible:outline-none"
              transform={transform || undefined}
            >
              {/* selection outline (behind text) */}
              {isSelected && (
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={42}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="text-sky-300/70 dark:text-sky-500/40"
                />
              )}
              <circle
                cx={t.x}
                cy={t.y}
                r={36}
                fill={isSelected ? "#e0f2fe" : "#ffffff"}
                stroke="currentColor"
                strokeWidth={2}
                className={
                  isSelected
                    ? "text-sky-200 dark:fill-slate-900 dark:text-slate-700"
                    : "text-slate-300 dark:fill-slate-900 dark:text-slate-700"
                }
              />
              <text
                x={t.x}
                y={t.y}
                textAnchor="middle"
                className="select-none fill-slate-800 text-[10px] font-semibold dark:fill-slate-200"
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

