import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Sparkles,
  Terminal,
  Layers,
  Tag,
  Copy,
  Check,
  Zap,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Cpu,
} from "lucide-react";
import { getEntryBySlug, ALL_GLOSSARY_ENTRIES } from "@/lib/learning/glossary";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/layout/Seo";

const GlossaryDetailPage: React.FC = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const entry = getEntryBySlug(slug);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!entry) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
          Glossary Term Not Found
        </h1>
        <p className="mt-3 text-muted-foreground">
          The requested term does not exist in the engineering glossary.
        </p>
        <Link
          to="/learning/glossary"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Glossary
        </Link>
      </div>
    );
  }

  // Find previous and next entries for smooth reading
  const currentIndex = ALL_GLOSSARY_ENTRIES.findIndex((e) => e.slug === entry.slug);
  const prevEntry = currentIndex > 0 ? ALL_GLOSSARY_ENTRIES[currentIndex - 1] : null;
  const nextEntry = currentIndex < ALL_GLOSSARY_ENTRIES.length - 1 ? ALL_GLOSSARY_ENTRIES[currentIndex + 1] : null;

  const levelBadge = (level: string) => {
    switch (level) {
      case "advanced":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "intermediate":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
  };

  const relatedEntries = entry.relatedTerms
    .map((s) => getEntryBySlug(s))
    .filter(Boolean);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <Seo
        title={`${entry.term} — Engineering Definition & Practical Guide | Active Nerds`}
        description={entry.plainEnglish || entry.summary || entry.definition.slice(0, 160)}
        path={`/learning/glossary/${entry.slug}`}
      />

      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Link to="/learning" className="hover:text-primary transition-colors">
            Deep Learning
          </Link>
          <span>/</span>
          <Link to="/learning/glossary" className="hover:text-primary transition-colors">
            Glossary
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">{entry.term}</span>
        </nav>

        <Link
          to="/learning/glossary"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to All Terms
        </Link>
      </div>

      {/* Main Term Hero Header */}
      <header className="rounded-2xl border border-border/80 bg-gradient-to-b from-card/80 to-card/40 p-6 sm:p-10 backdrop-blur-sm space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-mono font-medium border ${levelBadge(
              entry.level
            )}`}
          >
            {entry.level}
          </span>
          <Badge variant="outline" className="font-mono text-xs uppercase text-primary border-primary/30">
            {entry.type.replace("_", " ")}
          </Badge>
          {entry.topics.map((top) => (
            <span key={top} className="font-mono text-xs text-muted-foreground">
              #{top}
            </span>
          ))}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          {entry.term}
        </h1>

        {entry.summary && (
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed pt-2 border-t border-border/50">
            {entry.summary}
          </p>
        )}
      </header>

      {/* In Plain English & Real-World Analogy */}
      {(entry.plainEnglish || entry.analogy) && (
        <section className="rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:p-8 space-y-6">
          {entry.plainEnglish && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>In Plain English</span>
              </div>
              <p className="text-base sm:text-lg text-foreground/95 leading-relaxed font-sans">
                {entry.plainEnglish}
              </p>
            </div>
          )}

          {entry.analogy && (
            <div className="rounded-xl border border-primary/20 bg-background/60 p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold uppercase tracking-wider">
                <Lightbulb className="h-4 w-4" />
                <span>Real-World Mental Model</span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed italic">
                &ldquo;{entry.analogy}&rdquo;
              </p>
            </div>
          )}
        </section>
      )}

      {/* Under-the-Hood Mechanism */}
      <section className="rounded-2xl border border-border/80 bg-card/50 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold uppercase tracking-wider">
          <Cpu className="h-4 w-4" />
          <span>Under-the-Hood Mechanism</span>
        </div>
        <div className="text-base text-foreground/90 leading-relaxed font-sans whitespace-pre-line space-y-4">
          {entry.definition}
        </div>
      </section>

      {/* Real-Life Usage & Practical Example */}
      {entry.practicalUsage && (
        <section className="rounded-2xl border border-border/80 bg-card/50 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold uppercase tracking-wider">
            <Terminal className="h-4 w-4" />
            <span>Real-Life Usage & Example</span>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">
              {entry.practicalUsage.scenario}
            </p>
          </div>

          {/* Code/Command Box */}
          <div className="relative rounded-xl border border-border/90 bg-neutral-950/90 dark:bg-black/80 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/20 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500/80 inline-block" />
                Terminal / Code
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(entry.practicalUsage!.codeOrCommand)}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded hover:bg-muted/40 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Copy to clipboard"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 sm:p-5 text-xs sm:text-sm font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
              <code>{entry.practicalUsage.codeOrCommand}</code>
            </pre>
          </div>

          {entry.practicalUsage.explanation && (
            <p className="text-sm text-muted-foreground leading-relaxed pt-1">
              <strong className="text-foreground font-medium">What happens: </strong>
              {entry.practicalUsage.explanation}
            </p>
          )}
        </section>
      )}

      {/* Production Pro-Tips & Gotchas */}
      {entry.practicalTips && entry.practicalTips.length > 0 && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-amber-500 font-mono text-xs font-semibold uppercase tracking-wider">
            <Zap className="h-4 w-4" />
            <span>Production Pro-Tips & Gotchas</span>
          </div>
          <ul className="space-y-3 font-sans text-sm sm:text-base text-foreground/90">
            {entry.practicalTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-2" />
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Common Misconceptions (Busted) */}
      {entry.misconceptions && entry.misconceptions.length > 0 && (
        <section className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4" />
            <span>Common Misconceptions (Busted)</span>
          </div>
          <ul className="space-y-3.5 font-sans text-sm sm:text-base text-foreground/90">
            {entry.misconceptions.map((misc, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-2" />
                <span className="leading-relaxed">{misc}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Associated Learning Modules */}
      {entry.appearsIn && entry.appearsIn.length > 0 && (
        <section className="rounded-2xl border border-border/80 bg-card/50 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="h-4 w-4" />
            <span>Associated Deep Dive Modules</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entry.appearsIn.map((app, idx) => (
              <Link
                key={idx}
                to={app.href}
                className="group flex items-center justify-between rounded-xl border border-border/70 bg-background/60 p-4 hover:border-primary/50 hover:bg-card transition-all"
              >
                <div className="min-w-0 pr-2 space-y-1">
                  <span className="font-mono text-[10px] uppercase text-muted-foreground block">
                    {app.kind.replace(/-/g, " ")}
                  </span>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {app.title}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Primitives */}
      {relatedEntries.length > 0 && (
        <section className="rounded-2xl border border-border/80 bg-card/50 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold uppercase tracking-wider">
            <Tag className="h-4 w-4" />
            <span>Related Primitives & Concepts</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {relatedEntries.map((rel) =>
              rel ? (
                <Link
                  key={rel.slug}
                  to={`/learning/glossary/${rel.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Tag className="h-3 w-3" />
                  <span>{rel.term}</span>
                </Link>
              ) : null
            )}
          </div>
        </section>
      )}

      {/* Bottom Prev / Next Navigation */}
      <div className="pt-6 border-t border-border/60 flex items-center justify-between gap-4">
        {prevEntry ? (
          <Link
            to={`/learning/glossary/${prevEntry.slug}`}
            className="group flex items-center gap-2.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <div className="text-left">
              <span className="text-[10px] uppercase block text-muted-foreground/80">Previous</span>
              <span className="font-medium text-foreground group-hover:text-primary">{prevEntry.term}</span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextEntry && (
          <Link
            to={`/learning/glossary/${nextEntry.slug}`}
            className="group flex items-center gap-2.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors text-right"
          >
            <div className="text-right">
              <span className="text-[10px] uppercase block text-muted-foreground/80">Next</span>
              <span className="font-medium text-foreground group-hover:text-primary">{nextEntry.term}</span>
            </div>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default GlossaryDetailPage;
