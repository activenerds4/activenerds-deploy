import React, { useState } from "react";
import {
  BookOpen,
  FileQuestion,
  Layers3,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export interface TrackResourceTabsProps {
  defaultTab?: "study-notes" | "mock-tests" | "flash-cards" | "cheat-sheets";
  notesCount?: string;
  mockTestsCount?: string;
  flashCardsCount?: string;
  cheatSheetsCount?: string;
  studyNotesChildren?: React.ReactNode;
  children?: React.ReactNode;
}

export const TrackResourceTabs: React.FC<TrackResourceTabsProps> = ({
  defaultTab = "study-notes",
  notesCount = "18 Modules",
  mockTestsCount = "3 Practice Exams",
  flashCardsCount = "120+ Cards",
  cheatSheetsCount = "5 Reference Sheets",
  children,
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const tabs = [
    {
      id: "study-notes",
      label: "Study Notes",
      icon: BookOpen,
      count: notesCount,
      status: "live",
      badge: "Full Syllabus",
    },
    {
      id: "mock-tests",
      label: "Mock Tests",
      icon: FileQuestion,
      count: mockTestsCount,
      status: "upcoming",
      badge: "Coming Soon",
    },
    {
      id: "flash-cards",
      label: "Flash Cards",
      icon: Layers3,
      count: flashCardsCount,
      status: "upcoming",
      badge: "Coming Soon",
    },
    {
      id: "cheat-sheets",
      label: "Cheat Sheets",
      icon: BookmarkCheck,
      count: cheatSheetsCount,
      status: "upcoming",
      badge: "Coming Soon",
    },
  ];

  return (
    <div className="space-y-8 my-8">
      {/* Tab Navigation Controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground border border-border/60"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>

              {tab.status === "live" ? (
                <span
                  className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-mono font-medium ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}
                >
                  {tab.count}
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  <Clock className="h-2.5 w-2.5" />
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Rendering */}
      <div>
        {activeTab === "study-notes" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-mono text-xs uppercase tracking-wider text-primary font-semibold">
                  Exam Study Notes Syllabus
                </span>
                <p className="text-sm text-muted-foreground">
                  Complete sequence of deep-dive architecture modules engineered for exam readiness.
                </p>
              </div>
              <span className="font-mono text-xs text-primary font-bold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                {notesCount}
              </span>
            </div>

            {/* Injected Module Cards from MDX */}
            <div className="w-full">{children}</div>
          </div>
        )}

        {activeTab === "mock-tests" && (
          <div className="rounded-2xl border border-border/80 bg-card/60 p-8 sm:p-12 text-center space-y-4 backdrop-blur-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FileQuestion className="h-7 w-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-display text-2xl font-bold text-foreground">
                Mock Tests & Practice Exams
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Full-length timed simulated certification exams with randomized question banks, scenario-based architecture troubleshooting, and instant explanation breakdowns.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 font-mono text-xs text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              Target release: Coming in upcoming platform update
            </div>
          </div>
        )}

        {activeTab === "flash-cards" && (
          <div className="rounded-2xl border border-border/80 bg-card/60 p-8 sm:p-12 text-center space-y-4 backdrop-blur-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Layers3 className="h-7 w-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-display text-2xl font-bold text-foreground">
                Interactive Mechanism Flash Cards
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Spaced-repetition flashcards covering exam-critical ports, CLI syntax, cluster limits, failure domain rules, and architectural trade-offs.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 font-mono text-xs text-purple-400">
              <Clock className="h-3.5 w-3.5" />
              Target release: In active content development
            </div>
          </div>
        )}

        {activeTab === "cheat-sheets" && (
          <div className="rounded-2xl border border-border/80 bg-card/60 p-8 sm:p-12 text-center space-y-4 backdrop-blur-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <BookmarkCheck className="h-7 w-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-display text-2xl font-bold text-foreground">
                Architecture & CLI Cheat Sheets
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dense, one-page printable reference sheets with command sequences, architecture topology matrices, and configuration checklists.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 font-mono text-xs text-blue-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Target release: In preparation
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackResourceTabs;
