import { z } from "zod";

/**
 * Checklist frontmatter validation schema.
 *
 * Checklists live under `content/pages/resources/checklists/*.mdx` and are
 * surfaced through the dedicated `/resources/checklists` index. They reuse
 * the site's MDX rendering pipeline (precompiled at build time) but carry a
 * lighter metadata contract than full articles — no author profile page, no
 * series, no i18n — just the fields an interactive audit checklist needs.
 *
 * TypeScript types are inferred from this Zod schema so validation and types
 * never drift.
 */

/** The four checklist collections, matching the nav dropdown. */
export const CHECKLIST_CATEGORIES = ["ai-ml", "kubernetes", "devsecops", "active-tech"] as const;

export type ChecklistCategory = (typeof CHECKLIST_CATEGORIES)[number];

export const checklistCategoryLabels: Record<ChecklistCategory, string> = {
  "ai-ml": "AI & LLM Systems",
  kubernetes: "Kubernetes & Cloud-Native",
  devsecops: "DevSecOps & Cloud Architecture",
  "active-tech": "Active Desk & Tech Ergonomics",
};

export const checklistCategoryDescriptions: Record<ChecklistCategory, string> = {
  "ai-ml": "Production readiness, RAG hardening, and agent safety audits for AI/ML systems.",
  kubernetes: "Cluster go-live, incident response, and multi-tenant isolation checklists.",
  devsecops: "Supply chain, cloud security baselines, and zero-trust container build audits.",
  "active-tech": "Ergonomic workspace, on-call physical resets, and standing-desk protocols.",
};

/** ISO date string (YYYY-MM-DD or full ISO 8601). */
const isoDate = z
  .string()
  .min(1, "lastUpdated is required")
  .refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "lastUpdated must be a valid ISO 8601 date",
  });

/** Non-empty string. */
const nonEmpty = (field: string) => z.string().min(1, `${field} is required`);

/**
 * Raw frontmatter as it appears in a checklist MDX file.
 * Required fields: title, description, category, slug, lastUpdated.
 */
export const checklistSchema = z.object({
  title: nonEmpty("title"),
  description: nonEmpty("description"),
  category: z.enum(CHECKLIST_CATEGORIES, {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return {
          message: `category must be one of: ${CHECKLIST_CATEGORIES.join(", ")}`,
        };
      }
      return { message: ctx.defaultError };
    },
  }),
  slug: nonEmpty("slug"),
  lastUpdated: isoDate,
  tags: z.array(z.string().min(1)).max(8).default([]),
  /** Optional hero image (mirrors the article convention). */
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  published: z.boolean().default(true),
});

/** Inferred type of validated checklist frontmatter. */
export type ChecklistFrontmatter = z.infer<typeof checklistSchema>;

/**
 * A resolved checklist record used by the registry and index page.
 * `readingTime` is derived from the body at build time.
 */
export interface Checklist {
  slug: string;
  title: string;
  description: string;
  category: ChecklistCategory;
  lastUpdated: string;
  tags: string[];
  readingTime: number;
  image?: string;
  imageAlt?: string;
  published: boolean;
}

/** Parse and validate a raw checklist frontmatter object. */
export function parseChecklistFrontmatter(raw: unknown): ChecklistFrontmatter {
  const result = checklistSchema.safeParse(raw);
  if (!result.success) {
    const messages = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid checklist frontmatter:\n${messages}`);
  }
  return result.data;
}
