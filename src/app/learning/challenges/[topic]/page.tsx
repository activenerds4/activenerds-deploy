import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Zap,
  HelpCircle,
  Clock,
  Layers,
  Container,
  Network,
  Bot,
} from "lucide-react";
import {
  getChallengeTopic,
  getQuestionsByLevel,
  type ChallengeLevel,
  type ViewMode,
} from "@/lib/learning/qa-challenges";
import { useLearningProgress } from "@/hooks/use-learning-progress";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/layout/Seo";

const ICON_MAP = {
  Container,
  Network,
  Sparkles,
  Bot,
};

const ChallengeTopicDetailPage: React.FC = () => {
  const { topic: topicSlug = "" } = useParams<{ topic: string }>();
  const navigate = useNavigate();
  const topic = getChallengeTopic(topicSlug);
  const { getChallengeProgress } = useLearningProgress();

  const [selectedLevel, setSelectedLevel] = useState<ChallengeLevel>("beginner");
  const [selectedMode, setSelectedMode] = useState<ViewMode>("flashcard");

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
          Topic Not Found
        </h1>
        <p className="mt-3 text-muted-foreground">
          The requested challenge topic does not exist.
        </p>
        <Link
          to="/learning/challenges"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Challenges
        </Link>
      </div>
    );
  }

  const Icon = ICON_MAP[topic.icon] || Sparkles;
  const questionsForLevel = getQuestionsByLevel(topic, selectedLevel);
  const progress = getChallengeProgress(topic, selectedLevel);

  const MODES: { id: ViewMode; name: string; desc: string; xp: string }[] = [
    {
      id: "flashcard",
      name: "Flashcards",
      desc: "Flip between Question and Mechanism Answer with full detailed breakdown.",
      xp: "+10 XP",
    },
    {
      id: "timed",
      name: "Speed Run / Timed",
      desc: "Test speed and low-latency recall with time multipliers and high XP.",
      xp: "+25 XP",
    },
    {
      id: "quiz",
      name: "Diagnostic Quiz",
      desc: "Multiple choice diagnostic questions with instant scoring and explanations.",
      xp: "+20 XP",
    },
  ];

  const handleStart = () => {
    navigate(`/learning/challenges/${topic.slug}/${selectedLevel}/${selectedMode}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Seo
        title={`${topic.name} Q&A Challenges | Active Nerds`}
        description={`Interactive challenges for ${topic.name}. Choose between Flashcards, Scenarios, and Quizzes.`}
        path={`/learning/challenges/${topic.slug}`}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link to="/learning" className="hover:text-primary transition-colors">
          Deep Learning
        </Link>
        <span>/</span>
        <Link to="/learning/challenges" className="hover:text-primary transition-colors">
          Challenges
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{topic.name}</span>
      </nav>

      {/* Header */}
      <header className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-sm space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <Badge variant="outline" className="font-mono text-xs uppercase text-primary border-primary/30 mb-1">
              {topic.category}
            </Badge>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {topic.name} Challenges
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              {topic.description}
            </p>
          </div>
        </div>
      </header>

      {/* Step 1: Select Difficulty */}
      <section className="space-y-3">
        <label className="font-mono text-xs font-semibold uppercase tracking-wider text-primary block">
          1. Select Difficulty Level
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["beginner", "intermediate", "advanced"] as ChallengeLevel[]).map((lvl) => {
            const count = getQuestionsByLevel(topic, lvl).length;
            const prog = getChallengeProgress(topic, lvl);
            const isSelected = selectedLevel === lvl;

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/70 bg-card/50 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="capitalize font-semibold text-sm text-foreground">{lvl}</span>
                  <span className="font-mono text-xs text-primary">{prog.percentage}%</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {count} Questions ({prog.answeredCount} answered)
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2: Select Mode */}
      <section className="space-y-3">
        <label className="font-mono text-xs font-semibold uppercase tracking-wider text-primary block">
          2. Select Practice Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedMode(mode.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/70 bg-card/50 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-foreground">{mode.name}</span>
                  <span className="font-mono text-[10px] text-amber-400">{mode.xp}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {mode.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Launch Action */}
      <div className="pt-4 flex items-center justify-between border-t border-border/60">
        <div className="text-xs font-mono text-muted-foreground">
          Ready to test {questionsForLevel.length} questions in {selectedMode} mode.
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
        >
          <span>Launch Session</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ChallengeTopicDetailPage;
