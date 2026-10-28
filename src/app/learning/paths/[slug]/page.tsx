import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Zap,
  Search,
  BookOpen,
  Filter,
  Container,
  Network,
  Bot,
} from "lucide-react";
import { getLearningPath, type Level } from "@/lib/learning/learning-paths";
import { getModulesForPath, type ModuleEntry } from "@/lib/learning/learning-modules";
import { useLearningProgress } from "@/hooks/use-learning-progress";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/layout/Seo";

const ICON_MAP = {
  Container,
  Network,
  Sparkles,
  Bot,
};

const PathDetailPage: React.FC = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const path = getLearningPath(slug);
  const modules = useMemo(() => (path ? getModulesForPath(path.slug) : []), [path]);
  const { isCompleted, getPathProgress } = useLearningProgress();

  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!path) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
          Learning Path Not Found
        </h1>
        <p className="mt-3 text-muted-foreground">
          The requested topic roadmap does not exist yet.
        </p>
        <Link
          to="/learning/paths"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Learning Paths
        </Link>
      </div>
    );
  }

  const progress = getPathProgress(path);
  const IconComponent = ICON_MAP[path.icon] || Sparkles;

  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      if (selectedLevel !== "all" && mod.level !== selectedLevel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = mod.title.toLowerCase().includes(q);
        const matchQuestion = mod.question.toLowerCase().includes(q);
        const matchDomain = mod.domain.toLowerCase().includes(q);
        if (!matchTitle && !matchQuestion && !matchDomain) return false;
      }
      return true;
    });
  }, [modules, selectedLevel, searchQuery]);

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
        title={`${path.name} Learning Path Roadmap | Active Nerds`}
        description={path.description}
        path={`/learning/paths/${path.slug}`}
      />

      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link to="/learning" className="hover:text-primary transition-colors">
          Deep Learning
        </Link>
        <span>/</span>
        <Link to="/learning/paths" className="hover:text-primary transition-colors">
          Learning Paths
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{path.name}</span>
      </nav>

      {/* Hero Card */}
      <header className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <IconComponent className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs uppercase text-primary border-primary/30">
                  {path.category}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">
                  {modules.length} Modules (~{path.estimatedHours} hrs)
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {path.name} Roadmap
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
                {path.description}
              </p>
            </div>
          </div>

          {/* Quick Action */}
          {modules.length > 0 && (
            <Link
              to={`/learning/paths/${path.slug}/${modules[0].moduleSlug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shrink-0 self-start md:self-auto shadow-sm"
            >
              <span>{progress.completedCount > 0 ? "Continue Roadmap" : "Start Path"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Progress Bar & Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60">
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Path Completion</span>
              <span className="font-semibold text-primary">{progress.percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              {progress.completedCount} / {progress.totalCount} completed
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1">
            <span className="text-xs font-mono text-muted-foreground">Total XP Earned</span>
            <div className="flex items-center gap-2 font-display text-lg font-bold text-amber-400">
              <Zap className="h-4 w-4 fill-amber-400" />
              <span>{progress.totalXp} XP</span>
            </div>
            <p className="text-[11px] text-muted-foreground">From completed path modules</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1">
            <span className="text-xs font-mono text-muted-foreground">Next Milestone Badge</span>
            <div className="text-sm font-semibold text-foreground truncate">
              {progress.nextBadge?.label || "Mastery Achieved! 🏆"}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {progress.earnedBadges.length} of 3 level badges unlocked
            </p>
          </div>
        </div>

        {/* Related Glossary Terms */}
        {path.relatedGlossaryTerms && path.relatedGlossaryTerms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40 text-xs">
            <span className="font-mono text-muted-foreground">Core Primitives:</span>
            {path.relatedGlossaryTerms.map((term) => (
              <Link
                key={term.href}
                to={term.href}
                className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2.5 py-1 text-xs font-mono text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                <BookOpen className="h-3 w-3" />
                <span>{term.term}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Level Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/60 p-1 font-mono text-xs overflow-x-auto">
          {["all", "beginner", "intermediate", "advanced"].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all shrink-0 ${
                selectedLevel === lvl
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search module or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/70 bg-card/60 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-mono"
          />
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="space-y-3">
        {filteredModules.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card/40 p-12 text-center text-muted-foreground space-y-2">
            <Filter className="mx-auto h-8 w-8 text-primary/40" />
            <p className="text-sm font-medium text-foreground">No modules match your criteria</p>
            <p className="text-xs">Try resetting your level filter or search query.</p>
          </div>
        ) : (
          filteredModules.map((mod) => {
            const completed = isCompleted(mod.id);

            return (
              <Link
                key={mod.id}
                to={`/learning/paths/${mod.pathSlug}/${mod.moduleSlug}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/50 p-4 sm:p-5 hover:border-primary/50 hover:bg-card transition-all shadow-sm"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="pt-0.5 shrink-0">
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary/70" />
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-mono font-medium border ${levelColor(
                          mod.level
                        )}`}
                      >
                        {mod.level}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground/80">•</span>
                      <span className="font-mono text-xs text-muted-foreground">{mod.domain}</span>
                      <span className="font-mono text-xs text-muted-foreground/80">•</span>
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {mod.estimatedMinutes}m read
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {mod.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {mod.question || mod.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-amber-400">
                    <Zap className="h-3.5 w-3.5 fill-amber-400" />
                    +{mod.xpValue} XP
                  </span>
                  <div className="h-8 w-8 rounded-lg border border-border/80 bg-background flex items-center justify-center group-hover:border-primary/50 group-hover:text-primary transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PathDetailPage;
