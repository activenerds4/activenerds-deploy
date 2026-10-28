import type { ComponentType } from "react";
import type { Level, ModuleFormat } from "./learning-paths";
import { splitFrontmatter } from "@/lib/content/frontmatter";

export interface ModuleEntry {
  id: string; // derived e.g. "docker-1"
  pathSlug: string;
  moduleSlug: string;
  order: number;
  level: Level;
  title: string;
  description: string;
  question: string;
  quickAnswer: string;
  keyTakeaway?: string;
  format: ModuleFormat;
  estimatedMinutes: number;
  xpValue: number;
  seoTitle: string;
  metaDescription: string;
  publishDate: string;
  lastModified?: string;
  domain: string;
  tags: string[];
  relatedModules?: string[];
}

// Vite eager glob for raw MDX content
const rawLearningModules = import.meta.glob<string>("/content/learning/**/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
});

// Vite eager glob for pre-compiled JS modules from precompile-mdx script
const compiledLearningModules = import.meta.glob<{
  default: ComponentType<{ components?: Record<string, unknown> }>;
}>("/src/lib/content/__compiled__/learning/**/*.js", {
  eager: true,
});

const PATH_SLUG_ALIASES: Record<string, string> = {
  llm: "gen-ai",
  "generative-ai": "gen-ai",
  "llm-engineering": "gen-ai",
  "ai-agents": "agentic-ai",
};

function resolvePathSlug(rawSlug: string | undefined, filePath: string): string {
  const parts = filePath.split("/");
  const folderSlug = parts.length >= 2 ? parts[parts.length - 2] : "";

  if (rawSlug && PATH_SLUG_ALIASES[rawSlug]) {
    return PATH_SLUG_ALIASES[rawSlug];
  }
  if (rawSlug && rawSlug !== "learning" && rawSlug !== "content") {
    return rawSlug;
  }
  return folderSlug;
}

function parseMdxSections(content: string, frontmatterQuestion?: string, description?: string): {
  question: string;
  quickAnswer: string;
  keyTakeaway: string;
} {
  let question = frontmatterQuestion || "";
  let quickAnswer = "";
  let keyTakeaway = "";

  if (content) {
    if (!question) {
      const qMatch = content.match(/##\s*Question[^\n]*\n([\s\S]*?)(?=\n##|\Z)/i);
      if (qMatch && qMatch[1].trim()) {
        question = qMatch[1].replace(/^>\s*/gm, "").trim();
      }
    }

    const aMatch = content.match(/##\s*Quick Answer[^\n]*\n([\s\S]*?)(?=\n##|\Z)/i);
    if (aMatch && aMatch[1].trim()) {
      quickAnswer = aMatch[1].replace(/^>\s*/gm, "").trim();
    }

    const tMatch =
      content.match(/<Callout[^>]*title=["']Key Takeaways?["'][^>]*>([\s\S]*?)<\/Callout>/i) ||
      content.match(/##\s*Key Takeaways?[^\n]*\n([\s\S]*?)(?=\n##|---|$)/i);
    if (tMatch && tMatch[1].trim()) {
      keyTakeaway = tMatch[1].replace(/^>\s*/gm, "").trim();
    }
  }

  if (!question) question = description || "";

  return { question, quickAnswer, keyTakeaway };
}

let cachedModules: ModuleEntry[] | null = null;

export function getAllModules(): ModuleEntry[] {
  if (cachedModules) return cachedModules;

  const entries: ModuleEntry[] = [];

  for (const [filePath, rawText] of Object.entries(rawLearningModules)) {
    try {
      const { frontmatter: data, body } = splitFrontmatter(rawText || "");

      // Derive pathSlug and moduleSlug from filePath e.g. /content/learning/docker/container-vs-image.mdx
      const parts = filePath.split("/");
      const fileName = parts[parts.length - 1];
      const derivedModuleSlug = fileName.replace(/\.mdx$/, "");

      const rawPathSlug = typeof data.pathSlug === "string" ? data.pathSlug : undefined;
      const pathSlug = resolvePathSlug(rawPathSlug, filePath).toLowerCase();
      const rawModuleSlug = typeof data.moduleSlug === "string" ? data.moduleSlug : derivedModuleSlug;
      const moduleSlug = rawModuleSlug.toLowerCase();
      const order = typeof data.order === "number" ? data.order : 999;

      const rawLevel = String(data.level || "beginner").toLowerCase();
      const level: Level =
        rawLevel === "advanced" || rawLevel === "expert"
          ? "advanced"
          : rawLevel === "intermediate"
          ? "intermediate"
          : "beginner";

      const frontmatterQuestion = typeof data.question === "string" ? data.question : undefined;
      const frontmatterDesc = typeof data.description === "string" ? data.description : undefined;
      const sections = parseMdxSections(body, frontmatterQuestion, frontmatterDesc);

      entries.push({
        id: `${pathSlug}-${moduleSlug}`,
        pathSlug,
        moduleSlug,
        order,
        level,
        title: String(data.title || derivedModuleSlug),
        description: frontmatterDesc || "",
        question: sections.question,
        quickAnswer: sections.quickAnswer,
        keyTakeaway: sections.keyTakeaway,
        format: (data.format as ModuleFormat) || "article",
        estimatedMinutes: typeof data.estimatedMinutes === "number" ? data.estimatedMinutes : 4,
        xpValue: typeof data.xpValue === "number" ? data.xpValue : 10,
        seoTitle: String(data.seoTitle || data.title || derivedModuleSlug),
        metaDescription: String(data.metaDescription || frontmatterDesc || ""),
        publishDate: String(data.publishDate || "2026-08-01"),
        lastModified: typeof data.lastModified === "string" ? data.lastModified : undefined,
        domain: String(data.domain || "Fundamentals"),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        relatedModules: Array.isArray(data.relatedModules) ? data.relatedModules.map(String) : [],
      });
    } catch (e) {
      console.error(`[learning-modules] Error parsing ${filePath}:`, e);
    }
  }

  // Sort overall by pathSlug then order ascending, then by title
  entries.sort((a, b) => {
    if (a.pathSlug !== b.pathSlug) return a.pathSlug.localeCompare(b.pathSlug);
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });

  cachedModules = entries;
  return entries;
}

export function getModulesForPath(pathSlug: string): ModuleEntry[] {
  const norm = (PATH_SLUG_ALIASES[pathSlug.toLowerCase()] || pathSlug).toLowerCase();
  return getAllModules().filter((m) => m.pathSlug === norm).sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });
}

export function getModule(pathSlug: string, moduleSlug: string): ModuleEntry | undefined {
  const normPath = (PATH_SLUG_ALIASES[pathSlug.toLowerCase()] || pathSlug).toLowerCase();
  const normModule = moduleSlug.toLowerCase();
  return getAllModules().find(
    (m) => m.pathSlug === normPath && m.moduleSlug === normModule
  );
}

export function getModuleComponent(
  pathSlug: string,
  moduleSlug: string
): ComponentType<{ components?: Record<string, unknown> }> | undefined {
  const normPath = (PATH_SLUG_ALIASES[pathSlug.toLowerCase()] || pathSlug).toLowerCase();
  const normModule = moduleSlug.toLowerCase();

  // 1. Look for precompiled JS module: /src/lib/content/__compiled__/learning/{pathSlug}/{moduleSlug}.js
  const compiledPath = `/src/lib/content/__compiled__/learning/${normPath}/${normModule}.js`;
  if (compiledLearningModules[compiledPath]) {
    return compiledLearningModules[compiledPath].default;
  }

  // Fallback search across keys
  for (const [key, mod] of Object.entries(compiledLearningModules)) {
    if (key.endsWith(`/${normPath}/${normModule}.js`)) {
      return mod.default;
    }
  }

  return undefined;
}

/**
 * Returns the next 5 articles in the series ordered by progression/difficulty order.
 */
export function getNext5InSeries(pathSlug: string, currentModuleSlug: string): ModuleEntry[] {
  const pathModules = getModulesForPath(pathSlug);
  const currentIndex = pathModules.findIndex(
    (m) => m.moduleSlug.toLowerCase() === currentModuleSlug.toLowerCase()
  );

  if (currentIndex === -1) {
    return pathModules.slice(0, 5);
  }

  // Slice next 5 items
  const nextModules = pathModules.slice(currentIndex + 1, currentIndex + 6);

  // If there are fewer than 5 remaining, wrap around to earlier modules
  if (nextModules.length < 5 && pathModules.length > nextModules.length) {
    const needed = 5 - nextModules.length;
    const earlier = pathModules.slice(0, Math.min(needed, currentIndex));
    return [...nextModules, ...earlier];
  }

  return nextModules;
}

export function getModuleCount(pathSlug: string): number {
  return getModulesForPath(pathSlug).length;
}

export function getModulesByLevel(pathSlug: string, level: Level): ModuleEntry[] {
  return getModulesForPath(pathSlug).filter((m) => m.level === level);
}

export function getDomainsForPath(pathSlug: string): string[] {
  const modules = getModulesForPath(pathSlug);
  const set = new Set<string>();
  for (const m of modules) {
    if (m.domain) set.add(m.domain);
  }
  return Array.from(set).sort();
}
