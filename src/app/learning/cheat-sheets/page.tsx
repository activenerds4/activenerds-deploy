import React from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  ArrowRight,
  Terminal,
  Container,
  Network,
  Sparkles,
  Bot,
  Copy,
  Check,
} from "lucide-react";
import { ALL_CHEAT_SHEETS } from "@/lib/learning/cheat-sheets";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/layout/Seo";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  docker: Container,
  kubernetes: Network,
  "gen-ai": Sparkles,
  "agentic-ai": Bot,
};

const CheatSheetsIndexPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <Seo
        title="Developer Cheat Sheets & Reference Cards | Active Nerds"
        description="High-density terminal and architecture reference cards for Docker, Kubernetes, Gen AI, and Agentic AI."
        path="/learning/cheat-sheets"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link to="/learning" className="hover:text-primary transition-colors">
          Deep Learning
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Cheat Sheets</span>
      </nav>

      {/* Header */}
      <header className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-10 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
          <Terminal className="h-4 w-4" />
          <span>Interactive Reference Cards</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Engineering Cheat Sheets
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          High-density reference cards engineered for fast lookups during active development and deployment. Includes one-click copyable shell commands, flags, and architecture patterns.
        </p>
      </header>

      {/* Cheat Sheets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ALL_CHEAT_SHEETS.map((sheet) => {
          const Icon = ICON_MAP[sheet.topicSlug] || Layers;
          const totalCommands = sheet.sections.reduce((acc, s) => acc + s.items.length, 0);

          return (
            <Link
              key={sheet.topicSlug}
              to={`/learning/cheat-sheets/${sheet.topicSlug}`}
              className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 hover:border-primary/50 hover:bg-card transition-all duration-200 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                    {totalCommands} Commands
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {sheet.topicName}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {sheet.description}
                  </p>
                </div>

                {/* Section Preview Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {sheet.sections.map((sec) => (
                    <span
                      key={sec.title}
                      className="inline-flex items-center rounded-md border border-border/60 bg-background/50 px-2 py-0.5 text-[11px] font-mono text-muted-foreground"
                    >
                      {sec.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between font-mono text-xs text-primary font-semibold">
                <span className="text-muted-foreground font-normal">
                  Updated {sheet.lastUpdated}
                </span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Open Cheat Sheet <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CheatSheetsIndexPage;
