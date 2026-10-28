import { DOCKER_QUESTIONS } from "./qa-data/docker";
import { KUBERNETES_QUESTIONS } from "./qa-data/kubernetes";
import { GENAI_QUESTIONS } from "./qa-data/gen-ai";
import { AGENTIC_QUESTIONS } from "./qa-data/agentic-ai";
import type {
  ChallengeTopic,
  ChallengeTopicSlug,
  ChallengeLevel,
  ChallengeQuestion,
} from "./qa-types";

export * from "./qa-types";

export const CHALLENGE_TOPICS: ChallengeTopic[] = [
  {
    slug: "docker",
    name: "Docker",
    icon: "Container",
    category: "infrastructure",
    description:
      "How containers actually isolate processes — cgroups, namespaces, and UnionFS layers, not just 'it's lighter than a VM'.",
    questions: DOCKER_QUESTIONS,
  },
  {
    slug: "kubernetes",
    name: "Kubernetes",
    icon: "Network",
    category: "infrastructure",
    description:
      "Declarative cluster state: how the control plane reconciles desired vs. actual, across pods, deployments, and services.",
    questions: KUBERNETES_QUESTIONS,
  },
  {
    slug: "gen-ai",
    name: "Gen AI",
    icon: "Sparkles",
    category: "ai-ml",
    description:
      "What an LLM actually does — next-token prediction, context windows, and why temperature is not creativity.",
    questions: GENAI_QUESTIONS,
  },
  {
    slug: "agentic-ai",
    name: "Agentic AI",
    icon: "Bot",
    category: "ai-ml",
    description:
      "Agents vs. plain LLM calls — the tool-use loop, planning state, and why retry logic determines production reliability.",
    questions: AGENTIC_QUESTIONS,
  },
];

export function getChallengeTopic(slug: string): ChallengeTopic | undefined {
  return CHALLENGE_TOPICS.find((t) => t.slug === slug);
}

export function getQuestionsByLevel(
  topic: ChallengeTopic,
  level: ChallengeLevel
): ChallengeQuestion[] {
  return topic.questions.filter((q) => q.level === level);
}

export function getTotalQuestionCount(topic: ChallengeTopic): number {
  return topic.questions.length;
}

export function getChallengeTopicsByCategory(
  category: "infrastructure" | "ai-ml"
): ChallengeTopic[] {
  return CHALLENGE_TOPICS.filter((t) => t.category === category);
}
