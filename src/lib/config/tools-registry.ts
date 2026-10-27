import { lazy } from "react";

export type ToolCategory =
  "ai-llm" | "kubernetes-containers" | "devsecops-cloud" | "ergonomics-active";

export interface ToolCategoryMeta {
  id: ToolCategory;
  label: string;
  description: string;
  icon: string;
}

export const toolCategories: ToolCategoryMeta[] = [
  {
    id: "ai-llm",
    label: "AI & LLM Calculators",
    description: "VRAM sizing, token estimation, and structured-output tooling.",
    icon: "Cpu",
  },
  {
    id: "kubernetes-containers",
    label: "Kubernetes & Container Utilities",
    description: "Resource sizing, network policies, and crash diagnostics.",
    icon: "Boxes",
  },
  {
    id: "devsecops-cloud",
    label: "DevSecOps & Cloud Converters",
    description: "IAM scoping, OIDC trust, and cron schedule simulation.",
    icon: "ShieldCheck",
  },
  {
    id: "ergonomics-active",
    label: "Ergonomics & Active Desk Timers",
    description: "Desk calculators, eye-reset timers, and sit-stand pacers.",
    icon: "Activity",
  },
];

export interface ToolDefinition {
  slug: string;
  title: string;
  description: string;
  category: ToolCategory;
  type: "calculator" | "validator" | "tracker" | "timer" | "generator" | "diagnostics";
  icon?: string;
  enabled: boolean;
  component: React.LazyExoticComponent<React.ComponentType>;
}

export const toolsRegistry: ToolDefinition[] = [
  /* ── AI & LLM Calculators ─────────────────────────────────────────────── */
  {
    slug: "training-run-cost-estimator",
    title: "Training Run Cost Estimator",
    description:
      "Estimate GPU training time and cloud cost based on model size, batch size, and hardware.",
    category: "ai-llm",
    type: "calculator",
    icon: "Calculator",
    enabled: true,
    component: lazy(() => import("@/components/tools/TrainingRunCostEstimatorTool")),
  },
  {
    slug: "llm-vram-hardware-sizer",
    title: "LLM VRAM & Hardware Sizer",
    description:
      "Calculates GPU VRAM and system RAM requirements from model parameters, quantization (GGUF/AWQ/EXL2), context length, and batch sizes.",
    category: "ai-llm",
    type: "calculator",
    icon: "Cpu",
    enabled: true,
    component: lazy(() => import("@/components/tools/LlmVramHardwareSizerTool")),
  },
  {
    slug: "embedding-token-estimator",
    title: "Embedding & Token Estimator",
    description:
      "Estimates token counts across cl100k_base, Llama-3, and Gemma tokenizers; previews chunk splits and vector DB storage footprint.",
    category: "ai-llm",
    type: "calculator",
    icon: "Hash",
    enabled: true,
    component: lazy(() => import("@/components/tools/EmbeddingTokenEstimatorTool")),
  },
  {
    slug: "structured-output-schema-generator",
    title: "Structured Output Schema Generator",
    description:
      "Converts TypeScript interfaces, Zod, and Pydantic models into strict OpenAI/Anthropic/Ollama function-calling JSON schemas.",
    category: "ai-llm",
    type: "generator",
    icon: "Braces",
    enabled: true,
    component: lazy(() => import("@/components/tools/StructuredOutputSchemaGeneratorTool")),
  },

  /* ── Kubernetes & Container Utilities ────────────────────────────────── */
  {
    slug: "k8s-manifest-validator",
    title: "K8s Manifest Validator",
    description:
      "Paste a Kubernetes YAML manifest and get instant validation against best practices.",
    category: "kubernetes-containers",
    type: "validator",
    icon: "ShieldCheck",
    enabled: true,
    component: lazy(() => import("@/components/tools/K8sManifestValidatorTool")),
  },
  {
    slug: "k8s-resource-quota-calculator",
    title: "K8s Resource & Quota Calculator",
    description:
      "Interactive sizing for CPU/memory requests/limits, node packing utilization, and auto-generated LimitRange/ResourceQuota YAML.",
    category: "kubernetes-containers",
    type: "calculator",
    icon: "Calculator",
    enabled: true,
    component: lazy(() => import("@/components/tools/K8sResourceQuotaCalculatorTool")),
  },
  {
    slug: "k8s-network-policy-generator",
    title: "NetworkPolicy Visualizer & Generator",
    description:
      "Interactive ingress/egress CIDR, namespace, and pod-selector builder with a visual connection flow and exportable YAML.",
    category: "kubernetes-containers",
    type: "generator",
    icon: "Boxes",
    enabled: true,
    component: lazy(() => import("@/components/tools/K8sNetworkPolicyGeneratorTool")),
  },
  {
    slug: "k8s-exit-code-diagnostics",
    title: "K8s Exit Code & Crash Diagnostics",
    description:
      "Interactive exit code lookup for 137, 139, 1, 143; log symptom matcher with instant remediation command recipes.",
    category: "kubernetes-containers",
    type: "diagnostics",
    icon: "AlertTriangle",
    enabled: true,
    component: lazy(() => import("@/components/tools/K8sExitCodeDiagnosticsTool")),
  },

  /* ── DevSecOps & Cloud Converters ────────────────────────────────────── */
  {
    slug: "aws-iam-least-privilege-scoper",
    title: "IAM Least-Privilege Scoper",
    description:
      "Parses wildcard IAM statements, flags over-privileged actions (iam:*, s3:*, Resource: *), and generates a scoped least-privilege policy with ARN conditions.",
    category: "devsecops-cloud",
    type: "generator",
    icon: "ShieldCheck",
    enabled: true,
    component: lazy(() => import("@/components/tools/AwsIamLeastPrivilegeScoperTool")),
  },
  {
    slug: "github-actions-oidc-trust-generator",
    title: "GitHub Actions OIDC Trust Generator",
    description:
      "Generates AWS IAM Role Trust Policies and GCP Workload Identity Federation manifests from repo, branch, and environment inputs — zero static credentials.",
    category: "devsecops-cloud",
    type: "generator",
    icon: "ShieldCheck",
    enabled: true,
    component: lazy(() => import("@/components/tools/GithubActionsOidcTrustGeneratorTool")),
  },
  {
    slug: "cron-schedule-simulator",
    title: "Cron & CloudWatch Schedule Simulator",
    description:
      "Interactive builder for Linux cron, AWS CloudWatch rate/cron, and K8s CronJob with human-readable upcoming execution timestamps.",
    category: "devsecops-cloud",
    type: "calculator",
    icon: "Calculator",
    enabled: true,
    component: lazy(() => import("@/components/tools/CronScheduleSimulatorTool")),
  },

  /* ── Ergonomics & Active Desk Timers ─────────────────────────────────── */
  {
    slug: "desk-stretch-timer",
    title: "Desk Stretch Timer",
    description:
      "Pomodoro-style timer that prompts micro-exercises and desk stretches between focus blocks.",
    category: "ergonomics-active",
    type: "timer",
    icon: "Timer",
    enabled: true,
    component: lazy(() => import("@/components/tools/DeskStretchTimerTool")),
  },
  {
    slug: "focus-session-tracker",
    title: "Focus Session Tracker",
    description: "Track deep-work blocks with configurable movement reminders and streak stats.",
    category: "ergonomics-active",
    type: "tracker",
    icon: "Target",
    enabled: true,
    component: lazy(() => import("@/components/tools/FocusSessionTrackerTool")),
  },
  {
    slug: "desk-monitor-height-calculator",
    title: "Desk & Monitor Height Calculator",
    description:
      "Calculates exact sitting/standing desk heights, monitor placement, and viewing angle from your height, footwear, and mat thickness.",
    category: "ergonomics-active",
    type: "calculator",
    icon: "Monitor",
    enabled: true,
    component: lazy(() => import("@/components/tools/DeskMonitorHeightCalculatorTool")),
  },
  {
    slug: "twenty-twenty-eye-timer",
    title: "20-20-20 Eye Reset Timer",
    description:
      "Audio/visual interval timer signaling a 20-second visual reset every 20 minutes, with optional 60-second thoracic mobility prompts.",
    category: "ergonomics-active",
    type: "timer",
    icon: "Eye",
    enabled: true,
    component: lazy(() => import("@/components/tools/TwentyTwentyEyeTimerTool")),
  },
  {
    slug: "sit-stand-duty-cycle-pacer",
    title: "Sit-Stand Duty Cycle Pacer",
    description:
      "Customizable sit-stand interval timer with audio alerts and posture-check prompts tailored for deep focus sessions.",
    category: "ergonomics-active",
    type: "timer",
    icon: "PersonStanding",
    enabled: true,
    component: lazy(() => import("@/components/tools/SitStandDutyCyclePacerTool")),
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return toolsRegistry.find((t) => t.slug === slug && t.enabled);
}

export function getEnabledTools(): ToolDefinition[] {
  return toolsRegistry.filter((t) => t.enabled);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return toolsRegistry.filter((t) => t.enabled && t.category === category);
}
