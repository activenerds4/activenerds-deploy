import { z } from "zod";

/**
 * Guide frontmatter validation schema.
 *
 * Guides live under `content/pages/resources/guides/*.mdx` and are surfaced
 * through the dedicated `/resources/guides` index. They reuse the site's MDX
 * rendering pipeline (precompiled at build time) but carry a lighter metadata
 * contract than full articles — no author profile page, no series, no i18n —
 * just the fields a long-form architectural guide needs.
 *
 * Guides are longer and more narrative than cheat sheets or checklists:
 * they walk through architecture decisions, trade-offs, and end-to-end
 * implementations rather than listing commands or audit items.
 *
 * TypeScript types are inferred from this Zod schema so validation and types
 * never drift.
 */

/** The four guide collections, matching the nav dropdown. */
export const GUIDE_CATEGORIES = ["active-tech", "ai-ml", "kubernetes", "devsecops"] as const;

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export const guideCategoryLabels: Record<GuideCategory, string> = {
  "active-tech": "Physical Ergonomics & Workday Longevity",
  "ai-ml": "AI-Augmented DevEx & Workflows",
  kubernetes: "Kubernetes & Cloud-Native",
  devsecops: "DevSecOps & Zero-Trust Cloud",
};

export const guideCategoryDescriptions: Record<GuideCategory, string> = {
  "active-tech":
    "Workstation engineering, circadian recovery, and mobility protocols for sustainable desk-bound careers.",
  "ai-ml":
    "Agentic IDE architecture, local LLM tooling, and AI-guarded code review workflows for modern devex.",
  kubernetes:
    "Zero-downtime deployment, node tuning, and multi-cluster fleet management deep-dives for K8s platform teams.",
  devsecops:
    "Keyless CI/CD, supply chain attestation, and zero-trust IaC architectures for hardened cloud pipelines.",
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
 * Raw frontmatter as it appears in a guide MDX file.
 * Required fields: title, description, category, slug, lastUpdated.
 */
export const guideSchema = z.object({
  title: nonEmpty("title"),
  description: nonEmpty("description"),
  category: z.enum(GUIDE_CATEGORIES, {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return {
          message: `category must be one of: ${GUIDE_CATEGORIES.join(", ")}`,
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

/** Inferred type of validated guide frontmatter. */
export type GuideFrontmatter = z.infer<typeof guideSchema>;

/**
 * A resolved guide record used by the registry and index page.
 * `readingTime` is derived from the body at build time.
 */
export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: GuideCategory;
  lastUpdated: string;
  tags: string[];
  readingTime: number;
  image?: string;
  imageAlt?: string;
  published: boolean;
}

/** Parse and validate a raw guide frontmatter object. */
export function parseGuideFrontmatter(raw: unknown): GuideFrontmatter {
  const result = guideSchema.safeParse(raw);
  if (!result.success) {
    const messages = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid guide frontmatter:\n${messages}`);
  }
  return result.data;
}
