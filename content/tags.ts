/**
 * Canonical tag definitions for ActiveNerds.
 *
 * Post frontmatter `tags` values must match slugs from this list.
 */

export interface TagRef {
  slug: string;
  name: string;
  count: number;
}

export const tags: TagRef[] = [
  { slug: "kubernetes", name: "Kubernetes", count: 0 },
  { slug: "mlops", name: "MLOps", count: 0 },
  { slug: "llms", name: "LLMs", count: 0 },
  { slug: "pytorch", name: "PyTorch", count: 0 },
  { slug: "docker", name: "Docker", count: 0 },
  { slug: "devsecops", name: "DevSecOps", count: 0 },
  { slug: "standing-desk", name: "Standing Desk", count: 0 },
  { slug: "desk-stretches", name: "Desk Stretches", count: 0 },
  { slug: "habit-building", name: "Habit Building", count: 0 },
  { slug: "ergonomics", name: "Ergonomics", count: 0 },
  { slug: "deep-work", name: "Deep Work", count: 0 },
  { slug: "conferences", name: "Conferences", count: 0 },
  { slug: "fitness-trackers", name: "Fitness Trackers", count: 0 },
  { slug: "affiliate", name: "Affiliate", count: 0 },
];
