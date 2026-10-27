// Cheat Sheet registry.
//
// Discovers cheat-sheet MDX files under content/pages/resources/cheatsheets/
// at build time via Vite import.meta.glob (raw imports), parses their
// frontmatter against the cheat-sheet schema, and exposes typed records for
// the /resources/cheatsheets index page and the navigation config.
//
// The MDX bodies are rendered by the existing MdxSubPage
// (src/app/[...slug]/page.tsx) which already globs content/pages/**/*.mdx,
// so no new detail route is required -- only the index page and this registry.

import {
  type CheatSheet,
  type CheatSheetCategory,
  CHEAT_SHEET_CATEGORIES,
  cheatSheetCategoryLabels,
  parseCheatSheetFrontmatter,
} from "@/lib/content/cheat-sheet-schema";
import { splitFrontmatter } from "@/lib/content/frontmatter";
import { calculateReadingTime } from "@/lib/content/reading-time";

// Map of cheat-sheet slug -> raw file content (build-time raw imports).
// Single-line glob mirrors the proven pattern in local-source.ts.
const cheatSheetFiles = import.meta.glob<string>(
  "/content/pages/resources/cheatsheets/*.{mdx,md}",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

// Derive the slug from a glob key.
// e.g. "/content/pages/resources/cheatsheets/k8s-cheat-sheet.mdx" -> "k8s-cheat-sheet"
function slugFromKey(key: string): string {
  const fileName = key.split("/").pop() ?? key;
  return fileName.replace(/\.(mdx|md)$/, "");
}

// Parse all discovered cheat-sheet files into validated records.
function loadCheatSheets(): CheatSheet[] {
  const sheets: CheatSheet[] = [];

  for (const [key, raw] of Object.entries(cheatSheetFiles)) {
    const slug = slugFromKey(key);
    try {
      const { frontmatter, body } = splitFrontmatter(raw);
      const fm = parseCheatSheetFrontmatter(frontmatter);

      // Slug in frontmatter must match the filename slug.
      if (fm.slug !== slug) {
        console.warn(
          "[cheat-sheets] Slug mismatch in " +
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
      console.error("[cheat-sheets] Failed to load " + key + ":", err);
    }
  }

  // Most recently updated first.
  return sheets.sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
  );
}

const allCheatSheets = loadCheatSheets();

// All published cheat sheets, most-recently-updated first.
export function getCheatSheets(): CheatSheet[] {
  return allCheatSheets;
}

// Cheat sheets filtered to a single category.
export function getCheatSheetsByCategory(category: CheatSheetCategory): CheatSheet[] {
  return allCheatSheets.filter((s) => s.category === category);
}

// A single cheat sheet by slug.
export function getCheatSheetBySlug(slug: string): CheatSheet | undefined {
  return allCheatSheets.find((s) => s.slug === slug);
}

// All categories that actually have at least one cheat sheet.
export function getPopulatedCheatSheetCategories(): CheatSheetCategory[] {
  return CHEAT_SHEET_CATEGORIES.filter((cat) => allCheatSheets.some((s) => s.category === cat));
}

// Aggregate tag list with counts, for the quick-filter chips.
export function getCheatSheetTags(): { slug: string; name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const sheet of allCheatSheets) {
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

// Human-readable label for a cheat-sheet category.
export function cheatSheetCategoryLabel(category: CheatSheetCategory): string {
  return cheatSheetCategoryLabels[category];
}

export { CHEAT_SHEET_CATEGORIES, cheatSheetCategoryLabels } from "@/lib/content/cheat-sheet-schema";
