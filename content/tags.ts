/**
 * Canonical tag definitions for ActiveNerds.
 *
 * Post frontmatter `tags` values must match slugs from this list.
 */

export interface TagRef {
  slug: string;
  name: string;
  count: number;
}

export const tags: TagRef[] = [
  { slug: "kubernetes", name: "Kubernetes", count: 0 },
  { slug: "mlops", name: "MLOps", count: 0 },
  { slug: "llms", name: "LLMs", count: 0 },
  { slug: "pytorch", name: "PyTorch", count: 0 },
  { slug: "docker", name: "Docker", count: 0 },
  { slug: "devsecops", name: "DevSecOps", count: 0 },
  { slug: "standing-desk", name: "Standing Desk", count: 0 },
  { slug: "desk-stretches", name: "Desk Stretches", count: 0 },
  { slug: "habit-building", name: "Habit Building", count: 0 },
  { slug: "ergonomics", name: "Ergonomics", count: 0 },
  { slug: "deep-work", name: "Deep Work", count: 0 },
  { slug: "conferences", name: "Conferences", count: 0 },
  { slug: "fitness-trackers", name: "Fitness Trackers", count: 0 },
  { slug: "affiliate", name: "Affiliate", count: 0 },
  { slug: "aws", name: "AWS", count: 0 },
  { slug: "eks", name: "EKS", count: 0 },
  { slug: "gateway-api", name: "Gateway API", count: 0 },
  { slug: "networking", name: "Networking", count: 0 },
  { slug: "desk-setup", name: "Desk Setup", count: 0 },
  { slug: "wellness", name: "Wellness", count: 0 },
  { slug: "productivity", name: "Productivity", count: 0 },
  { slug: "remote-work", name: "Remote Work", count: 0 },
  { slug: "npm", name: "npm", count: 0 },
  { slug: "supply-chain", name: "Supply Chain", count: 0 },
  { slug: "github", name: "GitHub", count: 0 },
  { slug: "security", name: "Security", count: 0 },
  { slug: "devops", name: "DevOps", count: 0 },
  { slug: "nftables", name: "nftables", count: 0 },
  { slug: "coredns", name: "CoreDNS", count: 0 },
  { slug: "ai-security", name: "AI Security", count: 0 },
  { slug: "python", name: "Python", count: 0 },
  { slug: "cosign", name: "Cosign", count: 0 },
  { slug: "slsa", name: "SLSA", count: 0 },
];
