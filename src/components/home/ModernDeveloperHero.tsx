import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Flame,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Terminal,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  MapPin,
  Boxes,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import type { PostSummary } from "@/lib/content";
import type { ConferenceEvent } from "@/lib/integrations/events";
import { getImageEntry } from "@/lib/content/image-manifest";
import CategoryBadge from "@/components/content/CategoryBadge";
import { cn } from "@/lib/utils";

interface ModernDeveloperHeroProps {
  lead?: PostSummary | null;
  slides?: PostSummary[];
  trending: PostSummary[];
  imminentEvent?: ConferenceEvent | null;
}

export const ModernDeveloperHero = ({
  lead,
  slides,
  trending,
  imminentEvent,
}: ModernDeveloperHeroProps) => {
  const items = slides && slides.length > 0 ? slides : lead ? [lead] : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = items.length;

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    if (idx >= 0 && idx < total) {
      setCurrentIndex(idx);
    }
  };

  // Auto-advance every 6 seconds, paused on hover, focus, or user toggle
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      goToNext();
    }, 6000);

    return () => clearInterval(timer);
  }, [total, isPaused, goToNext]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      goToNext();
    } else if (distance < -50) {
      goToPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goToNext();
    }
  };

  if (items.length === 0) return null;

  const currentItem = items[currentIndex] ?? items[0];
  const itemImageEntry = currentItem.image ? getImageEntry(currentItem.image) : null;
  const itemDateFormatted = currentItem.date
    ? format(new Date(currentItem.date), "MMM d, yyyy")
    : "";

  return (
    <div className="space-y-6">
      {/* Editorial Split Hero Grid */}
      <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
        {/* Left Column (7 cols = ~58% width): Featured Deep Dive Carousel */}
        <section
          aria-roledescription="carousel"
          aria-label="Featured Articles Carousel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="lg:col-span-7 group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm transition-all hover:border-accent/40 hover:shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent h-full"
        >
          {/* Top Carousel Controls & Badge Bar */}
          <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Editor's Deep Dive
              </span>
              {total > 1 && (
                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-mono font-medium text-muted-foreground">
                  0{currentIndex + 1} / 0{total}
                </span>
              )}
            </div>

            {total > 1 && (
              <div className="flex items-center gap-1.5" role="group" aria-label="Carousel navigation">
                <button
                  type="button"
                  onClick={goToPrev}
                  aria-label="Previous article"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-2xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  aria-label={isPaused ? "Play auto-advance" : "Pause auto-advance"}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-2xs"
                >
                  {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Next article"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-2xs"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <article key={currentItem.slug} className="flex-1 flex flex-col justify-between">
            <Link
              to={`/blog/${currentItem.slug}`}
              className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring rounded-lg"
              aria-label={currentItem.title}
            >
              {/* Visual Cover Image */}
              {currentItem.image ? (
                <div
                  className="relative mb-5 overflow-hidden rounded-lg border border-border/60 bg-muted aspect-[16/9]"
                  style={
                    itemImageEntry?.lqip
                      ? { backgroundImage: `url(${itemImageEntry.lqip})`, backgroundSize: "cover" }
                      : undefined
                  }
                >
                  <img
                    src={itemImageEntry?.src ?? currentItem.image}
                    alt={currentItem.imageAlt ?? currentItem.title}
                    width={itemImageEntry?.width ?? 1200}
                    height={itemImageEntry?.height ?? 675}
                    srcSet={itemImageEntry?.srcset}
                    sizes="(max-width: 768px) 100vw, 55vw"
                    loading="eager"
                    decoding="async"
                    // @ts-expect-error — fetchPriority is valid HTML, not yet in React types
                    fetchpriority="high"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-foreground backdrop-blur-md shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    Featured Story
                  </div>
                </div>
              ) : null}

              {/* Content Meta */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <CategoryBadge category={currentItem.category} className="text-accent font-semibold text-xs" />
                  <span className="text-xs text-muted-foreground/60">•</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden />
                    {currentItem.readingTime} min read
                  </span>
                  <span className="text-xs text-muted-foreground/60">•</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" aria-hidden />
                    {itemDateFormatted}
                  </span>
                </div>

                <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-3xl lg:text-3xl leading-snug">
                  {currentItem.title}
                </h1>

                <p className="line-clamp-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {currentItem.description}
                </p>
              </div>

              {/* Author / Editorial attribution */}
              <div className="mt-5 pt-4 border-t border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-accent/40 shadow-xs">
                    <img
                      src="/authors/activenerds-team.jpg"
                      alt="ActiveNerds Team"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {typeof currentItem.author === "object" && currentItem.author
                        ? (currentItem.author as any).name
                        : currentItem.author || "ActiveNerds Team"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Systems & DevSecOps Desk</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:translate-x-0.5 transition-transform">
                  Read guide <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </article>

          {/* Quick Jump Story Strip (Tabs + Progress Dots) */}
          {total > 1 && (
            <div className="mt-5 pt-3 border-t border-border/60">
              <div
                className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
                role="tablist"
                aria-label="Story carousel selector"
              >
                {items.map((slide, idx) => (
                  <button
                    key={slide.slug}
                    type="button"
                    role="tab"
                    aria-selected={idx === currentIndex}
                    aria-label={`Jump to slide ${idx + 1}: ${slide.title}`}
                    onClick={() => goToSlide(idx)}
                    className={cn(
                      "flex items-center gap-1.5 shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all text-left",
                      idx === currentIndex
                        ? "bg-accent/15 text-accent border border-accent/30 font-semibold shadow-2xs"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                    )}
                  >
                    <span className="font-mono text-[10px] opacity-75">0{idx + 1}</span>
                    <span className="max-w-[120px] truncate sm:max-w-[150px]">{slide.title}</span>
                  </button>
                ))}
              </div>

              {/* Slide Indicator Progress Dots */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      idx === currentIndex
                        ? "w-7 bg-accent"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right Column (5 cols = ~42% width): Trending in the Community & Radar */}
        <aside className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm h-full gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-accent fill-accent/20" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Community Pulse & Trending
                </h2>
              </div>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-mono font-medium text-accent">
                Updated Live
              </span>
            </div>

            {/* Ranked Trending List (Top 5) */}
            <ol className="divide-y divide-border/60">
              {trending.slice(0, 5).map((post, idx) => (
                <li key={post.slug} className="group py-2.5 first:pt-0 last:pb-0">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="flex items-start gap-3 focus-visible:outline-2 focus-visible:outline-ring rounded-md"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-mono font-bold text-muted-foreground group-hover:bg-accent/15 group-hover:text-accent transition-colors">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 text-[10px]">
                        <CategoryBadge category={post.category} className="text-[10px] font-medium" />
                        <span className="text-muted-foreground/40">•</span>
                        <span className="text-muted-foreground">{post.readingTime} min</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          {/* Bottom Deck: Imminent Conference Radar + Quick Tools Access */}
          <div className="space-y-3 pt-2">
            {/* Conference Radar Card */}
            {imminentEvent && (
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 transition-colors hover:border-accent/50 group/radar">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-accent">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="uppercase tracking-wider font-mono text-[10px]">Conference Radar</span>
                  </div>
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-mono font-bold text-accent">
                    {imminentEvent.countdownLabel}
                  </span>
                </div>
                {imminentEvent.linkUrl.startsWith("http") ? (
                  <a
                    href={imminentEvent.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block space-y-1 focus-visible:outline-2 focus-visible:outline-ring rounded-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover/radar:text-accent transition-colors truncate">
                        {imminentEvent.name}
                      </h4>
                      <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 ml-1 opacity-70 group-hover/radar:opacity-100" />
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                      <span>{imminentEvent.location}</span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="text-accent group-hover/radar:underline">Official Portal →</span>
                    </p>
                  </a>
                ) : (
                  <Link
                    to={imminentEvent.linkUrl}
                    className="block space-y-1 focus-visible:outline-2 focus-visible:outline-ring rounded-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover/radar:text-accent transition-colors truncate">
                        {imminentEvent.name}
                      </h4>
                      <ArrowRight className="h-3.5 w-3.5 text-accent shrink-0 ml-1 group-hover/radar:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                      <span>{imminentEvent.location}</span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="text-accent group-hover/radar:underline">Complete Survival Guide →</span>
                    </p>
                  </Link>
                )}
              </div>
            )}

            {/* Quick Developer Tools Launch Grid */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/tools/llm-vram-hardware-sizer"
                className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 p-2.5 hover:bg-muted hover:border-accent/40 transition-colors group/tool"
              >
                <Cpu className="h-4 w-4 text-accent shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate group-hover/tool:text-accent transition-colors">
                    LLM VRAM Sizer
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">GPU Hardware Calc</p>
                </div>
              </Link>
              <Link
                to="/tools/k8s-resource-quota-calculator"
                className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 p-2.5 hover:bg-muted hover:border-accent/40 transition-colors group/tool"
              >
                <Boxes className="h-4 w-4 text-accent shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate group-hover/tool:text-accent transition-colors">
                    K8s Quota Calc
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">Capacity Planner</p>
                </div>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Platform Highlight Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-border/70 bg-muted/30 p-3 sm:p-4 text-center">
        <div className="flex items-center justify-center gap-2.5 py-1">
          <Terminal className="h-4 w-4 text-accent" />
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">8 Curated Tracks</p>
            <p className="text-[11px] text-muted-foreground">AI, K8s, DevSecOps & Health</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2.5 py-1 border-l sm:border-l border-border/60">
          <Cpu className="h-4 w-4 text-accent" />
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">14 Live Calculators</p>
            <p className="text-[11px] text-muted-foreground">VRAM, Quotas, Cost, Timers</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2.5 py-1 border-t sm:border-t-0 sm:border-l border-border/60">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">Production Audits</p>
            <p className="text-[11px] text-muted-foreground">Checklists & Hardening</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2.5 py-1 border-t sm:border-t-0 sm:border-l border-border/60">
          <Sparkles className="h-4 w-4 text-accent" />
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">100% Free & Open</p>
            <p className="text-[11px] text-muted-foreground">Zero ads, zero paywalls</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDeveloperHero;
