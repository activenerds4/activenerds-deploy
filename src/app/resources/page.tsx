import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FileText, ShieldCheck, BookOpen, Calendar, ArrowRight, Search } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import { getEnabledResources } from "@/lib/config/resources-registry";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "cheat-sheet": FileText,
  checklist: ShieldCheck,
  guide: BookOpen,
  directory: Calendar,
};

const typeLabels: Record<string, string> = {
  "cheat-sheet": "Cheat Sheet",
  checklist: "Checklist",
  guide: "Guide",
  directory: "Directory",
};

const ResourcesPage = () => {
  const resources = getEnabledResources();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return resources;
    return resources.filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
    );
  }, [resources, query]);

  return (
    <>
      <Seo
        title="Resources — Cheat Sheets, Guides & Reference"
        description="Cheat sheets, security checklists, ergonomics guides, and a tech conference calendar for AI/ML, Kubernetes, and DevSecOps professionals."
        path="/resources"
      />
      <Container className="py-12">
        <div className="mb-10">
          <p className="eyebrow mb-2">Resources</p>
          <h1 className="display-heading text-4xl">Reference & resources</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Cheat sheets, security checklists, ergonomics guides, and a tech conference calendar —
            everything you need, organized for quick access.
          </p>
        </div>

        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Search resources"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => {
            const Icon = iconMap[resource.type] ?? FileText;
            return (
              <Link
                key={resource.slug}
                to={`/resources/${resource.slug}`}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent/50 hover:bg-accent/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <span className="mb-2 inline-block text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {typeLabels[resource.type] ?? resource.type}
                </span>
                <h3 className="mb-1.5 text-base font-semibold text-foreground">{resource.title}</h3>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  Explore
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No resources match "{query}".
          </p>
        )}
      </Container>
    </>
  );
};

export default ResourcesPage;
