/**
 * Configurable Navigation Schema
 *
 * Central, strongly-typed navigation configuration. Admins can enable/disable
 * items, rename labels, reorder, add dropdown children, badges, and mega-menu
 * groups. The SiteHeader and MobileNavigation consume this config — no need to
 * edit component code to change the menu.
 *
 * Preset C (Content + Tools): Articles, Tools, Resources (About, FAQ, Contact partitioned to footer)
 */

import { categories } from "../../../content/categories";

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface NavChildItem {
  /** Display label */
  label: string;
  /** Internal path or external URL */
  href: string;
  /** Optional short description shown in mega-menu */
  description?: string;
  /** Optional icon name (lucide-react) */
  icon?: string;
  /** Mark as external link (opens new tab) */
  external?: boolean;
}

export interface NavMenuGroup {
  /** Group heading shown in the mega-menu panel */
  label: string;
  /** Links within this group */
  items: NavChildItem[];
}

export interface NavBadge {
  text: string;
  variant: "new" | "beta" | "hot";
}

export interface NavItem {
  /** Unique identifier */
  id: string;
  /** Display label in the nav bar */
  label: string;
  /** Internal route path or external URL */
  href: string;
  /** Enable/disable this item without removing it */
  enabled: boolean;
  /** Badge tag (e.g. "New", "Beta") */
  badge?: NavBadge;
  /** External link (opens new tab) */
  external?: boolean;
  /** Simple dropdown: single-column list of links */
  children?: NavChildItem[];
  /** Mega-menu: multi-column grouped links */
  groups?: NavMenuGroup[];
  /**
   * Cascading mode: renders `groups` as a single click-to-reveal list.
   * The first group is shown flat (e.g. "Browse"); remaining groups render
   * as category rows that must be clicked to reveal their items in a
   * secondary flyout panel — instead of showing every group's items at once.
   */
  cascade?: boolean;
  /** Promo card shown in mega-menu (highlighted content) */
  promo?: {
    title: string;
    description: string;
    href: string;
    ctaLabel: string;
  };
  /** "View all" link at the bottom of dropdowns */
  viewAll?: { label: string; href: string };
}

export interface NavigationConfig {
  /** Top-level nav items in display order */
  items: NavItem[];
  /** Header CTA button */
  cta?: { label: string; href: string };
}

/* ── Preset C: Content + Tools ─────────────────────────────────────────── */

const MAX_DROPDOWN_CATEGORIES = 8;

export const navigationConfig: NavigationConfig = {
  items: [
    {
      id: "articles",
      label: "Articles",
      href: "/articles",
      enabled: true,
      groups: [
        {
          label: "Categories",
          items: categories.slice(0, MAX_DROPDOWN_CATEGORIES).map((cat) => ({
            label: cat.name,
            href: `/category/${cat.slug}`,
            description: cat.description,
          })),
        },
        {
          label: "Browse",
          items: [
            { label: "All Articles", href: "/articles", description: "Browse every article" },
            {
              label: "By Author",
              href: "/articles#authors",
              description: "Find writers you follow",
            },
            { label: "Archive", href: "/articles#archive", description: "Past articles by month" },
          ],
        },
      ],
      ...(categories.length > MAX_DROPDOWN_CATEGORIES
        ? { viewAll: { label: "View all categories", href: "/articles#categories" } }
        : {}),
    },
    {
      id: "deep-learning",
      label: "Deep Learning",
      href: "/learning",
      enabled: true,
      children: [
        {
          label: "Learning Paths",
          href: "/learning/paths",
          description: "Curated roadmaps: Docker, Kubernetes, Gen AI, Agentic AI",
        },
        {
          label: "Q&A Challenges",
          href: "/learning/challenges",
          description: "Interactive mechanism puzzles with Flashcards, Scenarios, and Quizzes",
        },
        {
          label: "Glossary",
          href: "/learning/glossary",
          description: "Mechanism-first definitions with failure modes and mental models",
        },
        {
          label: "Cheat Sheets",
          href: "/learning/cheat-sheets",
          description: "High-density terminal and architecture reference cards",
        },
      ],
    },
    {
      id: "tools",
      label: "Tools",
      href: "/tools",
      enabled: true,
      cascade: true,
      groups: [
        {
          label: "Browse",
          items: [
            {
              label: "All Tools Hub",
              href: "/tools",
              description: "Every interactive utility in one place",
            },
          ],
        },
        {
          label: "AI & LLM Calculators",
          items: [
            {
              label: "Training Run Cost Estimator",
              href: "/tools/training-run-cost-estimator",
              description: "GPU training time & cloud cost",
            },
            {
              label: "LLM VRAM & Hardware Sizer",
              href: "/tools/llm-vram-hardware-sizer",
              description: "VRAM/RAM by quantization & context",
            },
            {
              label: "Embedding & Token Estimator",
              href: "/tools/embedding-token-estimator",
              description: "Token counts & chunk splits",
            },
            {
              label: "Structured Output Schema Generator",
              href: "/tools/structured-output-schema-generator",
              description: "TS/Zod/Pydantic → JSON schema",
            },
          ],
        },
        {
          label: "Kubernetes & Container Utilities",
          items: [
            {
              label: "K8s Manifest Validator",
              href: "/tools/k8s-manifest-validator",
              description: "Validate YAML against best practices",
            },
            {
              label: "K8s Resource & Quota Calculator",
              href: "/tools/k8s-resource-quota-calculator",
              description: "CPU/memory limits & quota YAML generator",
            },
            {
              label: "NetworkPolicy Visualizer",
              href: "/tools/k8s-network-policy-generator",
              description: "Interactive ingress/egress policy builder",
            },
            {
              label: "K8s Exit Code Diagnostics",
              href: "/tools/k8s-exit-code-diagnostics",
              description: "Triage CrashLoopBackOff & exit codes 137/139",
            },
          ],
        },
        {
          label: "DevSecOps & Cloud Converters",
          items: [
            {
              label: "IAM Least-Privilege Scoper",
              href: "/tools/aws-iam-least-privilege-scoper",
              description: "Parse wildcards & scope IAM policies",
            },
            {
              label: "GitHub Actions OIDC Trust Generator",
              href: "/tools/github-actions-oidc-trust-generator",
              description: "Keyless cloud auth trust policies",
            },
            {
              label: "Cron Schedule Simulator",
              href: "/tools/cron-schedule-simulator",
              description: "Linux cron & CloudWatch rate/cron builder",
            },
          ],
        },
        {
          label: "Ergonomics & Active Desk Timers",
          items: [
            {
              label: "Desk Stretch Timer",
              href: "/tools/desk-stretch-timer",
              description: "Pomodoro timer with stretch prompts",
            },
            {
              label: "Focus Session Tracker",
              href: "/tools/focus-session-tracker",
              description: "Deep-work blocks with movement reminders",
            },
            {
              label: "Desk & Monitor Height Calculator",
              href: "/tools/desk-monitor-height-calculator",
              description: "Ergonomic sitting/standing & monitor placement",
            },
            {
              label: "20-20-20 Eye Reset Timer",
              href: "/tools/twenty-twenty-eye-timer",
              description: "Visual reset timer with thoracic mobility prompts",
            },
            {
              label: "Sit-Stand Duty Cycle Pacer",
              href: "/tools/sit-stand-duty-cycle-pacer",
              description: "Customizable sit-stand interval timer with alerts",
            },
          ],
        },
      ],
    },
    {
      id: "resources",
      label: "Resources",
      href: "/resources",
      enabled: true,
      cascade: true,
      groups: [
        {
          label: "Browse",
          items: [
            {
              label: "All Resources",
              href: "/resources",
              description: "Main hub — guides, checklists & directories",
            },
            {
              label: "Checklists",
              href: "/resources/checklists",
              description: "Security, deployment & wellness checklists",
            },
            {
              label: "Guides",
              href: "/resources/guides",
              description: "Deep-dive architectural walkthroughs",
            },
            {
              label: "Tech Conference Calendar",
              href: "/resources/tech-conference-calendar",
              description: "KubeCon, AI conferences, hackathons",
            },
            { label: "FAQ", href: "/faq", description: "Common questions answered" },
          ],
        },
        {
          label: "Checklist Collections",
          items: [
            {
              label: "AI & LLM Systems",
              href: "/resources/checklists?category=ai-ml",
              description: "Production readiness, RAG & agent safety",
            },
            {
              label: "Kubernetes & Cloud-Native",
              href: "/resources/checklists?category=kubernetes",
              description: "Cluster go-live, incidents & isolation",
            },
            {
              label: "DevSecOps & Cloud",
              href: "/resources/checklists?category=devsecops",
              description: "Supply chain, AWS baseline & zero-trust build",
            },
            {
              label: "Active Desk & Ergonomics",
              href: "/resources/checklists?category=active-tech",
              description: "Workspace, on-call reset & standing desk",
            },
          ],
        },
        {
          label: "Guide Collections",
          items: [
            {
              label: "Physical Ergonomics & Workday Longevity",
              href: "/resources/guides?category=active-tech",
              description: "Workstation engineering, on-call recovery & mobility",
            },
            {
              label: "AI-Augmented DevEx & Workflows",
              href: "/resources/guides?category=ai-ml",
              description: "Agentic IDEs, local LLMs & AI code review",
            },
            {
              label: "Kubernetes & Cloud-Native",
              href: "/resources/guides?category=kubernetes",
              description: "Zero-downtime deploys, node tuning & fleet GitOps",
            },
            {
              label: "DevSecOps & Zero-Trust Cloud",
              href: "/resources/guides?category=devsecops",
              description: "Keyless CI/CD, supply chain & secrets management",
            },
          ],
        },
        {
          label: "Conference Guides",
          items: [
            {
              label: "KubeCon + CloudNativeCon NA",
              href: "/resources/conferences/kubecon-cloudnativecon-na",
              description: "Passes, co-located days, tracks & Vegas survival",
            },
            {
              label: "KubeCon + CloudNativeCon EU",
              href: "/resources/conferences/kubecon-cloudnativecon-europe",
              description: "EU edition, regulated-industry case studies & travel",
            },
            {
              label: "NVIDIA GTC",
              href: "/resources/conferences/nvidia-gtc-global",
              description: "GPU architecture, CUDA, inference & the AI roadmap",
            },
            {
              label: "AWS re:Invent",
              href: "/resources/conferences/aws-reinvent-las-vegas",
              description: "Multi-venue strategy, chalk talks & Vegas wellness",
            },
            {
              label: "Black Hat & DEF CON",
              href: "/resources/conferences/black-hat-defcon-vegas",
              description: "Offensive research, cloud security & OPSEC",
            },
            {
              label: "All Conference Guides",
              href: "/resources/tech-conference-calendar",
              description: "Full calendar with links to every event guide",
            },
          ],
        },
      ],
      promo: {
        title: "Getting Started Guide",
        description: "Everything you need to launch your first project with confidence.",
        href: "/resources/getting-started",
        ctaLabel: "Read guide",
      },
    },
    // Utility links disabled in top navigation bar — relocated to footer
    { id: "about", label: "About", href: "/about", enabled: false },
    { id: "faq", label: "FAQ", href: "/faq", enabled: false },
    { id: "contact", label: "Contact", href: "/contact", enabled: false },
  ],
  cta: { label: "Subscribe", href: "/subscribe" },
};

/* ── Helpers ───────────────────────────────────────────────────────────── */

/** Returns only enabled nav items */
export function getEnabledNavItems(): NavItem[] {
  return navigationConfig.items.filter((item) => item.enabled);
}

/** Check if a nav item has a dropdown (children or groups) */
export function hasDropdown(item: NavItem): boolean {
  return !!item.children || !!item.groups;
}
