import React from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Circle, Clock, ArrowLeft, Sparkles, BookOpen } from "lucide-react";
import { type ModuleEntry, getNext5InSeries, getModulesForPath } from "@/lib/learning/learning-modules";
import { getLearningPath } from "@/lib/learning/learning-paths";
import { useLearningProgress } from "@/hooks/use-learning-progress";
import { Badge } from "@/components/ui/badge";

interface SeriesSidebarProps {
  currentModule: ModuleEntry;
}

export const SeriesSidebar: React.FC<SeriesSidebarProps> = ({ currentModule }) => {
  const { pathSlug, moduleSlug } = useParams<{ pathSlug: string; moduleSlug: string }>();
  const activePathSlug = pathSlug || currentModule.pathSlug;
  const path = getLearningPath(activePathSlug);
  const next5 = getNext5InSeries(activePathSlug, currentModule.moduleSlug);
  const { isCompleted, getPathProgress } = useLearningProgress();
  const pathProgress = path ? getPathProgress(path) : null;

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
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
      {/* Back to Path Overview */}
      <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-sm">
        <Link
          to={`/learning/paths/${activePathSlug}`}
          className="group inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to {path?.name || "Path"} Roadmap</span>
        </Link>

        {pathProgress && (
          <div className="space-y-2 pt-1 border-t border-border/50">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Path Progress</span>
              <span className="font-semibold text-primary">{pathProgress.percentage}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${pathProgress.percentage}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {pathProgress.completedCount} of {pathProgress.totalCount} modules completed
            </p>
          </div>
        )}
      </div>

      {/* Series Progression — Next 5 Articles */}
      <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next in Series ({next5.length})</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Curated in order of difficulty and progression.
        </p>

        <div className="space-y-2 pt-1">
          {next5.map((mod, index) => {
            const isCurrent = mod.moduleSlug === moduleSlug;
            const completed = isCompleted(mod.id);

            return (
              <Link
                key={mod.id}
                to={`/learning/paths/${mod.pathSlug}/${mod.moduleSlug}`}
                className={`group flex items-start gap-3 rounded-lg border p-2.5 transition-all text-left ${
                  isCurrent
                    ? "border-primary/50 bg-primary/10 text-foreground shadow-sm"
                    : "border-border/60 bg-background/50 hover:border-primary/30 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/60" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded px-1.5 py-0.2 text-[9px] font-mono font-medium border ${levelColor(
                        mod.level
                      )}`}
                    >
                      {mod.level}
                    </span>
                  </div>

                  <p className="text-xs font-medium leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                    {mod.title}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {mod.estimatedMinutes}m
                    </span>
                    <span>•</span>
                    <span className="truncate">{mod.domain}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
