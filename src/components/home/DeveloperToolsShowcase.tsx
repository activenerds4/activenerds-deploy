import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Calculator,
  Boxes,
  ShieldCheck,
  Activity,
  ArrowRight,
  Sparkles,
  Terminal,
  Zap,
  Timer,
  Hash,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolItem {
  slug: string;
  title: string;
  description: string;
  category: "all" | "ai" | "k8s" | "security" | "health";
  categoryLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeText: string;
}

const featuredTools: ToolItem[] = [
  {
    slug: "llm-vram-hardware-sizer",
    title: "LLM VRAM & Hardware Sizer",
    description: "Calculates precise GPU VRAM and system RAM requirements across GGUF, AWQ, and EXL2 quantization formats.",
    category: "ai",
    categoryLabel: "AI & LLMs",
    icon: Cpu,
    badgeText: "Instant Calc",
  },
  {
    slug: "training-run-cost-estimator",
    title: "Training Run Cost Estimator",
    description: "Forecast multi-GPU training duration and cloud infrastructure costs (H100, A100, L40S) for custom LLMs.",
    category: "ai",
    categoryLabel: "AI & LLMs",
    icon: Calculator,
    badgeText: "Cost Modeling",
  },
  {
    slug: "k8s-resource-quota-calculator",
    title: "K8s Resource & Quota Calculator",
    description: "Generate production CPU/memory limits, namespace quota definitions, and OOM-kill prevention rules.",
    category: "k8s",
    categoryLabel: "Kubernetes",
    icon: Boxes,
    badgeText: "Manifest Builder",
  },
  {
    slug: "k8s-network-policy-generator",
    title: "NetworkPolicy Visualizer",
    description: "Interactive visual policy designer for Kubernetes ingress/egress CIDRs, namespace selectors, and port rules.",
    category: "k8s",
    categoryLabel: "Kubernetes",
    icon: Terminal,
    badgeText: "Zero-Trust",
  },
  {
    slug: "aws-iam-least-privilege-scoper",
    title: "IAM Least-Privilege Scoper",
    description: "Parse wildcard actions and generate tightly scoped AWS IAM policies to remediate security findings.",
    category: "security",
    categoryLabel: "DevSecOps",
    icon: ShieldCheck,
    badgeText: "Security Tool",
  },
  {
    slug: "sit-stand-duty-cycle-pacer",
    title: "Sit-Stand Duty Cycle Pacer",
    description: "Customizable sitting vs standing interval audio-visual pacer tailored for active desk programmers.",
    category: "health",
    categoryLabel: "Desk Health",
    icon: Activity,
    badgeText: "Active Timer",
  },
  {
    slug: "twenty-twenty-eye-timer",
    title: "20-20-20 Eye Reset Timer",
    description: "Visual fatigue reset timer with thoracic spine mobility prompts to combat screen strain during long debugging sessions.",
    category: "health",
    categoryLabel: "Desk Health",
    icon: Eye,
    badgeText: "Ergonomics",
  },
  {
    slug: "cron-schedule-simulator",
    title: "Cron Schedule Simulator",
    description: "Interactive builder and visual timeline simulator for Linux crontab and CloudWatch event schedules.",
    category: "security",
    categoryLabel: "DevSecOps",
    icon: Timer,
    badgeText: "Syntax Tool",
  },
];

const categoryTabs = [
  { id: "all", label: "All Utilities" },
  { id: "ai", label: "AI & LLM" },
  { id: "k8s", label: "Kubernetes" },
  { id: "security", label: "DevSecOps & Cloud" },
  { id: "health", label: "Desk Ergonomics" },
];

export const DeveloperToolsShowcase = () => {
  const [activeTab, setActiveTab] = useState<string>("all");

  const displayedTools =
    activeTab === "all"
      ? featuredTools
      : featuredTools.filter((t) => t.category === activeTab);

  return (
    <section id="tools-section" className="py-12 sm:py-16 border-t border-border/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-mono font-medium text-accent mb-2">
              <Zap className="h-3.5 w-3.5" />
              Interactive Developer Toolkit
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
              Browser-Based Engineering Calculators & Timers
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Zero-install, client-side utilities engineered for LLM sizing, Kubernetes capacity planning, cloud security scoping, and active desk longevity.
            </p>
          </div>

          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline shrink-0"
          >
            Explore all 14 tools <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {categoryTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-ring",
                  isSelected
                    ? "bg-foreground text-background shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tools Cards Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {displayedTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.slug}
                to={`/tools/${tool.slug}`}
                className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
                      {tool.badgeText}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold mb-1">
                    {tool.categoryLabel}
                  </p>

                  <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                    {tool.title}
                  </h3>

                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                  <span>Launch Tool</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DeveloperToolsShowcase;
