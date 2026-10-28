import React from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Network,
  Sparkles,
  Bot,
  Clock,
  ArrowRight,
  Zap,
  CheckCircle2,
  Award,
  Layers,
  Flame,
} from "lucide-react";
import { LEARNING_PATHS, type LearningPath } from "@/lib/learning/learning-paths";
import { getModuleCount } from "@/lib/learning/learning-modules";
import { useLearningProgress } from "@/hooks/use-learning-progress";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/layout/Seo";

const ICON_MAP = {
  Container,
  Network,
  Sparkles,
  Bot,
};

const LearningPathsDashboardPage: React.FC = () => {
  const { getPathProgress, globalXp, currentStreakDays } = useLearningProgress();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <Seo
        title="Curated Learning Paths | Active Nerds"
        description="Mechanism-first engineering roadmaps: Docker, Kubernetes, Gen AI, and Agentic AI. Master fundamentals, avoid anti-patterns, and level up."
        path="/learning/paths"
      />

      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link to="/learning" className="hover:text-primary transition-colors">
          Deep Learning
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Learning Paths</span>
      </nav>

      {/* Header */}
      <header className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-10 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-4 w-4" />
          <span>Mechanism-First Engineering</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Curated Learning Paths
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Structured, question-driven roadmaps designed for engineers who want to understand *how things actually work under the hood* — from Linux namespaces and cgroups to transformer attention and autonomous agent loops.
        </p>

        {/* Global Progress Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/60">
          <div className="rounded-xl border border-border/60 bg-background/50 p-3 space-y-1">
            <span className="text-[11px] font-mono text-muted-foreground">Total Roadmaps</span>
            <div className="font-display text-xl font-bold text-foreground">4 Core Paths</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/50 p-3 space-y-1">
            <span className="text-[11px] font-mono text-muted-foreground">Total Modules</span>
            <div className="font-display text-xl font-bold text-foreground">223 Articles</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/50 p-3 space-y-1">
            <span className="text-[11px] font-mono text-muted-foreground">Streak</span>
            <div className="flex items-center gap-1 font-display text-xl font-bold text-orange-400">
              <Flame className="h-4 w-4 fill-orange-400" />
              <span>{currentStreakDays} Days</span>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/50 p-3 space-y-1">
            <span className="text-[11px] font-mono text-muted-foreground">XP Earned</span>
            <div className="flex items-center gap-1 font-display text-xl font-bold text-amber-400">
              <Zap className="h-4 w-4 fill-amber-400" />
              <span>{globalXp} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* 4 Paths Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LEARNING_PATHS.map((path) => {
          const IconComponent = ICON_MAP[path.icon] || Sparkles;
          const count = getModuleCount(path.slug);
          const progress = getPathProgress(path);

          return (
            <Link
              key={path.slug}
              to={`/learning/paths/${path.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 hover:border-primary/50 hover:bg-card transition-all duration-200 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="font-mono text-xs uppercase text-primary border-primary/30">
                    {path.category}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {path.name}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {path.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    {count} Modules
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    ~{path.estimatedHours} Hours
                  </span>
                  <span>•</span>
                  <span>{path.levelRange}</span>
                </div>
              </div>

              {/* Progress Bar & Footer */}
              <div className="pt-6 mt-6 border-t border-border/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-semibold text-primary">{progress.percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground font-mono">
                    {progress.completedCount} / {progress.totalCount} completed
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold font-mono text-primary group-hover:translate-x-0.5 transition-transform">
                    Explore Path <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPathsDashboardPage;
