/**
 * Canonical category definitions for ActiveNerds.
 *
 * Post frontmatter `category` values must match one of these slugs.
 */

export interface CategoryRef {
  slug: string;
  name: string;
  description?: string;
}

export const categories: CategoryRef[] = [
  { slug: "ai-machine-learning", name: "AI & Machine Learning", description: "Model training, MLOps, LLMs, inference optimization, PyTorch/TensorFlow, AI tooling. The core technical pillar." },
  { slug: "containers-kubernetes", name: "Containers & Kubernetes", description: "Container orchestration, cluster management, operators, service mesh, platform engineering on K8s." },
  { slug: "fitness-wellness-tech", name: "Fitness & Wellness for Tech", description: "Desk-based micro-exercises, habit-building, routines for busy tech schedules, ergonomics, movement snacks — peer-to-peer, never preachy." },
  { slug: "devsecops-security", name: "DevSecOps & Security", description: "Cloud-native security, supply chain, policy-as-code, threat modeling, compliance automation for cloud workloads." },
  { slug: "gear-gadgets", name: "Gear & Gadgets", description: "Standing desks, under-desk treadmills, fitness trackers, ergonomic gear, gadgets that help desk-bound pros move more. Reviews + affiliate." },
  { slug: "events-community", name: "Events & Community", description: "Conferences, hackathons, meetups — filterable listings, guides for attending/speaking, community spotlights." },
  { slug: "platform-engineering-devops", name: "Platform Engineering & DevOps", description: "Cross-cutting technical practices — CI/CD, IaC, observability, dev environments, workflow optimization for high-focus work." },
  { slug: "focus-productivity", name: "Focus & Productivity", description: "Techniques for deep work, focus management, burnout prevention, sustainable pacing during long training runs and on-call rotations." },
];
