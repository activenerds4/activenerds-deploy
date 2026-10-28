import { useState, useCallback } from "react";
import { type LearningPath, type Level } from "@/lib/learning/learning-paths";
import { getModulesForPath, getAllModules } from "@/lib/learning/learning-modules";
import {
  CHALLENGE_TOPICS,
  getXpForMode,
  type ChallengeTopic,
  type ChallengeLevel,
  type ChallengeQuestion,
  type ViewMode,
} from "@/lib/learning/qa-challenges";

const STORAGE_KEY = "an-learning-progress";

export interface Badge {
  id: string;
  label: string;
  pathSlug: string;
  level: Level;
  earned: boolean;
}

export interface PathProgress {
  completedCount: number;
  totalCount: number;
  percentage: number;
  hasStarted: boolean;
  totalXp: number;
  earnedBadges: Badge[];
  nextBadge: Badge | null;
}

export interface ChallengeProgress {
  answeredCount: number;
  totalCount: number;
  percentage: number;
  hasStarted: boolean;
}

interface StoredProgress {
  completedModuleIds: string[];
  completedQuestionIds: string[];
  repeatModuleIds: string[];
  lastActivityDate: string | null; // ISO YYYY-MM-DD
  currentStreakDays: number;
}

const DEFAULT_STORE: StoredProgress = {
  completedModuleIds: [],
  completedQuestionIds: [],
  repeatModuleIds: [],
  lastActivityDate: null,
  currentStreakDays: 0,
};

function getStoredProgress(): StoredProgress {
  if (typeof window === "undefined") return DEFAULT_STORE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STORE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STORE,
      ...parsed,
    } as StoredProgress;
  } catch {
    return DEFAULT_STORE;
  }
}

function saveStoredProgress(store: StoredProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quotas
  }
}

export function useLearningProgress() {
  const [store, setStore] = useState<StoredProgress>(getStoredProgress);

  // Compute global user XP across Learning Paths + Q&A Challenges
  const learningXp = getAllModules()
    .filter((m) => store.completedModuleIds.includes(m.id))
    .reduce((acc, m) => acc + m.xpValue, 0);

  const challengeXp = CHALLENGE_TOPICS.flatMap((t) => t.questions)
    .filter((q) => store.completedQuestionIds.includes(q.id))
    .reduce((acc, q) => acc + getXpForMode(q.xpValue, "quiz"), 0);

  const globalXp = learningXp + challengeXp;

  const updateStreak = (prevDate: string | null, prevStreak: number) => {
    const today = new Date().toISOString().split("T")[0];
    let newStreak = prevStreak;

    if (!prevDate) {
      newStreak = 1;
    } else if (prevDate !== today) {
      const lastDate = new Date(prevDate);
      const currentDate = new Date(today);
      const diffDays = Math.floor(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
      );

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }
    return { today, newStreak };
  };

  const isCompleted = useCallback(
    (moduleId: string): boolean => {
      return store.completedModuleIds.includes(moduleId);
    },
    [store.completedModuleIds]
  );

  const completeModule = useCallback((module: { id: string }) => {
    setStore((prev) => {
      if (prev.completedModuleIds.includes(module.id)) {
        return prev;
      }

      const { today, newStreak } = updateStreak(
        prev.lastActivityDate,
        prev.currentStreakDays
      );

      const nextStore: StoredProgress = {
        ...prev,
        completedModuleIds: [...prev.completedModuleIds, module.id],
        lastActivityDate: today,
        currentStreakDays: newStreak,
      };

      saveStoredProgress(nextStore);
      return nextStore;
    });
  }, []);

  const uncompleteModule = useCallback((module: { id: string }) => {
    setStore((prev) => {
      if (!prev.completedModuleIds.includes(module.id)) {
        return prev;
      }

      const nextStore: StoredProgress = {
        ...prev,
        completedModuleIds: prev.completedModuleIds.filter((id) => id !== module.id),
      };

      saveStoredProgress(nextStore);
      return nextStore;
    });
  }, []);

  // --- Repeat / Bookmark Flag Methods ---
  const isRepeat = useCallback(
    (moduleId: string): boolean => {
      return (store.repeatModuleIds || []).includes(moduleId);
    },
    [store.repeatModuleIds]
  );

  const markRepeat = useCallback((moduleId: string) => {
    setStore((prev) => {
      const currentRepeats = prev.repeatModuleIds || [];
      if (currentRepeats.includes(moduleId)) return prev;
      const nextStore: StoredProgress = {
        ...prev,
        repeatModuleIds: [...currentRepeats, moduleId],
      };
      saveStoredProgress(nextStore);
      return nextStore;
    });
  }, []);

  const unmarkRepeat = useCallback((moduleId: string) => {
    setStore((prev) => {
      const currentRepeats = prev.repeatModuleIds || [];
      if (!currentRepeats.includes(moduleId)) return prev;
      const nextStore: StoredProgress = {
        ...prev,
        repeatModuleIds: currentRepeats.filter((id) => id !== moduleId),
      };
      saveStoredProgress(nextStore);
      return nextStore;
    });
  }, []);

  const toggleRepeat = useCallback((moduleId: string) => {
    setStore((prev) => {
      const currentRepeats = prev.repeatModuleIds || [];
      const exists = currentRepeats.includes(moduleId);
      const nextRepeats = exists
        ? currentRepeats.filter((id) => id !== moduleId)
        : [...currentRepeats, moduleId];
      const nextStore: StoredProgress = {
        ...prev,
        repeatModuleIds: nextRepeats,
      };
      saveStoredProgress(nextStore);
      return nextStore;
    });
  }, []);

  const getArticleStatus = useCallback(
    (moduleId: string): "completed" | "repeat" | "unopened" => {
      if (store.completedModuleIds.includes(moduleId)) return "completed";
      if ((store.repeatModuleIds || []).includes(moduleId)) return "repeat";
      return "unopened";
    },
    [store.completedModuleIds, store.repeatModuleIds]
  );

  // --- Q&A Challenge Progress Methods ---
  const isQuestionAnswered = useCallback(
    (questionId: string): boolean => {
      return store.completedQuestionIds.includes(questionId);
    },
    [store.completedQuestionIds]
  );

  const answerQuestion = useCallback(
    (question: ChallengeQuestion, mode: ViewMode) => {
      // Plain Q&A mode never awards XP or writes completion
      if (mode === "plain") return;

      setStore((prev) => {
        if (prev.completedQuestionIds.includes(question.id)) {
          return prev; // Deduplicated
        }

        const { today, newStreak } = updateStreak(
          prev.lastActivityDate,
          prev.currentStreakDays
        );

        const nextStore: StoredProgress = {
          ...prev,
          completedQuestionIds: [...prev.completedQuestionIds, question.id],
          lastActivityDate: today,
          currentStreakDays: newStreak,
        };

        saveStoredProgress(nextStore);
        return nextStore;
      });
    },
    []
  );

  const getChallengeProgress = useCallback(
    (topic: ChallengeTopic, level: ChallengeLevel): ChallengeProgress => {
      const levelQuestions = topic.questions.filter((q) => q.level === level);
      const answeredCount = levelQuestions.filter((q) =>
        store.completedQuestionIds.includes(q.id)
      ).length;
      const totalCount = levelQuestions.length;
      const percentage = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
      const hasStarted = answeredCount > 0;

      return {
        answeredCount,
        totalCount,
        percentage,
        hasStarted,
      };
    },
    [store.completedQuestionIds]
  );

  const getPathProgress = useCallback(
    (path: LearningPath): PathProgress => {
      const pathModules = getModulesForPath(path.slug);
      const completedModules = pathModules.filter((m) =>
        store.completedModuleIds.includes(m.id)
      );
      const completedCount = completedModules.length;
      const totalCount = pathModules.length;
      const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      const hasStarted = completedCount > 0;

      const totalXp = completedModules.reduce((acc, m) => acc + m.xpValue, 0);

      // Compute level completion badges
      const levels: Level[] = ["beginner", "intermediate", "advanced"];
      const badges: Badge[] = levels.map((level) => {
        const levelModules = pathModules.filter((m) => m.level === level);
        const levelCompleted =
          levelModules.length > 0 &&
          levelModules.every((m) => store.completedModuleIds.includes(m.id));
        const capitalizedLevel =
          level.charAt(0).toUpperCase() + level.slice(1);
        return {
          id: `${path.slug}-${level}`,
          label: `${path.name}: ${capitalizedLevel}`,
          pathSlug: path.slug,
          level,
          earned: levelCompleted,
        };
      });

      const earnedBadges = badges.filter((b) => b.earned);
      const nextBadge = badges.find((b) => !b.earned) || null;

      return {
        completedCount,
        totalCount,
        percentage,
        hasStarted,
        totalXp,
        earnedBadges,
        nextBadge,
      };
    },
    [store.completedModuleIds]
  );

  return {
    isCompleted,
    completeModule,
    uncompleteModule,
    isRepeat,
    markRepeat,
    unmarkRepeat,
    toggleRepeat,
    getArticleStatus,
    getPathProgress,
    isQuestionAnswered,
    answerQuestion,
    getChallengeProgress,
    globalXp,
    currentStreakDays: store.currentStreakDays,
  };
}
