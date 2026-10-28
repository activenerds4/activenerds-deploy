import { Link } from "react-router-dom";
import { Calendar, Clock, Flame, ArrowRight, ShieldCheck, Cpu, Terminal, Sparkles } from "lucide-react";
import { format } from "date-fns";
import type { PostSummary } from "@/lib/content";
import { getImageEntry } from "@/lib/content/image-manifest";
import CategoryBadge from "@/components/content/CategoryBadge";
import { ActiveNerdsMark } from "@/components/brand/ActiveNerdsMark";

interface ModernDeveloperHeroProps {
  lead: PostSummary | null;
  trending: PostSummary[];
}

export const ModernDeveloperHero = ({ lead, trending }: ModernDeveloperHeroProps) => {
  if (!lead) return null;

  const leadImageEntry = lead.image ? getImageEntry(lead.image) : null;
  const leadDateFormatted = lead.date ? format(new Date(lead.date), "MMM d, yyyy") : "";

  return (
    <div className="space-y-6">
      {/* Editorial Split Hero Grid */}
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column (7 cols = ~58% width): Featured Deep Dive */}
        <article className="lg:col-span-7 group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm transition-all hover:border-accent/40 hover:shadow-md">
          <Link
            to={`/blog/${lead.slug}`}
            className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring rounded-lg"
            aria-label={lead.title}
          >
            {/* Visual Cover Image */}
            {lead.image ? (
              <div
                className="relative mb-5 overflow-hidden rounded-lg border border-border/60 bg-muted aspect-[16/9]"
                style={
                  leadImageEntry?.lqip
                    ? { backgroundImage: `url(${leadImageEntry.lqip})`, backgroundSize: "cover" }
                    : undefined
                }
              >
                <img
                  src={leadImageEntry?.src ?? lead.image}
                  alt={lead.imageAlt ?? lead.title}
                  width={leadImageEntry?.width ?? 1200}
                  height={leadImageEntry?.height ?? 675}
                  srcSet={leadImageEntry?.srcset}
                  sizes="(max-width: 768px) 100vw, 55vw"
                  loading="eager"
                  decoding="async"
                  // @ts-expect-error — fetchPriority is valid HTML, not yet in React types
                  fetchpriority="high"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-foreground backdrop-blur-md shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  Editor's Deep Dive
                </div>
              </div>
            ) : null}

            {/* Content Meta */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <CategoryBadge category={lead.category} className="text-accent font-semibold text-xs" />
                <span className="text-xs text-muted-foreground/60">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden />
                  {lead.readingTime} min read
                </span>
                <span className="text-xs text-muted-foreground/60">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" aria-hidden />
                  {leadDateFormatted}
                </span>
              </div>

              <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-3xl lg:text-3xl">
                {lead.title}
              </h1>

              <p className="line-clamp-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                {lead.description}
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
                    {typeof lead.author === "object" && lead.author ? (lead.author as any).name : lead.author || "ActiveNerds Team"}
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

        {/* Right Column (5 cols = ~42% width): Trending in the Community */}
        <aside className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-border/80 pb-3">
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

            {/* Ranked Trending List */}
            <ol className="divide-y divide-border/60">
              {trending.slice(0, 4).map((post, idx) => (
                <li key={post.slug} className="group py-3 first:pt-0 last:pb-0">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="flex items-start gap-3.5 focus-visible:outline-2 focus-visible:outline-ring rounded-md"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-mono font-bold text-muted-foreground group-hover:bg-accent/15 group-hover:text-accent transition-colors">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-[11px]">
                        <CategoryBadge category={post.category} className="text-[11px] font-medium" />
                        <span className="text-muted-foreground/40">•</span>
                        <span className="text-muted-foreground">{post.readingTime} min</span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          {/* Quick Hub Access Banner */}
          <div className="mt-5 rounded-lg border border-accent/25 bg-accent/5 p-3.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">Developer Toolkit & Cheatsheets</p>
              <p className="text-[11px] text-muted-foreground">14 interactive calculators & 25+ guides</p>
            </div>
            <Link
              to="/tools"
              className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow-2xs hover:bg-accent/90 transition-colors"
            >
              Open Tools
            </Link>
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
