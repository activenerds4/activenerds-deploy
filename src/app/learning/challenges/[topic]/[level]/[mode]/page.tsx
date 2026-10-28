import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  Zap,
  Sparkles,
  BookOpen,
} from "lucide-react";
import {
  getChallengeTopic,
  getQuestionsByLevel,
  getQuestionsForMode,
  getXpForMode,
  type ChallengeLevel,
  type ViewMode,
  type ChallengeQuestion,
} from "@/lib/learning/qa-challenges";
import { useLearningProgress } from "@/hooks/use-learning-progress";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/layout/Seo";
import { toast } from "sonner";

const ChallengeSessionRunnerPage: React.FC = () => {
  const {
    topic: topicSlug = "",
    level = "beginner",
    mode = "flashcard",
  } = useParams<{ topic: string; level: string; mode: string }>();

  const topic = getChallengeTopic(topicSlug);
  const levelTyped = level as ChallengeLevel;
  const modeTyped = mode as ViewMode;

  const rawQuestions = topic ? getQuestionsByLevel(topic, levelTyped) : [];
  const questions = getQuestionsForMode(rawQuestions, modeTyped);

  const { answerQuestion, isQuestionAnswered } = useLearningProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [earnedSessionXp, setEarnedSessionXp] = useState(0);

  if (!topic || questions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
          No Questions Found
        </h1>
        <p className="mt-3 text-muted-foreground">
          No questions exist for the selected topic and level.
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

  const currentQ = questions[currentIndex];
  const isAnswered = isQuestionAnswered(currentQ.id);

  const handleNext = () => {
    setRevealed(false);
    setSelectedOption(null);
    setQuizSubmitted(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setRevealed(false);
      setSelectedOption(null);
      setQuizSubmitted(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleReveal = () => {
    setRevealed(true);
    if (!isAnswered) {
      answerQuestion(currentQ, modeTyped);
      const xp = getXpForMode(currentQ.xpValue, modeTyped);
      setEarnedSessionXp((prev) => prev + xp);
      toast.success(`+${xp} XP logged`);
    }
  };

  const handleQuizSubmit = (optIndex: number) => {
    if (quizSubmitted) return;
    setSelectedOption(optIndex);
    setQuizSubmitted(true);

    const isCorrect = optIndex === currentQ.correctOptionIndex;
    if (isCorrect) {
      if (!isAnswered) {
        answerQuestion(currentQ, modeTyped);
        const xp = getXpForMode(currentQ.xpValue, modeTyped);
        setEarnedSessionXp((prev) => prev + xp);
        toast.success(`Correct! +${xp} XP`);
      } else {
        toast.success("Correct answer!");
      }
    } else {
      toast.error("Incorrect. Review the model answer.");
    }
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setRevealed(false);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setSessionCompleted(false);
    setEarnedSessionXp(0);
  };

  if (sessionCompleted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center space-y-6">
        <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
          <Award className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Session Complete!
          </h1>
          <p className="text-muted-foreground text-sm">
            You completed {questions.length} questions in {topic.name} ({levelTyped}).
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-6 max-w-sm mx-auto space-y-2">
          <span className="text-xs font-mono text-muted-foreground">Session Rewards</span>
          <div className="flex items-center justify-center gap-2 font-display text-3xl font-bold text-amber-400">
            <Zap className="h-6 w-6 fill-amber-400" />
            <span>+{earnedSessionXp} XP</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={restartSession}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted font-mono text-xs font-medium text-foreground transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Practice Again</span>
          </button>
          <Link
            to={`/learning/challenges/${topic.slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs font-semibold transition-all"
          >
            <span>Back to Topic</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <Seo
        title={`${topic.name} Challenge Session | Active Nerds`}
        description={`Interactive ${modeTyped} practice session for ${topic.name} (${levelTyped}).`}
        path={`/learning/challenges/${topic.slug}/${levelTyped}/${modeTyped}`}
      />

      {/* Top Nav */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to={`/learning/challenges/${topic.slug}`}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit Session</span>
        </Link>

        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="capitalize">{levelTyped}</span>
          <span>•</span>
          <span className="capitalize">{modeTyped} Mode</span>
        </div>
      </div>

      {/* Progress Counter & Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-amber-400 font-semibold">
            +{getXpForMode(currentQ.xpValue, modeTyped)} XP
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-sm space-y-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
              {topic.name}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs uppercase border-border/80">
              {currentQ.format.replace("_", " ")}
            </Badge>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-snug">
            {currentQ.prompt}
          </h2>

          {currentQ.codeSnippet && (
            <pre className="rounded-xl border border-border/80 bg-background/80 p-4 font-mono text-xs text-foreground overflow-x-auto">
              <code>{currentQ.codeSnippet}</code>
            </pre>
          )}
        </div>

        {/* MODE 1 & 2: Flashcard or Timed */}
        {modeTyped !== "quiz" && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            {!revealed ? (
              <button
                type="button"
                onClick={handleReveal}
                className="w-full py-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 font-mono text-xs font-semibold text-primary transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Reveal Mechanism Model Answer</span>
              </button>
            ) : (
              <div className="space-y-4 rounded-xl border border-border/70 bg-background/50 p-6 animate-in fade-in-50 duration-200">
                <span className="font-mono text-xs uppercase tracking-wider text-primary font-bold block">
                  Model Mechanism Answer
                </span>
                <div className="text-sm sm:text-base text-foreground font-medium leading-relaxed whitespace-pre-line">
                  {currentQ.modelAnswer}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: Multiple Choice Quiz */}
        {modeTyped === "quiz" && (
          <div className="space-y-3 pt-4 border-t border-border/50">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
              Choose the correct mechanism:
            </span>

            <div className="space-y-2.5">
              {currentQ.options?.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctOptionIndex;

                let optionStyles = "border-border/70 bg-background/50 hover:border-primary/40 text-foreground";
                if (quizSubmitted) {
                  if (isCorrect) {
                    optionStyles = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-medium";
                  } else if (isSelected && !isCorrect) {
                    optionStyles = "border-rose-500 bg-rose-500/10 text-rose-400";
                  } else {
                    optionStyles = "border-border/40 opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={quizSubmitted}
                    onClick={() => handleQuizSubmit(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${optionStyles}`}
                  >
                    <span className="font-mono text-xs text-muted-foreground shrink-0 pt-0.5">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                    {quizSubmitted && isCorrect && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    )}
                    {quizSubmitted && isSelected && !isCorrect && (
                      <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {quizSubmitted && currentQ.modelAnswer && (
              <div className="rounded-xl border border-border/70 bg-background/50 p-5 mt-4 space-y-1.5 animate-in fade-in-50">
                <span className="font-mono text-xs uppercase tracking-wider text-primary font-bold block">
                  Mechanism Breakdown
                </span>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {currentQ.modelAnswer}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-card hover:bg-muted font-mono text-xs font-medium text-foreground disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs font-semibold transition-all shadow-sm"
        >
          <span>{currentIndex === questions.length - 1 ? "Finish Session" : "Next Question"}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ChallengeSessionRunnerPage;
