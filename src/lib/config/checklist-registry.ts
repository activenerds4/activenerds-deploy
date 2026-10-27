// Checklist registry.
//
// Discovers checklist MDX files under content/pages/resources/checklists/
// at build time via Vite import.meta.glob (raw imports), parses their
// frontmatter against the checklist schema, and exposes typed records for
// the /resources/checklists index page and the navigation config.
//
// The MDX bodies are rendered by the existing MdxSubPage
// (src/app/[...slug]/page.tsx) which already globs content/pages/**/*.mdx,
// so no new detail route is required -- only the index page and this registry.

import {
  type Checklist,
  type ChecklistCategory,
  CHECKLIST_CATEGORIES,
  checklistCategoryLabels,
  parseChecklistFrontmatter,
} from "@/lib/content/checklist-schema";
import { splitFrontmatter } from "@/lib/content/frontmatter";
import { calculateReadingTime } from "@/lib/content/reading-time";

// Map of checklist slug -> raw file content (build-time raw imports).
const checklistFiles = import.meta.glob<string>("/content/pages/resources/checklists/*.{mdx,md}", {
  query: "?raw",
  import: "default",
  eager: true,
});

// Derive the slug from a glob key.
// e.g. "/content/pages/resources/checklists/k8s-cluster-go-live-checklist.mdx"
//   -> "k8s-cluster-go-live-checklist"
function slugFromKey(key: string): string {
  const fileName = key.split("/").pop() ?? key;
  return fileName.replace(/\.(mdx|md)$/, "");
}

// Parse all discovered checklist files into validated records.
function loadChecklists(): Checklist[] {
  const sheets: Checklist[] = [];

  for (const [key, raw] of Object.entries(checklistFiles)) {
    const slug = slugFromKey(key);
    try {
      const { frontmatter, body } = splitFrontmatter(raw);
      const fm = parseChecklistFrontmatter(frontmatter);

      // Slug in frontmatter must match the filename slug.
      if (fm.slug !== slug) {
        console.warn(
          "[checklists] Slug mismatch in " +
            key +
            ': frontmatter "' +
            fm.slug +
            '" != filename "' +
            slug +
            '". Using filename slug.',
        );
      }

      if (!fm.published) continue;

      sheets.push({
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
      console.error("[checklists] Failed to load " + key + ":", err);
    }
  }

  // Most recently updated first.
  return sheets.sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
  );
}

const allChecklists = loadChecklists();

// All published checklists, most-recently-updated first.
export function getChecklists(): Checklist[] {
  return allChecklists;
}

// Checklists filtered to a single category.
export function getChecklistsByCategory(category: ChecklistCategory): Checklist[] {
  return allChecklists.filter((s) => s.category === category);
}

// A single checklist by slug.
export function getChecklistBySlug(slug: string): Checklist | undefined {
  return allChecklists.find((s) => s.slug === slug);
}

// All categories that actually have at least one checklist.
export function getPopulatedChecklistCategories(): ChecklistCategory[] {
  return CHECKLIST_CATEGORIES.filter((cat) => allChecklists.some((s) => s.category === cat));
}

// Aggregate tag list with counts, for the quick-filter chips.
export function getChecklistTags(): { slug: string; name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const sheet of allChecklists) {
    for (const tag of sheet.tags) {
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

// Human-readable label for a checklist category.
export function checklistCategoryLabel(category: ChecklistCategory): string {
  return checklistCategoryLabels[category];
}

export { CHECKLIST_CATEGORIES, checklistCategoryLabels } from "@/lib/content/checklist-schema";
