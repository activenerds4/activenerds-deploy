import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShieldCheck, ArrowRight, Clock, Filter, X } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import {
  getChecklists,
  getChecklistTags,
  CHECKLIST_CATEGORIES,
} from "@/lib/config/checklist-registry";
import {
  checklistCategoryLabels,
  checklistCategoryDescriptions,
  type ChecklistCategory,
} from "@/lib/content/checklist-schema";
import { cn } from "@/lib/utils";

const ChecklistsPage = () => {
  const allSheets = getChecklists();
  const allTags = getChecklistTags();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get("category") as ChecklistCategory | null;
  const activeTag = searchParams.get("tag");

  const [query, setQuery] = useState("");

  /** Set or clear a single query param without losing the other. */
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allSheets.filter((sheet) => {
      if (activeCategory && sheet.category !== activeCategory) return false;
      if (activeTag && !sheet.tags.includes(activeTag)) return false;
      if (!q) return true;
      return (
        sheet.title.toLowerCase().includes(q) ||
        sheet.description.toLowerCase().includes(q) ||
        sheet.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [allSheets, activeCategory, activeTag, query]);

  /** Group filtered sheets by category for display. */
  const grouped = useMemo(() => {
    const map = new Map<ChecklistCategory, typeof allSheets>();
    for (const cat of CHECKLIST_CATEGORIES) {
      const items = filtered.filter((s) => s.category === cat);
      if (items.length > 0) map.set(cat, items);
    }
    return map;
  }, [filtered]);

  const hasFilters = Boolean(activeCategory || activeTag || query);

  return (
    <>
      <Seo
        title="Checklists — AI/ML, Kubernetes, DevSecOps & Ergonomics"
        description="Interactive audit checklists for AI/ML systems, Kubernetes & cloud-native, DevSecOps & cloud architecture, and active desk ergonomics. Filterable by category and tag."
        path="/resources/checklists"
      />
      <Container className="py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="eyebrow mb-2">
            <Link to="/resources" className="text-muted-foreground hover:text-foreground">
              Resources
            </Link>{" "}
            / Checklists
          </p>
          <h1 className="display-heading text-4xl">Checklists</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Production-readiness, security, and ergonomics audits you can actually run. Grouped by
            domain, filterable by tag — work through them before you ship, not after.
          </p>
        </div>

        {/* Category quick-filter chips */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5" aria-hidden />
            Categories
          </span>
          <button
            type="button"
            onClick={() => setParam("category", null)}
            aria-pressed={!activeCategory}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              !activeCategory
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
            )}
          >
            All
          </button>
          {CHECKLIST_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setParam("category", activeCategory === cat ? null : cat)}
              aria-pressed={activeCategory === cat}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                activeCategory === cat
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
              )}
            >
              {checklistCategoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Tag quick-filter chips + search */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {allTags.slice(0, 10).map((tag) => (
              <button
                key={tag.slug}
                type="button"
                onClick={() => setParam("tag", activeTag === tag.slug ? null : tag.slug)}
                aria-pressed={activeTag === tag.slug}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  activeTag === tag.slug
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {tag.name}
                <span className="ml-1 opacity-60">{tag.count}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="search"
              placeholder="Search checklists..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Search checklists"
            />
          </div>
        </div>

        {/* Active filter summary + clear */}
        {hasFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Filters:</span>
            {activeCategory && (
              <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-xs text-accent">
                {checklistCategoryLabels[activeCategory]}
                <button
                  type="button"
                  onClick={() => setParam("category", null)}
                  aria-label={`Clear category filter ${checklistCategoryLabels[activeCategory]}`}
                  className="rounded-sm hover:opacity-70"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            )}
            {activeTag && (
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {activeTag}
                <button
                  type="button"
                  onClick={() => setParam("tag", null)}
                  aria-label={`Clear tag filter ${activeTag}`}
                  className="rounded-sm hover:opacity-70"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            )}
            {query && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs">
                “{query}”
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="rounded-sm hover:opacity-70"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setParam("category", null);
                setParam("tag", null);
                setQuery("");
              }}
              className="text-xs font-medium text-accent hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Grouped results */}
        {grouped.size === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              No checklists match your filters. Try clearing them.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Array.from(grouped.entries()).map(([category, sheets]) => (
              <section key={category} aria-labelledby={`cl-${category}`}>
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <div>
                    <h2 id={`cl-${category}`} className="display-heading text-2xl text-accent">
                      {checklistCategoryLabels[category]}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {checklistCategoryDescriptions[category]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setParam("category", category)}
                    className="shrink-0 text-xs font-medium text-accent hover:underline"
                  >
                    View only this category
                  </button>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {sheets.map((sheet) => (
                    <Link
                      key={sheet.slug}
                      to={`/resources/checklists/${sheet.slug}`}
                      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/50 hover:bg-accent/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <ShieldCheck className="h-5 w-5" aria-hidden />
                      </div>
                      <h3 className="mb-1.5 text-base font-semibold text-foreground">
                        {sheet.title}
                      </h3>
                      <p className="mb-4 flex-1 text-sm text-muted-foreground">
                        {sheet.description}
                      </p>

                      {sheet.tags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {sheet.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden />
                          {sheet.readingTime} min
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-accent">
                          Open
                          <ArrowRight
                            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                            aria-hidden
                          />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>
    </>
  );
};

export default ChecklistsPage;
