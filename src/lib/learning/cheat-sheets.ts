import type { CheatSheet } from "./cheatsheet-types";
import { dockerCheatSheet } from "./cheatsheet-data/docker";
import { kubernetesCheatSheet } from "./cheatsheet-data/kubernetes";
import { genAiCheatSheet } from "./cheatsheet-data/gen-ai";
import { agenticAiCheatSheet } from "./cheatsheet-data/agentic-ai";

export const ALL_CHEAT_SHEETS: CheatSheet[] = [
  dockerCheatSheet,
  kubernetesCheatSheet,
  genAiCheatSheet,
  agenticAiCheatSheet,
];

export function getCheatSheetByTopic(slug: string): CheatSheet | undefined {
  return ALL_CHEAT_SHEETS.find((sheet) => sheet.topicSlug === slug);
}
