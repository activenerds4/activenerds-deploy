import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  Search,
  Terminal,
  BookOpen,
  Filter,
  Container,
  Network,
  Sparkles,
  Bot,
} from "lucide-react";
import { getCheatSheetByTopic } from "@/lib/learning/cheat-sheets";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/layout/Seo";
import { toast } from "sonner";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  docker: Container,
  kubernetes: Network,
  "gen-ai": Sparkles,
  "agentic-ai": Bot,
};

const CheatSheetTopicPage: React.FC = () => {
  const { topic = "" } = useParams<{ topic: string }>();
  const sheet = getCheatSheetByTopic(topic);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!sheet) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
          Cheat Sheet Not Found
        </h1>
        <p className="mt-3 text-muted-foreground">
          The requested cheat sheet does not exist or has been moved.
        </p>
        <Link
          to="/learning/cheat-sheets"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cheat Sheets
        </Link>
      </div>
    );
  }

  const Icon = ICON_MAP[sheet.topicSlug] || Terminal;

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sheet.sections;
    const q = searchQuery.toLowerCase().trim();

    return sheet.sections
      .map((sec) => {
        const matchingItems = sec.items.filter(
          (item) =>
            item.command.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)
        );
        return {
          ...sec,
          items: matchingItems,
        };
      })
      .filter((sec) => sec.items.length > 0);
  }, [sheet, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Seo
        title={`${sheet.topicName} Cheat Sheet & Reference | Active Nerds`}
        description={sheet.description}
        path={`/learning/cheat-sheets/${sheet.topicSlug}`}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link to="/learning" className="hover:text-primary transition-colors">
          Deep Learning
        </Link>
        <span>/</span>
        <Link to="/learning/cheat-sheets" className="hover:text-primary transition-colors">
          Cheat Sheets
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{sheet.topicName}</span>
      </nav>

      {/* Header */}
      <header className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                {sheet.topicName} Cheat Sheet
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {sheet.description}
              </p>
            </div>
          </div>

          <span className="font-mono text-xs text-muted-foreground shrink-0 self-start sm:self-auto">
            Updated {sheet.lastUpdated}
          </span>
        </div>

        {/* Filter Input */}
        <div className="relative max-w-md pt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search commands or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/70 bg-background/80 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
          />
        </div>
      </header>

      {/* Sections & Tables */}
      <div className="space-y-8">
        {filteredSections.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card/40 p-12 text-center text-muted-foreground space-y-2">
            <Filter className="mx-auto h-8 w-8 text-primary/40" />
            <p className="text-sm font-medium text-foreground">No commands matched your query</p>
            <p className="text-xs">Try searching for a different flag, command, or parameter.</p>
          </div>
        ) : (
          filteredSections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-border/80 bg-card/50 overflow-hidden shadow-sm space-y-0"
            >
              <div className="bg-muted/40 border-b border-border/70 px-6 py-3.5 flex items-center justify-between">
                <h2 className="font-mono text-sm font-semibold text-foreground tracking-wide">
                  {section.title}
                </h2>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {section.items.length} items
                </span>
              </div>

              <div className="divide-y divide-border/60">
                {section.items.map((item, idx) => {
                  const isCopied = copiedCmd === item.command;

                  return (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-card/70 transition-colors"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <code className="rounded-lg bg-background border border-border px-3 py-1 font-mono text-xs font-semibold text-primary break-all">
                            {item.command}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.command)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            title="Copy command"
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {item.relatedGlossaryTerm && (
                        <Link
                          to={`/learning/glossary/${item.relatedGlossaryTerm}`}
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-primary/80 hover:text-primary transition-colors shrink-0 self-start sm:self-auto"
                        >
                          <BookOpen className="h-3 w-3" />
                          <span>Mechanism</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default CheatSheetTopicPage;
