// Guide registry.
//
// Discovers guide MDX files under content/pages/resources/guides/ at build
// time via Vite import.meta.glob (raw imports), parses their frontmatter
// against the guide schema, and exposes typed records for the
// /resources/guides index page and the navigation config.
//
// The MDX bodies are rendered by the existing MdxSubPage
// (src/app/[...slug]/page.tsx) which already globs content/pages/**/*.mdx,
// so no new detail route is required -- only the index page and this registry.

import {
  type Guide,
  type GuideCategory,
  GUIDE_CATEGORIES,
  guideCategoryLabels,
  parseGuideFrontmatter,
} from "@/lib/content/guide-schema";
import { splitFrontmatter } from "@/lib/content/frontmatter";
import { calculateReadingTime } from "@/lib/content/reading-time";

// Map of guide slug -> raw file content (build-time raw imports).
const guideFiles = import.meta.glob<string>("/content/pages/resources/guides/*.{mdx,md}", {
  query: "?raw",
  import: "default",
  eager: true,
});

// Derive the slug from a glob key.
// e.g. "/content/pages/resources/guides/zero-downtime-k8s-deployment-guide.mdx"
//   -> "zero-downtime-k8s-deployment-guide"
function slugFromKey(key: string): string {
  const fileName = key.split("/").pop() ?? key;
  return fileName.replace(/\.(mdx|md)$/, "");
}

// Parse all discovered guide files into validated records.
function loadGuides(): Guide[] {
  const guides: Guide[] = [];

  for (const [key, raw] of Object.entries(guideFiles)) {
    const slug = slugFromKey(key);
    try {
      const { frontmatter, body } = splitFrontmatter(raw);
      const fm = parseGuideFrontmatter(frontmatter);

      // Slug in frontmatter must match the filename slug.
      if (fm.slug !== slug) {
        console.warn(
          "[guides] Slug mismatch in " +
            key +
            ': frontmatter "' +
            fm.slug +
            '" != filename "' +
            slug +
            '". Using filename slug.',
        );
      }

      if (!fm.published) continue;

      guides.push({
        slug,
        title: fm.title,
        description: fm.description,
        category: fm.category,
        lastUpdated: fm.lastUpdated,
        tags: fm.tags,
        readingTime: calculateReadingTime(body),
        image: fm.image,
        imageAlt: fm.imageAlt,
        published: fm.published,
      });
    } catch (err) {
      console.error("[guides] Failed to load " + key + ":", err);
    }
  }

  // Most recently updated first.
  return guides.sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
  );
}

const allGuides = loadGuides();

// All published guides, most-recently-updated first.
export function getGuides(): Guide[] {
  return allGuides;
}

// Guides filtered to a single category.
export function getGuidesByCategory(category: GuideCategory): Guide[] {
  return allGuides.filter((g) => g.category === category);
}

// A single guide by slug.
export function getGuideBySlug(slug: string): Guide | undefined {
  return allGuides.find((g) => g.slug === slug);
}

// All categories that actually have at least one guide.
export function getPopulatedGuideCategories(): GuideCategory[] {
  return GUIDE_CATEGORIES.filter((cat) => allGuides.some((g) => g.category === cat));
}

// Aggregate tag list with counts, for the quick-filter chips.
export function getGuideTags(): { slug: string; name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const guide of allGuides) {
    for (const tag of guide.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([slug, count]) => ({
      slug,
      name: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

// Human-readable label for a guide category.
export function guideCategoryLabel(category: GuideCategory): string {
  return guideCategoryLabels[category];
}

export { GUIDE_CATEGORIES, guideCategoryLabels } from "@/lib/content/guide-schema";
