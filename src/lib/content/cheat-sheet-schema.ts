import { z } from "zod";

/**
 * Cheat Sheet frontmatter validation schema.
 *
 * Cheat sheets live under `content/pages/resources/cheatsheets/*.mdx` and are
 * surfaced through the dedicated `/resources/cheatsheets` index. They reuse the
 * site's MDX rendering pipeline (precompiled at build time) but carry a lighter
 * metadata contract than full articles — no author profile page, no series,
 * no i18n — just the fields a quick-reference card needs.
 *
 * TypeScript types are inferred from this Zod schema so validation and types
 * never drift.
 */

/** The four cheat-sheet collections, matching the nav dropdown. */
export const CHEAT_SHEET_CATEGORIES = [
  "ai-llm-engineering",
  "kubernetes-containers",
  "cloud-devsecops",
  "ergonomics-active-tech",
] as const;

export type CheatSheetCategory = (typeof CHEAT_SHEET_CATEGORIES)[number];

export const cheatSheetCategoryLabels: Record<CheatSheetCategory, string> = {
  "ai-llm-engineering": "AI & LLM Engineering",
  "kubernetes-containers": "Kubernetes & Containers",
  "cloud-devsecops": "Cloud & DevSecOps",
  "ergonomics-active-tech": "Ergonomics & Active Tech",
};

export const cheatSheetCategoryDescriptions: Record<CheatSheetCategory, string> = {
  "ai-llm-engineering": "Model training, inference, fine-tuning, and MLOps quick-reference cards.",
  "kubernetes-containers": "kubectl commands, YAML patterns, troubleshooting, and cluster ops.",
  "cloud-devsecops": "Security hardening, policy-as-code, supply chain, and compliance.",
  "ergonomics-active-tech": "Desk setup, micro-exercises, and movement routines for tech pros.",
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
 * Raw frontmatter as it appears in a cheat-sheet MDX file.
 * Required fields: title, description, category, slug, lastUpdated.
 */
export const cheatSheetSchema = z.object({
  title: nonEmpty("title"),
  description: nonEmpty("description"),
  category: z.enum(CHEAT_SHEET_CATEGORIES, {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return {
          message: `category must be one of: ${CHEAT_SHEET_CATEGORIES.join(", ")}`,
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

/** Inferred type of validated cheat-sheet frontmatter. */
export type CheatSheetFrontmatter = z.infer<typeof cheatSheetSchema>;

/**
 * A resolved cheat sheet record used by the registry and index page.
 * `readingTime` is derived from the body at build time.
 */
export interface CheatSheet {
  slug: string;
  title: string;
  description: string;
  category: CheatSheetCategory;
  lastUpdated: string;
  tags: string[];
  readingTime: number;
  image?: string;
  imageAlt?: string;
  published: boolean;
}

/** Parse and validate a raw cheat-sheet frontmatter object. */
export function parseCheatSheetFrontmatter(raw: unknown): CheatSheetFrontmatter {
  const result = cheatSheetSchema.safeParse(raw);
  if (!result.success) {
    const messages = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid cheat-sheet frontmatter:\n${messages}`);
  }
  return result.data;
}
