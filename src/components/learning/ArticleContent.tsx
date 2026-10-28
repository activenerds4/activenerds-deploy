import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Sparkles,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { type ModuleEntry, getModuleComponent, getModulesForPath } from "@/lib/learning/learning-modules";
import { useLearningProgress } from "@/hooks/use-learning-progress";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ArticleContentProps {
  module: ModuleEntry;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ module }) => {
  const { isCompleted, completeModule, uncompleteModule } = useLearningProgress();
  const completed = isCompleted(module.id);
  const [justCompleted, setJustCompleted] = useState(false);

  const CompiledMdx = getModuleComponent(module.pathSlug, module.moduleSlug);

  // Custom learning MDX components with polished headers, horizontal rules, and colon removal
  const learningComponents = useMemo(() => ({
    ...mdxComponents,
    h2: ({ id, children, ...props }: React.ComponentProps<"h2">) => {
      const rawText = typeof children === "string" ? children : "";
      const cleanTitle = rawText ? rawText.replace(/:+$/, "").trim() : children;
      const lower = typeof cleanTitle === "string" ? cleanTitle.toLowerCase() : "";

      const isQuestion = lower === "question";
      const isQuickAnswer = lower === "quick answer";
      const isDetailedAnswer = lower === "detailed answer";

      return (
        <div className="mt-10 mb-4 border-b border-border/70 pb-3">
          <h2
            id={id}
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 group scroll-mt-24 m-0"
            {...props}
          >
            {isQuestion && (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/30">
                <HelpCircle className="h-4 w-4" />
              </span>
            )}
            {isQuickAnswer && (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Zap className="h-4 w-4 fill-amber-400/20" />
              </span>
            )}
            {isDetailedAnswer && (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <BookOpen className="h-4 w-4" />
              </span>
            )}
            <span>{cleanTitle}</span>
            {id && (
              <a
                href={`#${id}`}
                aria-label={`Permalink to ${cleanTitle}`}
                className="ml-2 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                #
              </a>
            )}
          </h2>
        </div>
      );
    },
    h3: ({ id, children, ...props }: React.ComponentProps<"h3">) => {
      const rawText = typeof children === "string" ? children : "";
      const cleanTitle = rawText ? rawText.replace(/:+$/, "").trim() : children;

      return (
        <div className="mt-8 mb-3.5 border-b border-border/40 pb-2">
          <h3
            id={id}
            className="font-display text-lg sm:text-xl font-semibold tracking-tight text-foreground group scroll-mt-24 m-0 flex items-center gap-2"
            {...props}
          >
            <span>{cleanTitle}</span>
            {id && (
              <a
                href={`#${id}`}
                aria-label={`Permalink to ${cleanTitle}`}
                className="ml-2 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                #
              </a>
            )}
          </h3>
        </div>
      );
    },
  }), []);

  // Find previous and next module in this path
  const pathModules = getModulesForPath(module.pathSlug);
  const currentIndex = pathModules.findIndex((m) => m.moduleSlug === module.moduleSlug);
  const prevModule = currentIndex > 0 ? pathModules[currentIndex - 1] : null;
  const nextModule =
    currentIndex !== -1 && currentIndex < pathModules.length - 1
      ? pathModules[currentIndex + 1]
      : null;

  const handleToggleComplete = () => {
    if (completed) {
      uncompleteModule(module);
      toast.info("Marked module as incomplete");
    } else {
      completeModule(module);
      setJustCompleted(true);
      toast.success(`Completed! +${module.xpValue} XP earned`);
      setTimeout(() => setJustCompleted(false), 2000);
    }
  };

  const levelBadge = (level: string) => {
    switch (level) {
      case "advanced":
        return <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/30">Advanced</Badge>;
      case "intermediate":
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30">Intermediate</Badge>;
      default:
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Beginner</Badge>;
    }
  };

  return (
    <article className="min-w-0 flex-1 space-y-8">
      {/* Top Header Card */}
      <header className="rounded-2xl border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-sm space-y-4">
        {/* Meta Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {levelBadge(module.level)}
          <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
            {module.domain}
          </Badge>
          <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {module.estimatedMinutes} min read
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-xs text-amber-400">
            <Zap className="h-3.5 w-3.5 fill-amber-400" />
            +{module.xpValue} XP
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
          {module.title}
        </h1>

        {/* Author Byline & Date */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary text-xs tracking-wider">
              AN
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <span>ActiveNerds Team</span>
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-[11px] text-muted-foreground">Engineering &amp; Editorial</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[11px]">
              <Calendar className="h-3.5 w-3.5" />
              Updated {module.lastModified || module.publishDate}
            </span>

            {/* Complete Toggle in Header */}
            <button
              type="button"
              onClick={handleToggleComplete}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-mono font-medium transition-all ${
                completed
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-sm"
                  : "border-border bg-background hover:border-primary/40 hover:text-primary text-muted-foreground"
              }`}
            >
              {completed ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <Circle className="h-3.5 w-3.5" />
                  <span>Mark Complete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="rounded-2xl border border-border/70 bg-card/30 p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        {CompiledMdx ? (
          <div className="learning-article-prose prose prose-invert max-w-none font-sans leading-relaxed prose-headings:font-display prose-headings:font-bold prose-p:leading-relaxed prose-pre:border prose-pre:border-border prose-pre:bg-card">
            <CompiledMdx components={learningComponents} />
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <Sparkles className="mx-auto h-8 w-8 text-primary/60" />
            <p className="text-sm font-medium">Article content preview</p>
            <p className="text-xs">{module.description}</p>
          </div>
        )}
      </div>

      {/* Bottom Completion Card & XP Award */}
      <div className="rounded-2xl border border-border/80 bg-card/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
              justCompleted ? "scale-110 bg-emerald-500 text-white" : completed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-muted text-muted-foreground"
            }`}
          >
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {completed ? "You've completed this module!" : "Finished reading?"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {completed
                ? "XP logged to your progress. Ready for the next challenge?"
                : `Earn +${module.xpValue} XP and keep your streak going.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleComplete}
          className={`px-5 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all shadow-sm ${
            completed
              ? "border border-border bg-muted/60 text-muted-foreground hover:bg-muted"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {completed ? "Mark Incomplete" : `Complete Module (+${module.xpValue} XP)`}
        </button>
      </div>

      {/* Bottom Series Navigation: Prev / Next */}
      <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/60">
        {prevModule ? (
          <Link
            to={`/learning/paths/${prevModule.pathSlug}/${prevModule.moduleSlug}`}
            className="group flex flex-col items-start rounded-xl border border-border/70 bg-card/40 p-4 hover:border-primary/40 hover:bg-muted/30 transition-all text-left"
          >
            <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground group-hover:text-primary transition-colors mb-1">
              <ArrowLeft className="h-3 w-3" />
              Previous Module
            </span>
            <span className="text-sm font-medium text-foreground line-clamp-1">
              {prevModule.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextModule ? (
          <Link
            to={`/learning/paths/${nextModule.pathSlug}/${nextModule.moduleSlug}`}
            className="group flex flex-col items-end rounded-xl border border-border/70 bg-card/40 p-4 hover:border-primary/40 hover:bg-muted/30 transition-all text-right sm:col-start-2"
          >
            <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground group-hover:text-primary transition-colors mb-1">
              Next Module
              <ArrowRight className="h-3 w-3" />
            </span>
            <span className="text-sm font-medium text-foreground line-clamp-1">
              {nextModule.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
  );
};
