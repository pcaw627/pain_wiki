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
  contactEmail?: string;
  contactPhone?: string;
};

export type SortMode = "recent" | "likes";

