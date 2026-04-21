import type { Submission, TopicTag } from "./types";
import { TOPIC_TAGS } from "./topics";

const KEYWORDS: Record<TopicTag, string[]> = {
  "communication styles": [
    "communication",
    "communicate",
    "misunderstood",
    "feedback",
    "conflict",
    "tone",
    "listen",
    "listening",
    "conversation",
    "email",
    "text"
  ],
  "building confidence": [
    "confidence",
    "imposter",
    "impostor",
    "self-doubt",
    "anxiety",
    "fear",
    "shy",
    "belong",
    "belonging"
  ],
  "impact/initiative": [
    "initiative",
    "impact",
    "ownership",
    "proactive",
    "drive",
    "project",
    "ship",
    "execution",
    "results"
  ],
  academics: [
    "class",
    "grades",
    "exam",
    "tests",
    "study",
    "office hours",
    "homework",
    "gpa",
    "major",
    "course"
  ],
  family: [
    "family",
    "parents",
    "home",
    "caregiver",
    "siblings",
    "responsibility",
    "support",
    "expectations"
  ],
  "building trust": [
    "trust",
    "reliability",
    "dependable",
    "integrity",
    "follow through",
    "follow-through",
    "promises",
    "credibility"
  ],
  leadership: [
    "leader",
    "leadership",
    "mentor",
    "team",
    "manage",
    "influence",
    "delegate",
    "vision"
  ],
  "hard decisions": [
    "decision",
    "hard choice",
    "tradeoff",
    "trade-off",
    "quit",
    "leave",
    "switch",
    "say no",
    "burnout"
  ],
  "public speaking": [
    "presentation",
    "present",
    "public speaking",
    "speech",
    "stage",
    "slides",
    "talk",
    "audience",
    "nervous"
  ]
};

function scoreTextForTag(text: string, tag: TopicTag): number {
  const t = text.toLowerCase();
  let score = 0;
  for (const kw of KEYWORDS[tag]) {
    if (t.includes(kw)) score += 1;
  }
  return score;
}

export function recommendTags(input: { title: string; body: string }): TopicTag[] {
  const text = `${input.title}\n${input.body}`.trim();
  const scored = TOPIC_TAGS.map((tag) => ({
    tag,
    score: scoreTextForTag(text, tag)
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return ["building confidence"];
  return scored.slice(0, 3).map((x) => x.tag);
}

export function matchesQuery(sub: Submission, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = `${sub.title}\n${sub.body}\n${sub.tags.join(" ")}`.toLowerCase();
  return hay.includes(q);
}

