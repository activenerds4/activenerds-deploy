import { Link } from "react-router-dom";
import { Radio, Calendar, ExternalLink } from "lucide-react";
import type { PostSummary } from "@/lib/content";
import type { ConferenceEvent } from "@/lib/integrations/events";

interface TrendingTickerProps {
  posts: PostSummary[];
  event?: ConferenceEvent | null;
}

type TickerItem =
  | { type: "post"; slug: string; title: string }
  | {
      type: "event";
      name: string;
      countdownLabel: string;
      location: string;
      linkUrl: string;
    };

/**
 * Auto-scrolling headline & event ticker for the top of the homepage.
 * Shows imminent upcoming conference and latest published technical articles.
 */
const TrendingTicker = ({ posts, event }: TrendingTickerProps) => {
  if ((!posts || posts.length === 0) && !event) return null;

  const baseItems: TickerItem[] = [];

  if (event) {
    baseItems.push({
      type: "event",
      name: event.name,
      countdownLabel: event.countdownLabel,
      location: event.location,
      linkUrl: event.linkUrl,
    });
  }

  posts.forEach((post) => {
    baseItems.push({
      type: "post",
      slug: post.slug,
      title: post.title,
    });
  });

  // Duplicate for smooth seamless loop
  const loopItems = [...baseItems, ...baseItems];

  return (
    <div className="border-b border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 py-2.5">
        <div className="flex shrink-0 items-center gap-1.5 pl-5 sm:pl-8 pr-3 border-r border-border">
          <Radio className="h-3.5 w-3.5 animate-pulse text-destructive" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground whitespace-nowrap">
            Latest
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex animate-[ticker_45s_linear_infinite] gap-8 whitespace-nowrap items-center">
            {loopItems.map((item, idx) => {
              if (item.type === "event") {
                const isExternal = item.linkUrl.startsWith("http");
                const content = (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent border border-accent/30 hover:bg-accent/25 transition-colors shadow-2xs">
                    <Calendar className="h-3 w-3 shrink-0" aria-hidden />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                      {item.countdownLabel}:
                    </span>
                    <span>{item.name}</span>
                    <span className="text-accent/70 font-normal">({item.location})</span>
                    {isExternal && <ExternalLink className="h-3 w-3 opacity-70" />}
                  </span>
                );

                return isExternal ? (
                  <a
                    key={`event-${idx}`}
                    href={item.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-visible:outline-2 focus-visible:outline-ring rounded-full shrink-0"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={`event-${idx}`}
                    to={item.linkUrl}
                    className="focus-visible:outline-2 focus-visible:outline-ring rounded-full shrink-0"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <Link
                  key={`${item.slug}-${idx}`}
                  to={`/blog/${item.slug}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm shrink-0"
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[ticker_45s_linear_infinite\\] {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default TrendingTicker;
