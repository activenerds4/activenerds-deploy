export type ChallengeTopicSlug = "docker" | "kubernetes" | "gen-ai" | "agentic-ai";
export type ChallengeLevel = "beginner" | "intermediate" | "advanced";
export type QuestionFormat = "multiple_choice" | "scenario" | "code_fill" | "open_ended";
export type ViewMode = "plain" | "quiz" | "flashcard" | "timed";

export interface ChallengeQuestion {
  id: string;
  pathSlug: ChallengeTopicSlug;
  level: ChallengeLevel;
  format: QuestionFormat;
  prompt: string;
  options?: [string, string, string, string];
  correctOptionIndex?: 0 | 1 | 2 | 3;
  codeSnippet?: string;
  correctAnswer?: string;
  modelAnswer: string;
  xpValue: number;
  timedSecondsAllowed?: number;
}

export interface ChallengeTopic {
  slug: ChallengeTopicSlug;
  name: string;
  icon: "Container" | "Network" | "Sparkles" | "Bot";
  category: "infrastructure" | "ai-ml";
  description: string;
  questions: ChallengeQuestion[];
}

export const VALID_TOPIC_SLUGS: ChallengeTopicSlug[] = [
  "docker",
  "kubernetes",
  "gen-ai",
  "agentic-ai",
];
export const VALID_LEVELS: ChallengeLevel[] = ["beginner", "intermediate", "advanced"];
export const VALID_MODES: ViewMode[] = ["plain", "quiz", "flashcard", "timed"];

export function isModeCompatible(format: QuestionFormat, mode: ViewMode): boolean {
  if (mode === "timed" && format === "open_ended") return false;
  return true;
}

export function isAutoGraded(format: QuestionFormat, mode: ViewMode): boolean {
  if (format === "multiple_choice") return true;
  if (format === "code_fill" && (mode === "quiz" || mode === "timed")) return true;
  return false;
}

export function getXpForMode(baseXp: number, mode: ViewMode): number {
  if (mode === "plain") return 0;
  if (mode === "flashcard") return Math.floor(baseXp * 0.5);
  if (mode === "timed") return Math.floor(baseXp * 1.2);
  return baseXp;
}

export function getQuestionsForMode(
  questions: ChallengeQuestion[],
  mode: ViewMode
): ChallengeQuestion[] {
  return questions.filter((q) => isModeCompatible(q.format, mode));
}
