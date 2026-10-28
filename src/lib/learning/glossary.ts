import type { GlossaryEntry, GlossaryLevel, GlossaryTopic, GlossaryType } from "./glossary-types";
import { dockerGlossary } from "./glossary-data/docker";
import { kubernetesGlossary } from "./glossary-data/kubernetes";
import { genAiGlossary } from "./glossary-data/gen-ai";
import { agenticAiGlossary } from "./glossary-data/agentic-ai";

export const ALL_GLOSSARY_ENTRIES: GlossaryEntry[] = [
  ...dockerGlossary,
  ...kubernetesGlossary,
  ...genAiGlossary,
  ...agenticAiGlossary,
];

export function getEntryBySlug(slug: string): GlossaryEntry | undefined {
  return ALL_GLOSSARY_ENTRIES.find((entry) => entry.slug === slug);
}

export function searchGlossary(query: string, entries: GlossaryEntry[] = ALL_GLOSSARY_ENTRIES): GlossaryEntry[] {
  if (!query || !query.trim()) return entries;
  const q = query.toLowerCase().trim();
  return entries.filter(
    (e) =>
      e.term.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.definition.toLowerCase().includes(q)
  );
}

export interface FilterOptions {
  topics?: GlossaryTopic[];
  types?: GlossaryType[];
  levels?: GlossaryLevel[];
}

export function filterGlossary(
  entries: GlossaryEntry[],
  filters: FilterOptions
): GlossaryEntry[] {
  return entries.filter((entry) => {
    // Topic filter (AND logic: if topic filters specified, entry must have AT LEAST ONE matching topic)
    if (filters.topics && filters.topics.length > 0) {
      const hasTopicMatch = filters.topics.some((t) => entry.topics.includes(t));
      if (!hasTopicMatch) return false;
    }

    // Type filter
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(entry.type)) return false;
    }

    // Level filter
    if (filters.levels && filters.levels.length > 0) {
      if (!filters.levels.includes(entry.level)) return false;
    }

    return true;
  });
}
