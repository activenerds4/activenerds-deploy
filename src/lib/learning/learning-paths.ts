export type PathCategory = "infrastructure" | "ai-ml";
export type ModuleFormat = "article" | "qa_challenge";
export type Level = "beginner" | "intermediate" | "advanced";

export interface GlossaryTerm {
  term: string;
  href: string;
}

export interface LearningPath {
  slug: "docker" | "kubernetes" | "gen-ai" | "agentic-ai";
  name: string;
  category: PathCategory;
  icon: "Container" | "Network" | "Sparkles" | "Bot";
  description: string;
  levelRange: "Beginner–Advanced";
  estimatedHours: number;
  prerequisiteSlug?: string;
  prerequisiteNote?: string;
  relatedGlossaryTerms: GlossaryTerm[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    slug: "docker",
    name: "Docker",
    category: "infrastructure",
    icon: "Container",
    description:
      "How containers actually isolate processes — cgroups, namespaces, and UnionFS layers, not just 'it's lighter than a VM'.",
    levelRange: "Beginner–Advanced",
    estimatedHours: 12,
    relatedGlossaryTerms: [
      { term: "OCI Image Spec", href: "/learning/glossary/oci-image-spec" },
      { term: "cgroups", href: "/learning/glossary/cgroups" },
      { term: "UnionFS", href: "/learning/glossary/unionfs" },
    ],
  },
  {
    slug: "kubernetes",
    name: "Kubernetes",
    category: "infrastructure",
    icon: "Network",
    description:
      "Declarative cluster state: how the control plane reconciles desired vs. actual, across pods, deployments, and services.",
    levelRange: "Beginner–Advanced",
    estimatedHours: 14,
    prerequisiteSlug: "docker",
    prerequisiteNote:
      "Assumes Docker fundamentals — container images, volumes, and Compose.",
    relatedGlossaryTerms: [
      { term: "etcd", href: "/learning/glossary/etcd" },
      { term: "kube-scheduler", href: "/learning/glossary/kube-scheduler" },
      { term: "Helm chart", href: "/learning/glossary/helm-chart" },
    ],
  },
  {
    slug: "gen-ai",
    name: "Gen AI",
    category: "ai-ml",
    icon: "Sparkles",
    description:
      "What an LLM actually does: mechanism over hype — tokens, attention mechanisms, embeddings, RAG architectures, and evaluation.",
    levelRange: "Beginner–Advanced",
    estimatedHours: 10,
    relatedGlossaryTerms: [
      { term: "Transformer Architecture", href: "/learning/glossary/transformer" },
      { term: "Self-Attention Mechanism", href: "/learning/glossary/self-attention" },
      { term: "Vector Embedding", href: "/learning/glossary/vector-embedding" },
    ],
  },
  {
    slug: "agentic-ai",
    name: "Agentic AI",
    category: "ai-ml",
    icon: "Bot",
    description:
      "Autonomous loops with tool access: ReAct pattern, planning engines, state management, MCP protocol, and multi-agent coordination.",
    levelRange: "Beginner–Advanced",
    estimatedHours: 12,
    prerequisiteSlug: "gen-ai",
    prerequisiteNote:
      "Assumes Gen AI fundamentals — LLM APIs, prompting, and embeddings.",
    relatedGlossaryTerms: [
      { term: "AI Agent", href: "/learning/glossary/ai-agent" },
      { term: "ReAct Pattern", href: "/learning/glossary/react-pattern" },
      { term: "Model Context Protocol (MCP)", href: "/learning/glossary/mcp" },
    ],
  },
];

export function getLearningPath(slug: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.slug === slug);
}

export function getNextPath(slug: string): LearningPath | undefined {
  const currentIndex = LEARNING_PATHS.findIndex((p) => p.slug === slug);
  if (currentIndex !== -1 && currentIndex < LEARNING_PATHS.length - 1) {
    return LEARNING_PATHS[currentIndex + 1];
  }
  return undefined;
}

export function getPathsByCategory(category: PathCategory): LearningPath[] {
  return LEARNING_PATHS.filter((p) => p.category === category);
}
