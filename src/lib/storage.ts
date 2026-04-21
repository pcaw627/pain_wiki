import type { Submission } from "./types";

const LS_SUBMISSIONS_KEY = "pain_wiki:user_submissions:v1";
const LS_LIKES_KEY = "pain_wiki:likes:v1";

type LikesState = {
  countsById: Record<string, number>;
  likedByMe: Record<string, true>;
};

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadUserSubmissions(): Submission[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParseJson<Submission[]>(window.localStorage.getItem(LS_SUBMISSIONS_KEY));
  if (!parsed) return [];
  return parsed.filter((s) => Boolean(s?.id && s?.title && s?.body && s?.createdAt));
}

export function saveUserSubmission(sub: Submission) {
  if (typeof window === "undefined") return;
  const existing = loadUserSubmissions();
  const next = [sub, ...existing];
  window.localStorage.setItem(LS_SUBMISSIONS_KEY, JSON.stringify(next));
}

export function loadLikes(): LikesState {
  if (typeof window === "undefined") return { countsById: {}, likedByMe: {} };
  const parsed = safeParseJson<LikesState>(window.localStorage.getItem(LS_LIKES_KEY));
  if (!parsed) return { countsById: {}, likedByMe: {} };
  return {
    countsById: parsed.countsById ?? {},
    likedByMe: parsed.likedByMe ?? {}
  };
}

export function toggleLike(id: string): LikesState {
  if (typeof window === "undefined") return { countsById: {}, likedByMe: {} };
  const current = loadLikes();
  const already = Boolean(current.likedByMe[id]);
  const currentCount = current.countsById[id] ?? 0;

  const next: LikesState = {
    countsById: {
      ...current.countsById,
      [id]: Math.max(0, currentCount + (already ? -1 : 1))
    },
    likedByMe: { ...current.likedByMe }
  };

  if (already) delete next.likedByMe[id];
  else next.likedByMe[id] = true;

  window.localStorage.setItem(LS_LIKES_KEY, JSON.stringify(next));
  return next;
}

