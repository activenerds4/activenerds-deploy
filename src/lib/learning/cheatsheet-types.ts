export interface CheatSheetItem {
  command: string;       // e.g. "docker build -t name:tag ."
  description: string;   // One-line, house voice explanation
  relatedGlossaryTerm?: string; // Optional slug pointing to glossary entry
}

export interface CheatSheetSection {
  title: string;          // e.g. "Image Commands"
  items: CheatSheetItem[];
}

export interface CheatSheet {
  topicSlug: "docker" | "kubernetes" | "gen-ai" | "agentic-ai";
  topicName: string;
  description: string;
  lastUpdated: string;
  sections: CheatSheetSection[];
}
