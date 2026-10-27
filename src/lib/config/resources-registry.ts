export interface ResourceDefinition {
  slug: string;
  title: string;
  description: string;
  type: "cheat-sheet" | "checklist" | "guide" | "directory";
  category: string;
  tags: string[];
  enabled: boolean;
  downloadUrl?: string;
}

export const resourcesRegistry: ResourceDefinition[] = [
  {
    slug: "cheatsheets",
    title: "Cheat Sheets",
    description:
      "Quick-reference cards for AI/ML, Kubernetes, DevSecOps, and ergonomics — grouped by topic and filterable by tag.",
    type: "cheat-sheet",
    category: "containers-kubernetes",
    tags: ["kubernetes", "devsecops", "ergonomics"],
    enabled: true,
  },
  {
    slug: "checklists",
    title: "Checklists",
    description:
      "Interactive audit checklists for AI/ML systems, Kubernetes, DevSecOps, and active desk ergonomics — grouped by domain and filterable by tag.",
    type: "checklist",
    category: "devsecops-security",
    tags: ["devsecops", "kubernetes", "ergonomics", "ai-ml"],
    enabled: true,
  },
  {
    slug: "guides",
    title: "Guides",
    description:
      "Long-form architectural guides for desk ergonomics, AI-augmented devex, Kubernetes platform engineering, and zero-trust DevSecOps pipelines — grouped by domain and filterable by tag.",
    type: "guide",
    category: "fitness-wellness-tech",
    tags: ["ergonomics", "kubernetes", "devsecops", "ai-ml"],
    enabled: true,
  },
  {
    slug: "desk-setup-ergonomics-guide",
    title: "Desk Setup & Ergonomics Guide",
    description:
      "Illustrated guide to optimal desk height, monitor placement, and peripheral choices for tech pros.",
    type: "guide",
    category: "fitness-wellness-tech",
    tags: ["ergonomics", "standing-desk"],
    enabled: true,
  },
  {
    slug: "tech-conference-calendar",
    title: "Tech Conference Calendar",
    description:
      "Curated, filterable calendar of KubeCon, AI conferences, hackathons, and meetups worldwide.",
    type: "directory",
    category: "events-community",
    tags: ["conferences"],
    enabled: true,
  },
];

export function getResourceBySlug(slug: string): ResourceDefinition | undefined {
  return resourcesRegistry.find((r) => r.slug === slug && r.enabled);
}

export function getEnabledResources(): ResourceDefinition[] {
  return resourcesRegistry.filter((r) => r.enabled);
}
