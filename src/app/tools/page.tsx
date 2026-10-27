import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Timer,
  ShieldCheck,
  Target,
  Calculator,
  Cpu,
  Boxes,
  Activity,
  Braces,
  Hash,
  AlertTriangle,
  ArrowRight,
  Search,
  Monitor,
  Eye,
  PersonStanding,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import { getEnabledTools, toolCategories, type ToolCategory } from "@/lib/config/tools-registry";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Timer,
  ShieldCheck,
  Target,
  Calculator,
  Cpu,
  Boxes,
  Activity,
  Braces,
  Hash,
  AlertTriangle,
  Monitor,
  Eye,
  PersonStanding,
};

const ToolsPage = () => {
  const tools = getEnabledTools();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return tools.filter((t) => {
      const matchesQuery =
        !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      const matchesCategory = activeCategory === "all" || t.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [tools, query, activeCategory]);

  const countFor = (cat: ToolCategory | "all") =>
    cat === "all" ? tools.length : tools.filter((t) => t.category === cat).length;

  return (
    <>
      <Seo
        title="Tools — Interactive Utilities for Tech Pros"
        description="Free interactive tools for AI/ML, Kubernetes, DevSecOps, and ergonomics — VRAM sizers, token estimators, manifest validators, IAM scopers, and desk timers. No signup required."
        path="/tools"
      />
      <Container className="py-12">
        <div className="mb-10">
          <p className="eyebrow mb-2">Tools</p>
          <h1 className="display-heading text-4xl">Interactive tools & utilities</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Client-side utilities for AI/ML, Kubernetes, DevSecOps, and ergonomics — built to help
            you work smarter and move more. No signup, no backend, no latency.
          </p>
        </div>

        {/* Category tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <CategoryChip
            label="All Tools"
            count={countFor("all")}
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          {toolCategories.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.label}
              count={countFor(cat.id)}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>

        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Search tools"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => {
            const Icon = tool.icon ? (iconMap[tool.icon] ?? Calculator) : Calculator;
            const cat = toolCategories.find((c) => c.id === tool.category);
            return (
              <Link
                key={tool.slug}
                to={`/tools/${tool.slug}`}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent/50 hover:bg-accent/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  {cat && (
                    <span className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {cat.label.split(" ")[0]}
                    </span>
                  )}
                </div>
                <h2 className="mb-2 text-lg font-semibold text-foreground">{tool.title}</h2>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  Launch tool
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No tools match your filters.
          </p>
        )}
      </Container>
    </>
  );
};

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
          active ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

export default ToolsPage;
