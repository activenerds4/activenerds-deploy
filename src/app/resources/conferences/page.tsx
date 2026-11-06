import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Ticket,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Users,
  Compass,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import {
  getConferenceGuides,
  CONFERENCE_CATEGORIES,
  type ConferenceCategory,
  type ConferenceGuide,
} from "@/lib/config/conference-registry";
import { CURATED_FALLBACK_EVENTS } from "@/lib/integrations/events";
import { cn } from "@/lib/utils";

// Comprehensive calendar data matching the global calendar
interface MasterCalendarItem {
  name: string;
  typicalDates: string;
  location: string;
  format: string;
  guideSlug?: string;
}

const MASTER_CALENDAR: MasterCalendarItem[] = [
  {
    name: "AWS re:Invent",
    typicalDates: "Nov–Dec 2026",
    location: "Las Vegas, NV",
    format: "In-person + Virtual",
    guideSlug: "aws-reinvent-las-vegas",
  },
  {
    name: "CES Las Vegas",
    typicalDates: "January 2027",
    location: "Las Vegas, NV",
    format: "In-person",
    guideSlug: "ces-las-vegas",
  },
  {
    name: "NVIDIA GTC Global",
    typicalDates: "March 2027",
    location: "San Jose, CA + Virtual",
    format: "Hybrid",
    guideSlug: "nvidia-gtc-global",
  },
  {
    name: "KubeCon + CloudNativeCon EU",
    typicalDates: "April 2027",
    location: "London, UK",
    format: "Hybrid",
    guideSlug: "kubecon-cloudnativecon-europe",
  },
  {
    name: "Google Cloud Next",
    typicalDates: "April 2027",
    location: "Las Vegas, NV",
    format: "In-person + Virtual",
    guideSlug: "google-cloud-next",
  },
  {
    name: "Google I/O",
    typicalDates: "May 2027",
    location: "Mountain View, CA",
    format: "In-person + Virtual",
    guideSlug: "google-io-conference-guide",
  },
  {
    name: "Databricks Data + AI Summit",
    typicalDates: "June 2027",
    location: "San Francisco, CA",
    format: "In-person + Virtual",
    guideSlug: "databricks-data-ai-summit",
  },
  {
    name: "Ai4 Enterprise Summit",
    typicalDates: "August 2027",
    location: "Las Vegas, NV",
    format: "In-person",
    guideSlug: "ai4-enterprise-summit",
  },
  {
    name: "Black Hat USA & DEF CON",
    typicalDates: "August 2027",
    location: "Las Vegas, NV",
    format: "In-person",
    guideSlug: "black-hat-defcon-vegas",
  },
  {
    name: "fwd:cloudsec Cloud Security Summit",
    typicalDates: "Varies (USA & Europe)",
    location: "Rotates",
    format: "In-person + Virtual",
    guideSlug: "fwd-cloudsec-summit",
  },
  {
    name: "GitHub Universe",
    typicalDates: "October 2026",
    location: "San Francisco, CA",
    format: "In-person + Virtual",
    guideSlug: "github-universe-conference-guide",
  },
  {
    name: "All Things Open",
    typicalDates: "October 2026",
    location: "Raleigh, NC",
    format: "In-person + Virtual",
    guideSlug: "all-things-open",
  },
  {
    name: "KubeCon + CloudNativeCon NA",
    typicalDates: "November 2026",
    location: "Salt Lake City, UT",
    format: "Hybrid",
    guideSlug: "kubecon-cloudnativecon-na",
  },
  {
    name: "Microsoft Ignite",
    typicalDates: "November 2026",
    location: "San Francisco / Chicago",
    format: "In-person + Virtual",
    guideSlug: "microsoft-ignite",
  },
  {
    name: "DevOpsDays Global Series",
    typicalDates: "Year-round",
    location: "100+ cities worldwide",
    format: "In-person",
    guideSlug: "devopsdays-global-series",
  },
];

const ConferencesPage = () => {
  const guides = useMemo(() => getConferenceGuides(), []);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = (searchParams.get("category") as ConferenceCategory) || "all";
  const [query, setQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<string>("all");

  const setCategoryParam = (cat: ConferenceCategory) => {
    const next = new URLSearchParams(searchParams);
    if (cat === "all") {
      next.delete("category");
    } else {
      next.set("category", cat);
    }
    setSearchParams(next, { replace: true });
  };

  const filteredGuides = useMemo(() => {
    const q = query.toLowerCase().trim();
    const currentCategoryConfig = CONFERENCE_CATEGORIES.find((c) => c.id === activeCategory);

    return guides.filter((guide) => {
      // Category filter
      if (activeCategory !== "all" && currentCategoryConfig) {
        const matchesCategory =
          guide.tags.some((t) => currentCategoryConfig.tagMatches.includes(t.toLowerCase())) ||
          guide.slug.toLowerCase().includes(activeCategory);
        if (!matchesCategory) return false;
      }

      // Format filter
      if (formatFilter !== "all") {
        const fmt = guide.conferenceDetails.format.toLowerCase();
        if (formatFilter === "hybrid" && !fmt.includes("hybrid") && !(fmt.includes("in-person") && fmt.includes("virtual"))) {
          return false;
        }
        if (formatFilter === "in-person" && !fmt.includes("in-person")) {
          return false;
        }
        if (formatFilter === "virtual" && !fmt.includes("virtual")) {
          return false;
        }
      }

      // Search query filter
      if (!q) return true;
      const searchable = [
        guide.title,
        guide.description,
        guide.conferenceDetails.name,
        guide.conferenceDetails.organizer,
        guide.conferenceDetails.primaryLocation,
        guide.conferenceDetails.typicalDates,
        ...guide.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(q);
    });
  }, [guides, activeCategory, formatFilter, query]);

  return (
    <>
      <Seo
        title="Conferences & Summits Directory — KubeCon, AWS re:Invent, GTC & Cloud Events"
        description="Comprehensive guides, pass tiers, travel strategies, and wellness advice for KubeCon, AWS re:Invent, NVIDIA GTC, Black Hat, Google Cloud Next, and global tech summits."
        path="/resources/conferences"
      />

      <div className="py-8 sm:py-12">
        <Container width="default" className="space-y-12">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted-foreground">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link to="/resources" className="hover:text-primary transition-colors">
                  Resources
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">Conferences & Summits</li>
            </ol>
          </nav>

          {/* Hero Header */}
          <header className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-10 backdrop-blur-sm relative overflow-hidden space-y-4">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                <Compass className="h-4 w-4" />
                <span>Global Event Strategy & Field Guides</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Conferences & Summits
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-1">
                Pass tier breakdowns, session selection strategies, travel logistics, and physical
                wellness playbooks for platform engineers, AI architects, and DevSecOps leaders
                navigating the world's premier technical gatherings.
              </p>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/50 text-xs font-mono">
              <div>
                <span className="block text-muted-foreground uppercase text-[10px]">Curated Guides</span>
                <span className="text-lg font-bold text-foreground">15 In-Depth</span>
              </div>
              <div>
                <span className="block text-muted-foreground uppercase text-[10px]">Global Venues</span>
                <span className="text-lg font-bold text-foreground">Vegas, SF, London, Rotates</span>
              </div>
              <div>
                <span className="block text-muted-foreground uppercase text-[10px]">Formats</span>
                <span className="text-lg font-bold text-foreground">In-Person & Hybrid</span>
              </div>
              <div>
                <span className="block text-muted-foreground uppercase text-[10px]">Coverage</span>
                <span className="text-lg font-bold text-primary">K8s, AI, Cloud, Security</span>
              </div>
            </div>
          </header>

          {/* Interactive Search & Filter Controls */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search conferences, cities, passes, or tech..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background/80 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  aria-label="Search conference guides"
                />
              </div>

              {/* Format dropdown filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground shrink-0">Format:</span>
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  aria-label="Filter by event format"
                >
                  <option value="all">All Formats</option>
                  <option value="hybrid">Hybrid Only</option>
                  <option value="in-person">In-Person Only</option>
                  <option value="virtual">Virtual Available</option>
                </select>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
                <Filter className="h-3 w-3" />
                Domain:
              </span>
              {CONFERENCE_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryParam(cat.id)}
                    className={cn(
                      "rounded-full border px-3.5 py-1 text-xs font-medium transition-all select-none",
                      isActive
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Conference Guide Cards Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Dedicated Conference Guides</span>
                <span className="text-xs font-mono font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {filteredGuides.length} of {guides.length}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <div
                  key={guide.slug}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-card/60 p-6 transition-all duration-200 hover:border-primary/50 hover:bg-card hover:shadow-lg relative overflow-hidden"
                >
                  {/* Card top badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        {guide.conferenceDetails.format}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {guide.conferenceDetails.typicalDates}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {guide.conferenceDetails.name}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                      <span className="truncate">{guide.conferenceDetails.primaryLocation}</span>
                    </p>

                    <p className="mt-3 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {guide.description}
                    </p>
                  </div>

                  {/* Card footer with Pass info & CTA */}
                  <div className="mt-6 pt-4 border-t border-border/50 space-y-3">
                    <div className="flex items-start gap-1.5 text-[11px] font-mono text-muted-foreground">
                      <Ticket className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{guide.conferenceDetails.estimatedPassCost}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1">
                        {guide.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <Link
                        to={`/resources/conferences/${guide.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80 group-hover:translate-x-0.5 transform transition-transform"
                      >
                        <span>View Guide</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredGuides.length === 0 && (
              <div className="py-16 text-center border border-dashed border-border rounded-xl bg-card/30">
                <p className="text-sm text-muted-foreground font-mono">
                  No conference guides match "{query}".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategoryParam("all");
                    setFormatFilter("all");
                  }}
                  className="mt-4 rounded-md bg-primary/10 border border-primary/20 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>

          {/* Master Global Summits Schedule Table */}
          <section className="space-y-6 pt-6 border-t border-border">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Annual Schedule</span>
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Upcoming Tech Conference Calendar
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                At-a-glance dates, locations, and formats for global technical conferences across cloud,
                Kubernetes, AI/ML, and DevSecOps.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card/60 backdrop-blur-sm">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-mono text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Event</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Typical Timing</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Location</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Format</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Resource Guide</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-sans">
                  {MASTER_CALENDAR.map((event) => (
                    <tr
                      key={event.name}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-semibold text-foreground">
                        {event.name}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-muted-foreground">
                        {event.typicalDates}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {event.location}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2 py-0.5 font-mono text-[10px] rounded bg-muted text-muted-foreground font-medium">
                          {event.format}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium">
                        {event.guideSlug ? (
                          <Link
                            to={`/resources/conferences/${event.guideSlug}`}
                            className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                          >
                            <span>Guide</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-muted-foreground/60 font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Conference Playbook Highlights */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Ticket className="h-4 w-4" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Manager Pass Justification
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every guide includes tailored ROI arguments, cost breakdowns, and session learning objectives
                to paste into corporate travel requests.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-4 w-4" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Vegas & Multi-Venue Strategy
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Navigating re:Invent or CES across 3 miles of the Strip without burning out. Transit tricks,
                hallway track positioning, and hydration essentials.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Physical Longevity
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Desk-to-conference movement protocols, earplug selection for loud expo halls, and
                staying energized across 14-hour keynote and networking days.
              </p>
            </div>
          </section>

          {/* Submission and Community Contact Banner */}
          <section className="rounded-2xl border border-border bg-gradient-to-r from-card to-muted/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-display text-xl font-bold text-foreground">
                Know of a summit or conference we should cover?
              </h3>
              <p className="text-sm text-muted-foreground">
                We regularly expand our conference guides, discount codes, and local meetup tracking.
              </p>
            </div>
            <Link
              to="/contact"
              className="rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
            >
              Submit an Event →
            </Link>
          </section>
        </Container>
      </div>
    </>
  );
};

export default ConferencesPage;
