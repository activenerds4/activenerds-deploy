import React from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Container,
  Network,
  Sparkles,
  Bot,
  ArrowRight,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { CHALLENGE_TOPICS, type ChallengeTopic } from "@/lib/learning/qa-challenges";
import { useLearningProgress } from "@/hooks/use-learning-progress";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/layout/Seo";

const ICON_MAP = {
  Container,
  Network,
  Sparkles,
  Bot,
};

const ChallengesHubPage: React.FC = () => {
  const { getChallengeProgress } = useLearningProgress();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <Seo
        title="Engineering Q&A Challenges | Active Nerds"
        description="Interactive, mechanism-first challenges. Practice flashcards, scenarios, and quizzes across Docker, Kubernetes, Gen AI, and Agentic AI."
        path="/learning/challenges"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link to="/learning" className="hover:text-primary transition-colors">
          Deep Learning
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Q&A Challenges</span>
      </nav>

      {/* Header */}
      <header className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-10 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
          <HelpCircle className="h-4 w-4" />
          <span>Interactive Mental Model Tests</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Q&amp;A Challenges
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Test your understanding through three distinct modes: rapid-fire Flashcards, real-world Production Scenarios, and diagnostic Quizzes.
        </p>

        {/* Modes Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/60">
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1">
            <span className="text-xs font-mono font-semibold text-primary">Flashcard Mode</span>
            <p className="text-xs text-muted-foreground">Low-latency recall of core mechanisms and syntax.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1">
            <span className="text-xs font-mono font-semibold text-amber-400">Scenario Mode</span>
            <p className="text-xs text-muted-foreground">Triage real production incidents and architectural bugs.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1">
            <span className="text-xs font-mono font-semibold text-emerald-400">Quiz Mode</span>
            <p className="text-xs text-muted-foreground">Diagnostic multiple choice with auto-grading and XP.</p>
          </div>
        </div>
      </header>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CHALLENGE_TOPICS.map((topic) => {
          const IconComponent = ICON_MAP[topic.icon] || Sparkles;
          const totalQuestions = topic.questions.length;

          const begProg = getChallengeProgress(topic, "beginner");
          const intProg = getChallengeProgress(topic, "intermediate");
          const advProg = getChallengeProgress(topic, "advanced");
          const totalAnswered = begProg.answeredCount + intProg.answeredCount + advProg.answeredCount;
          const overallPercent = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

          return (
            <Link
              key={topic.slug}
              to={`/learning/challenges/${topic.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 hover:border-primary/50 hover:bg-card transition-all duration-200 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="font-mono text-xs uppercase text-primary border-primary/30">
                    {topic.category}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {topic.name}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {topic.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                  <span>{totalQuestions} Practice Questions</span>
                  <span>•</span>
                  <span>3 Levels (Beginner to Advanced)</span>
                </div>
              </div>

              {/* Progress */}
              <div className="pt-6 mt-6 border-t border-border/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Challenge Progress</span>
                  <span className="font-semibold text-primary">{overallPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground font-mono">
                    {totalAnswered} / {totalQuestions} answered
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold font-mono text-primary group-hover:translate-x-0.5 transition-transform">
                    Select Mode <ArrowRight className="h-3.5 w-3.5" />
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

export default ChallengesHubPage;
