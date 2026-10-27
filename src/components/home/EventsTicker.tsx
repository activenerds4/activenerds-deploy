import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, ExternalLink, Sparkles } from "lucide-react";
import {
  fetchUpcomingEvents,
  CURATED_FALLBACK_EVENTS,
  processEventsList,
  type ConferenceEvent,
} from "@/lib/integrations/events";

/**
 * Dynamic, asynchronous Events & Conference Countdown Ticker.
 *
 * Configurable via Google Sheets & Google Apps Script Webhook.
 * Displays upcoming tech conferences (e.g., AWS re:Invent 2026, CES 2027)
 * with countdown badges ("In 36 days", "Happening Now"), location tags,
 * and direct links to dedicated resource guides or official portals.
 */
const EventsTicker = () => {
  // Start with locally calculated fallback events for zero layout shift
  const [events, setEvents] = useState<ConferenceEvent[]>(() =>
    processEventsList(CURATED_FALLBACK_EVENTS)
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchUpcomingEvents()
      .then((loadedEvents) => {
        if (!cancelled && loadedEvents.length > 0) {
          setEvents(loadedEvents);
        }
      })
      .catch((err) => {
        console.warn("[EventsTicker] Failed to load remote events, using fallback:", err);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!events || events.length === 0) return null;

  // Duplicate events array to create a seamless infinite scrolling marquee
  const tickerEvents = [...events, ...events];

  return (
    <div
      className="group relative border-b border-border/80 bg-gradient-to-r from-muted/40 via-card to-muted/30 overflow-hidden text-xs"
      aria-label="Upcoming Tech Conferences and Events Countdown"
    >
      <div className="flex items-center gap-3 py-2">
        {/* Left fixed badge */}
        <div className="flex shrink-0 items-center gap-2 pl-4 sm:pl-8 pr-3.5 border-r border-border/80 z-10 bg-card/90 backdrop-blur-sm shadow-sm py-0.5">
          <div className="relative flex items-center justify-center">
            <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold uppercase tracking-wider text-foreground text-[11px]">
              Events & Summits
            </span>
            <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
              2026/2027
            </span>
          </div>
        </div>

        {/* Marquee ticker container with pause-on-hover */}
        <div className="relative flex-1 overflow-hidden select-none">
          <div className="flex animate-[eventsTicker_55s_linear_infinite] group-hover:[animation-play-state:paused] gap-10 whitespace-nowrap will-change-transform">
            {tickerEvents.map((event, idx) => {
              const isExternal =
                event.linkUrl.startsWith("http://") || event.linkUrl.startsWith("https://");
              const key = `${event.id}-${idx}`;

              const Content = (
                <div className="inline-flex items-center gap-2.5 py-0.5 px-1.5 rounded-md transition-colors hover:bg-muted/60">
                  {/* Countdown pill badge */}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight shadow-xs ${
                      event.isHappeningNow
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse"
                        : event.daysLeft <= 7
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-extrabold"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    {event.isHappeningNow && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block mr-0.5" />
                    )}
                    {event.countdownLabel}
                  </span>

                  {/* Event Name */}
                  <span className="font-semibold text-foreground text-xs tracking-tight group-hover/link:underline">
                    {event.name}
                  </span>

                  {/* Location badge */}
                  {event.location && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/90 font-medium">
                      <MapPin className="h-3 w-3 text-muted-foreground/70" aria-hidden />
                      {event.location}
                    </span>
                  )}

                  {/* Icon indicator */}
                  {isExternal ? (
                    <ExternalLink
                      className="h-2.5 w-2.5 text-muted-foreground/60 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                      aria-hidden
                    />
                  ) : (
                    <span className="text-[10px] font-mono text-muted-foreground/50">→</span>
                  )}
                </div>
              );

              return isExternal ? (
                <a
                  key={key}
                  href={event.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                  title={`${event.name} in ${event.location} (${event.countdownLabel}) — Opens official portal`}
                >
                  {Content}
                </a>
              ) : (
                <Link
                  key={key}
                  to={event.linkUrl}
                  className="group/link inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                  title={`${event.name} in ${event.location} (${event.countdownLabel}) — Read conference guide`}
                >
                  {Content}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes eventsTicker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[eventsTicker_55s_linear_infinite\\] {
            animation: none;
            overflow-x: auto;
            scroll-behavior: smooth;
          }
        }
      `}</style>
    </div>
  );
};

export default EventsTicker;
