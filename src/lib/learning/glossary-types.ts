export type GlossaryTopic = "docker" | "kubernetes" | "gen-ai" | "agentic-ai";
export type GlossaryType = "concept" | "command" | "architecture_pattern" | "tool" | "protocol";
export type GlossaryLevel = "beginner" | "intermediate" | "advanced";

export interface Appearance {
  kind: "learning-path-module" | "blog-post" | "qa-challenge";
  title: string;
  href: string;
}

export interface GlossaryUsage {
  scenario: string;
  codeOrCommand?: string;
  explanation: string;
}

export interface GlossaryEntry {
  slug: string;          // URL-safe, e.g. "container-image"
  term: string;          // Display name
  definition: string;    // House-voice, mechanism-first definition
  summary: string;       // One-line short preview (~15 words)
  plainEnglish?: string; // Clear, jargon-free explanation in simple language
  analogy?: string;      // Relatable real-world mental model or analogy
  practicalUsage?: GlossaryUsage; // Practical production scenario and code/command
  practicalTips?: string[]; // Real-world gotchas and battle-tested field advice
  misconceptions?: string[]; // Common myths busted
  topics: GlossaryTopic[];
  type: GlossaryType;    // Exactly one
  level: GlossaryLevel;  // Exactly one
  relatedTerms: string[]; // Slugs of other GlossaryEntry items
  appearsIn?: Appearance[];
}
