import { useEffect, useState, useMemo } from "react";
import {
  getHomepageFeaturedCached,
  getHomepageLatestCached,
  getHomepageTickerCached,
  getHomepageTrendingCached,
  getHomepageCategoryCached,
  getAllCategoriesCached,
  getAllAuthorsCached,
  getHomepageAuthorPostsCached,
} from "@/lib/content";
import type { PostSummary, Category, Author } from "@/lib/content";
import Container from "@/components/layout/Container";
import PostCard from "@/components/content/PostCard";
import NewsletterCTA from "@/components/growth/NewsletterCTA";
import {
  TrendingTicker,
  ModernDeveloperHero,
  DeveloperToolsShowcase,
  DeveloperResourcesDeck,
  CommunityInteractiveHub,
  CategorySectionBlock,
  TrendingSidebar,
  FeaturedAuthorSpotlight,
} from "@/components/home";
import { Layers, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  fetchUpcomingEvents,
  processEventsList,
  CURATED_FALLBACK_EVENTS,
  type ConferenceEvent,
} from "@/lib/integrations/events";

/**
 * Modern Developer Community & Engineering Hub Homepage.
 *
 * Archetype: High-credibility engineering publication (Vercel / Cloudflare / Hashnode)
 * Features:
 * - Breaking news ticker
 * - Sticky technical topic pills bar (1-click filtering)
 * - Modern Split Hero (Lead Deep Dive + Community Pulse & Trending)
 * - Interactive Developer Tools Showcase
 * - Community Hub (Daily Poll + Active Desk Micro-Break Timer)
 * - Developer Reference Deck (Cheatsheets & Checklists)
 * - Filterable Latest Technical Articles Feed
 * - Category Strips & Author Spotlight
 * - Growth Newsletter CTA
 */
const Home = () => {
  const [tickerPosts, setTickerPosts] = useState<PostSummary[] | null>(null);
  const [featured, setFeatured] = useState<PostSummary[] | null>(null);
  const [latest, setLatest] = useState<PostSummary[] | null>(null);
  const [trending, setTrending] = useState<PostSummary[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [categoryPosts, setCategoryPosts] = useState<Record<string, PostSummary[]>>({});
  const [authors, setAuthors] = useState<Author[] | null>(null);
  const [authorPosts, setAuthorPosts] = useState<PostSummary[] | null>(null);
  const [imminentEvent, setImminentEvent] = useState<ConferenceEvent | null>(() => {
    const initialList = processEventsList(CURATED_FALLBACK_EVENTS);
    return initialList.length > 0 ? initialList[0] : null;
  });

  useEffect(() => {
    let cancelled = false;

    // Load upcoming events for the ticker & hero conference radar
    fetchUpcomingEvents()
      .then((loaded) => {
        if (!cancelled && loaded.length > 0) {
          setImminentEvent(loaded[0]);
        }
      })
      .catch((err) => {
        console.warn("[Home] Could not load upcoming events:", err);
      });

    (async () => {
      // Round 1: Fetch all primary data in parallel
      const [ticker, feat, lat, trend, cats, auths] = await Promise.all([
        getHomepageTickerCached(5),
        getHomepageFeaturedCached(6),
        getHomepageLatestCached(16),
        getHomepageTrendingCached(5),
        getAllCategoriesCached(),
        getAllAuthorsCached(),
      ]);

      // Round 2: Fetch category posts and author posts in parallel batch
      const [catResults, authorPosts] = await Promise.all([
        Promise.all(cats.map((cat) => getHomepageCategoryCached(cat.slug, 4))),
        auths.length > 0 ? getHomepageAuthorPostsCached(auths[0].slug, 3) : Promise.resolve([]),
      ]);

      if (cancelled) return;

      const categoryMap: Record<string, PostSummary[]> = {};
      cats.forEach((cat, idx) => {
        categoryMap[cat.slug] = catResults[idx];
      });

      setTickerPosts(ticker);
      setFeatured(feat);
      setTrending(trend);
      setCategories(cats);
      setAuthors(auths);
      setCategoryPosts(categoryMap);
      setAuthorPosts(authorPosts);
      setLatest(lat);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const leadPost = featured?.[0] ?? null;
  const featuredAuthor = authors?.[0] ?? null;

  // Latest articles for feed
  const displayArticles = useMemo(() => {
    if (!latest) return [];
    return latest.slice(0, 8);
  }, [latest]);

  return (
    <>
      {/* Breaking news / real-time ticker */}
      {tickerPosts && tickerPosts.length > 0 ? (
        <TrendingTicker posts={tickerPosts} event={imminentEvent} />
      ) : null}

      {/* Modern Developer Split Hero Section (Aligned with max-w-7xl) */}
      <section className="border-b border-border/80 bg-background overflow-hidden w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 w-full min-w-0">
          {featured && featured.length > 0 ? (
            <ModernDeveloperHero
              slides={featured}
              lead={leadPost}
              trending={trending ?? []}
              imminentEvent={imminentEvent}
            />
          ) : leadPost ? (
            <ModernDeveloperHero
              lead={leadPost}
              trending={trending ?? []}
              imminentEvent={imminentEvent}
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-12 animate-pulse">
              <div className="lg:col-span-7 h-96 rounded-xl bg-muted" />
              <div className="lg:col-span-5 h-96 rounded-xl bg-muted" />
            </div>
          )}
        </div>
      </section>

      {/* Interactive Developer Tools Showcase */}
      <DeveloperToolsShowcase />

      {/* Active Community Hub (Daily Poll + Active Desk Micro-Break Timer) */}
      <CommunityInteractiveHub />

      {/* Developer Reference & Cheat Sheets Quick-Deck */}
      <DeveloperResourcesDeck />

      {/* Latest Technical Articles Feed with Active Topic Filter (Aligned with max-w-7xl) */}
      <section id="articles-feed" className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Articles Stream — 2/3 width */}
            <div className="lg:col-span-2">
              <div className="mb-6 flex items-end justify-between border-b border-border/70 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-accent" />
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
                      Latest Technical Guides & Deep Dives
                    </h2>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Curated architecture patterns, security audits, and engineering breakdowns.
                  </p>
                </div>
              </div>

              {displayArticles.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                  <p className="text-sm">No articles available yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {displayArticles.map((post) => (
                    <PostCard key={post.slug} post={post} variant="default" />
                  ))}
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-border/60 text-center">
                <Link
                  to="/articles"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:border-accent hover:text-accent transition-colors shadow-2xs"
                >
                  Browse all published articles <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Sticky Sidebar — 1/3 width */}
            <div className="lg:col-span-1">
              {trending ? <TrendingSidebar posts={trending} /> : null}
            </div>
          </div>
        </div>
      </section>

      {/* Category Deep-Dive Strips */}
      {categories?.slice(0, 4).map((cat) => {
        const posts = categoryPosts[cat.slug];
        if (!posts || posts.length === 0) return null;
        return <CategorySectionBlock key={cat.slug} category={cat} posts={posts} />;
      })}

      {/* Featured Author Spotlight */}
      <FeaturedAuthorSpotlight author={featuredAuthor} posts={authorPosts ?? []} />

      {/* Newsletter CTA */}
      <section className="border-t border-border/80 bg-muted/15">
        <Container className="py-12 sm:py-16" width="default">
          <div className="mx-auto max-w-2xl">
            <NewsletterCTA placement="homepage" />
          </div>
        </Container>
      </section>
    </>
  );
};

export default Home;
