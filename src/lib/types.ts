export type TopicTag =
  | "communication styles"
  | "building confidence"
  | "impact/initiative"
  | "academics"
  | "family"
  | "building trust"
  | "leadership"
  | "hard decisions"
  | "public speaking";

export type Submission = {
  id: string;
  title: string;
  body: string;
  tags: TopicTag[];
  createdAt: string; // ISO
  authorName: string;
  authorEmail: string;
  shareEmail: boolean;
};

export type SortMode = "recent" | "likes";

