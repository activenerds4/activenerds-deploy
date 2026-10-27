import { Link } from "react-router-dom";
import { BookOpen, CheckSquare, FileText, Calendar, ArrowRight, Download, ExternalLink } from "lucide-react";

interface ResourceCard {
  slug: string;
  title: string;
  description: string;
  type: "Cheat Sheet" | "Checklist" | "Guide" | "Calendar";
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const featuredResources: ResourceCard[] = [
  {
    slug: "k8s-kubectl-rapid-reference",
    title: "Kubernetes & Containers Rapid Reference",
    description: "Compact cheatsheet covering essential kubectl commands, pod debug routines, and production manifest snippets.",
    type: "Cheat Sheet",
    tag: "Kubernetes",
    icon: FileText,
    href: "/resources/cheatsheets",
  },
  {
    slug: "zero-trust-container-build-checklist",
    title: "Zero-Trust Container Build Checklist",
    description: "Step-by-step security hardening checklist covering non-root execution, minimal distroless bases, and SBOM generation.",
    type: "Checklist",
    tag: "DevSecOps",
    icon: CheckSquare,
    href: "/resources/checklists",
  },
  {
    slug: "ai-llm-fine-tuning-guide",
    title: "AI & LLM Fine-Tuning Architectural Playbook",
    description: "Full guide on LoRA, QLoRA, memory budgeting, and evaluation pipelines for production domain-specific models.",
    type: "Guide",
    tag: "AI & ML",
    icon: BookOpen,
    href: "/resources/guides",
  },
  {
    slug: "tech-conference-calendar",
    title: "Tech Conference & CFP Tracker",
    description: "Worldwide directory of upcoming KubeCon, PyTorch, DevOpsDays, and AI research summits with CFP deadlines.",
    type: "Calendar",
    tag: "Events",
    icon: Calendar,
    href: "/resources/tech-conference-calendar",
  },
];

export const DeveloperResourcesDeck = () => {
  return (
    <section id="resources-section" className="py-12 sm:py-16 border-t border-border/80 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-mono font-medium text-accent mb-2">
              <BookOpen className="h-3.5 w-3.5" />
              Developer Knowledge Deck
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
              Curated Reference Cards & Production Checklists
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-muted-foreground max-w-2xl">
              High-density, printable cheatsheets and interactive go-live checklists designed for quick terminal and deployment lookups.
            </p>
          </div>

          <Link
            to="/resources"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline shrink-0"
          >
            Browse all resources <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Resources Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredResources.map((res) => {
            const Icon = res.icon;
            return (
              <Link
                key={res.slug}
                to={res.href}
                className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border border-border text-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-accent">
                      {res.type}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    {res.tag}
                  </p>

                  <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                    {res.title}
                  </h3>

                  <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-accent group-hover:text-accent">
                  <span>View Resource</span>
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

export default DeveloperResourcesDeck;
