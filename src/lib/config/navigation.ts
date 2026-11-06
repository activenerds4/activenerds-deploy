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
      groups: [
        {
          label: "Roadmaps & Reference",
          items: [
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
      ],
      viewAll: { label: "Explore Learning Hub", href: "/learning" },
    },
    {
      id: "certifications",
      label: "Certifications",
      href: "/certifications",
      enabled: true,
      cascade: true,
      groups: [
        {
          label: "Browse",
          items: [
            {
              label: "All Certifications Hub",
              href: "/certifications",
              description: "Unified credential roadmaps across all providers",
            },
          ],
        },
        {
          label: "VMware Cloud Foundation",
          items: [
            {
              label: "Cloud Foundation Administrator (2V0-17.25)",
              href: "/certifications/vmware/vcf-administrator",
              description: "Deploy, configure, manage & operate full-stack VCF private cloud",
            },
            {
              label: "Cloud Foundation Architect (2V0-13.25)",
              href: "/certifications/vmware/vcf9-architect",
              description: "Enterprise SDDC architectural design, RCAR framework & physical design",
            },
            {
              label: "VCF vSphere Kubernetes Service (3V0-24.25)",
              href: "/certifications/vmware/vks-tanzu",
              description: "Supervisor clusters, Tanzu Kubernetes Grid & container workloads",
            },
          ],
        },
        {
          label: "Amazon Web Services (AWS)",
          items: [
            {
              label: "AWS Certified Solutions Architect – Associate (SAA-C03)",
              href: "/certifications/aws/solutions-architect-associate",
              description: "Resilient VPC, compute, storage, IAM & high availability design",
            },
            {
              label: "AWS Certified Solutions Architect – Professional (SAP-C02 / SAP-C03)",
              href: "/certifications/aws/solutions-architect-professional",
              description: "Complex multi-account governance, hybrid networks, migration & DR",
            },
            {
              label: "AWS Certified Developer – Associate (DVA-C02 / DVA-C03)",
              href: "/certifications/aws/developer-associate",
              description: "Serverless Lambda, API Gateway, DynamoDB, Cognito & CI/CD",
            },
            {
              label: "AWS Certified SysOps Administrator – Associate (SOA-C02 / SOA-C03)",
              href: "/certifications/aws/cloudops-engineer-associate",
              description: "Monitoring, automated remediation, scaling, backup/DR & compliance",
            },
            {
              label: "AWS Certified Data Engineer – Associate (DEA-C01)",
              href: "/certifications/aws/data-engineer-associate",
              description: "Batch/streaming ingestion, Glue & EMR transformation & Lake Formation",
            },
            {
              label: "AWS Certified Machine Learning Engineer – Associate (MLA-C01 / MLA-C02)",
              href: "/certifications/aws/machine-learning-engineer-associate",
              description: "SageMaker model training, Bedrock FMs, GenAIOps & inference hosting",
            },
            {
              label: "AWS Certified Generative AI Developer – Professional (AIP-C01)",
              href: "/certifications/aws/generative-ai-developer-professional",
              description: "Bedrock agents, multi-agent flows, hybrid RAG & guardrails",
            },
          ],
        },
        {
          label: "Kubernetes & CNCF",
          items: [
            {
              label: "Certified Kubernetes Administrator (CKA)",
              href: "/certifications#k8s-cka",
              description: "Cluster architecture, installation, storage, networking & live troubleshooting (Coming Soon)",
            },
            {
              label: "Certified K8s Security Specialist (CKS)",
              href: "/certifications#k8s-cks",
              description: "Cluster hardening, vulnerability scanning, runtime security & Falco policies (Coming Soon)",
            },
            {
              label: "Certified K8s Application Developer (CKAD)",
              href: "/certifications#k8s-ckad",
              description: "Pods, deployments, ConfigMaps & ingress traffic routing (Coming Soon)",
            },
          ],
        },
        {
          label: "AI & Machine Learning",
          items: [
            {
              label: "AWS Certified AI Practitioner (AIF-C01)",
              href: "/certifications#ai-aif",
              description: "Foundational models, prompt engineering, fine-tuning & RAG architectures (Coming Soon)",
            },
            {
              label: "Google Cloud Professional ML Engineer",
              href: "/certifications#ai-gcp",
              description: "Vertex AI, ML pipelines, feature stores & model deployment (Coming Soon)",
            },
            {
              label: "Azure AI Engineer Associate (AI-102)",
              href: "/certifications#ai-az102",
              description: "Azure OpenAI, Cognitive Services & conversational AI solutions (Coming Soon)",
            },
          ],
        },
        {
          label: "HashiCorp Infrastructure",
          items: [
            {
              label: "Terraform Associate (003)",
              href: "/certifications#hashi-terraform",
              description: "HCL syntax, state management, provider configuration & module composition (Coming Soon)",
            },
            {
              label: "Vault Associate (002)",
              href: "/certifications#hashi-vault",
              description: "Dynamic secrets, auth backends, encryption-as-a-service & token policies (Coming Soon)",
            },
          ],
        },
        {
          label: "Microsoft Azure",
          items: [
            {
              label: "Azure Administrator (AZ-104)",
              href: "/certifications#azure-az104",
              description: "Entra ID, virtual networks, storage & compute VMs (Coming Soon)",
            },
            {
              label: "Azure Solutions Architect (AZ-305)",
              href: "/certifications#azure-az305",
              description: "Enterprise cloud governance, identity, disaster recovery & infrastructure design (Coming Soon)",
            },
            {
              label: "Azure AI Fundamentals (AI-900)",
              href: "/certifications#azure-ai900",
              description: "Computer vision, NLP, conversational AI & Azure Machine Learning workloads (Coming Soon)",
            },
          ],
        },
      ],
      viewAll: { label: "Explore All Certifications", href: "/certifications" },
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
