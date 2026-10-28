import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  Filter,
  ArrowRight,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  ALL_GLOSSARY_ENTRIES,
  searchGlossary,
  filterGlossary,
} from "@/lib/learning/glossary";
import { type GlossaryTopic, type GlossaryType, type GlossaryLevel } from "@/lib/learning/glossary-types";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/layout/Seo";

const TOPICS: { slug: GlossaryTopic; label: string }[] = [
  { slug: "docker", label: "Docker" },
  { slug: "kubernetes", label: "Kubernetes" },
  { slug: "gen-ai", label: "Gen AI" },
  { slug: "agentic-ai", label: "Agentic AI" },
];

const GlossaryIndexPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const filteredEntries = useMemo(() => {
    let result = ALL_GLOSSARY_ENTRIES;

    if (searchQuery.trim()) {
      result = searchGlossary(searchQuery, result);
    }

    if (selectedTopic !== "all") {
      result = filterGlossary(result, { topics: [selectedTopic as GlossaryTopic] });
    }

    if (selectedLevel !== "all") {
      result = filterGlossary(result, { levels: [selectedLevel as GlossaryLevel] });
    }

    return result;
  }, [searchQuery, selectedTopic, selectedLevel]);

  const levelColor = (level: string) => {
    switch (level) {
      case "advanced":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "intermediate":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Seo
        title="Mechanism-First Glossary | Active Nerds"
        description="Searchable, low-level definitions of Docker, Kubernetes, Gen AI, and Agentic AI primitives without the marketing fluff."
        path="/learning/glossary"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link to="/learning" className="hover:text-primary transition-colors">
          Deep Learning
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Glossary</span>
      </nav>

      {/* Header */}
      <header className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-10 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
          <BookOpen className="h-4 w-4" />
          <span>Mechanism-First Definitions</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Engineering Glossary
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Low-level primitives, protocols, and architecture patterns across infrastructure and modern AI. Every term focuses on physical mechanisms, boundaries, and production trade-offs.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl pt-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by term, definition, or primitive..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/80 bg-background/80 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono shadow-sm"
          />
        </div>
      </header>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Topic Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedTopic("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              selectedTopic === "all"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "border border-border/70 bg-card/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Topics ({ALL_GLOSSARY_ENTRIES.length})
          </button>
          {TOPICS.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => setSelectedTopic(t.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedTopic === t.slug
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "border border-border/70 bg-card/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/60 p-1 text-xs font-mono">
          {["all", "beginner", "intermediate", "advanced"].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                selectedLevel === lvl
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Glossary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEntries.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-border/70 bg-card/40 p-12 text-center text-muted-foreground space-y-2">
            <Filter className="mx-auto h-8 w-8 text-primary/40" />
            <p className="text-base font-semibold text-foreground">No matching terms found</p>
            <p className="text-xs">Try clearing the search query or adjusting your filters.</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <Link
              key={entry.slug}
              to={`/learning/glossary/${entry.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card/50 p-5 hover:border-primary/50 hover:bg-card transition-all shadow-sm space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-mono font-medium border ${levelColor(
                      entry.level
                    )}`}
                  >
                    {entry.level}
                  </span>
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">
                    {entry.type.replace("_", " ")}
                  </span>
                </div>

                <h2 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {entry.term}
                </h2>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {entry.summary || entry.definition}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/50 font-mono text-[11px] text-muted-foreground">
                <div className="flex gap-1.5 flex-wrap">
                  {entry.topics.map((top) => (
                    <span key={top} className="text-primary/80">
                      #{top}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform">
                  View <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default GlossaryIndexPage;
