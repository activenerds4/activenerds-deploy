import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
  ArrowRight,
  Zap,
  Flame,
  CheckCircle2,
  Container,
  Network,
  Bot,
  BrainCircuit,
  Compass,
} from "lucide-react";
import { useLearningProgress } from "@/hooks/use-learning-progress";
import { LEARNING_PATHS } from "@/lib/learning/learning-paths";
import { CHALLENGE_TOPICS } from "@/lib/learning/qa-challenges";
import { ALL_GLOSSARY_ENTRIES } from "@/lib/learning/glossary";
import { ALL_CHEAT_SHEETS } from "@/lib/learning/cheat-sheets";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/layout/Seo";

const DeepLearningHubPage: React.FC = () => {
  const { globalXp, currentStreakDays } = useLearningProgress();

  const PILLARS = [
    {
      title: "Learning Paths",
      href: "/learning/paths",
      icon: Compass,
      tag: "Curated Roadmaps",
      count: "223 Modules",
      description:
        "Sequential, question-driven roadmaps spanning Docker, Kubernetes, Gen AI, and Agentic AI. Master the low-level Linux and attention mechanics.",
      gradient: "from-blue-500/10 via-cyan-500/10 to-transparent",
    },
    {
      title: "Q&A Challenges",
      href: "/learning/challenges",
      icon: HelpCircle,
      tag: "Interactive Practice",
      count: "100+ Challenges",
      description:
        "Mechanism-first puzzles with Flashcard, Real-World Scenario, and Multiple Choice modes. Test your mental models and earn XP.",
      gradient: "from-amber-500/10 via-orange-500/10 to-transparent",
    },
    {
      title: "Glossary",
      href: "/learning/glossary",
      icon: BookOpen,
      tag: "Mechanism-First",
      count: `${ALL_GLOSSARY_ENTRIES.length} Terms`,
      description:
        "High-density definitions that cut through the marketing fluff. Every entry includes mechanism breakdowns, mental models, and production failure modes.",
      gradient: "from-emerald-500/10 via-teal-500/10 to-transparent",
    },
    {
      title: "Cheat Sheets",
      href: "/learning/cheat-sheets",
      icon: Layers,
      tag: "Quick Reference",
      count: "4 Core Stacks",
      description:
        "Terminal commands, flags, architecture specs, and production configurations ready to copy directly into your shell.",
      gradient: "from-purple-500/10 via-violet-500/10 to-transparent",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      <Seo
        title="Deep Learning Hub"
        description="Deep dive into low-level infrastructure and artificial intelligence: Learning Paths, Q&A Challenges, Mechanism-First Glossary, and Cheat Sheets."
        path="/learning"
      />

      {/* Hero */}
      <header className="rounded-3xl border border-border/80 bg-gradient-to-b from-card/80 to-card/40 p-8 sm:p-12 backdrop-blur-md space-y-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>Deep Learning System</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Master the Mechanics.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Move beyond boilerplate tutorials and hype. Learn how containers isolate kernel primitives, how Kubernetes control loops reconcile cluster state, how transformers project attention spaces, and how autonomous agents execute reliable planning loops.
          </p>
        </div>

        {/* Global Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/60 relative z-10">
          <div className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-1">
            <span className="text-xs font-mono text-muted-foreground">Total Articles</span>
            <div className="font-display text-2xl font-bold text-foreground">223 Modules</div>
            <p className="text-[11px] text-muted-foreground font-mono">Continuous Stream</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-1">
            <span className="text-xs font-mono text-muted-foreground">Glossary Terms</span>
            <div className="font-display text-2xl font-bold text-foreground">{ALL_GLOSSARY_ENTRIES.length} Defined</div>
            <p className="text-[11px] text-muted-foreground font-mono">Mechanism-First</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-1">
            <span className="text-xs font-mono text-muted-foreground">Daily Streak</span>
            <div className="flex items-center gap-1.5 font-display text-2xl font-bold text-orange-400">
              <Flame className="h-5 w-5 fill-orange-400" />
              <span>{currentStreakDays} Days</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">Progress Logging</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-1">
            <span className="text-xs font-mono text-muted-foreground">Total XP</span>
            <div className="flex items-center gap-1.5 font-display text-2xl font-bold text-amber-400">
              <Zap className="h-5 w-5 fill-amber-400" />
              <span>{globalXp} XP</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">Level Up</p>
          </div>
        </div>
      </header>

      {/* The 4 Pillars Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">The Four Pillars</h2>
            <p className="text-sm text-muted-foreground">Explore interactive tools, guides, and reference material.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={pillar.title}
                to={pillar.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 hover:border-primary/50 hover:bg-card transition-all duration-200 shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                        {pillar.tag}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">{pillar.count}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between font-mono text-xs text-primary font-semibold">
                  <span>Enter {pillar.title}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Active Paths Snapshot */}
      <section className="rounded-2xl border border-border/80 bg-card/40 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Featured Roadmaps</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Direct jump into curated engineering paths.</p>
          </div>
          <Link
            to="/learning/paths"
            className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline font-semibold"
          >
            <span>View All Paths</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LEARNING_PATHS.map((p) => (
            <Link
              key={p.slug}
              to={`/learning/paths/${p.slug}`}
              className="group rounded-xl border border-border/70 bg-background/50 p-4 hover:border-primary/50 hover:bg-card transition-all space-y-2 text-left"
            >
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="uppercase">{p.category}</span>
                <span>~{p.estimatedHours}h</span>
              </div>
              <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {p.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {p.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DeepLearningHubPage;
