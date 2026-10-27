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
  TopicPillBar,
  ModernDeveloperHero,
  DeveloperToolsShowcase,
  DeveloperResourcesDeck,
  CommunityInteractiveHub,
  CategorySectionBlock,
  TrendingSidebar,
  FeaturedAuthorSpotlight,
} from "@/components/home";
import { Layers, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";

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
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Round 1: Fetch all primary data in parallel
      const [ticker, feat, lat, trend, cats, auths] = await Promise.all([
        getHomepageTickerCached(5),
        getHomepageFeaturedCached(1),
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

      const featuredSlugs = new Set(feat.map((p) => p.slug));

      setTickerPosts(ticker);
      setFeatured(feat);
      setTrending(trend);
      setCategories(cats);
      setAuthors(auths);
      setCategoryPosts(categoryMap);
      setAuthorPosts(authorPosts);
      setLatest(lat.filter((p) => !featuredSlugs.has(p.slug)));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const leadPost = featured?.[0] ?? null;
  const featuredAuthor = authors?.[0] ?? null;

  // Filter latest articles if a category topic is selected
  const displayArticles = useMemo(() => {
    if (!latest) return [];
    if (selectedTopic === "all") return latest.slice(0, 8);
    // If specific category is selected, return from categoryPosts map or filtered latest
    const fromCatMap = categoryPosts[selectedTopic];
    if (fromCatMap && fromCatMap.length > 0) return fromCatMap;
    return latest.filter((p) => p.category === selectedTopic);
  }, [latest, selectedTopic, categoryPosts]);

  const activeCategoryObj = useMemo(
    () => categories?.find((c) => c.slug === selectedTopic),
    [categories, selectedTopic],
  );

  return (
    <>
      {/* Breaking news / real-time ticker */}
      {tickerPosts && tickerPosts.length > 0 ? <TrendingTicker posts={tickerPosts} /> : null}

      {/* Sticky Category / Topic Bar for 1-click filtering */}
      <TopicPillBar
        activeCategory={selectedTopic}
        onSelectCategory={(catSlug) => setSelectedTopic(catSlug)}
      />

      {/* Modern Developer Split Hero Section */}
      <section className="border-b border-border/80 bg-background">
        <Container className="py-6 sm:py-8 lg:py-10" width="default">
          {leadPost ? (
            <ModernDeveloperHero lead={leadPost} trending={trending ?? []} />
          ) : (
            <div className="grid gap-6 lg:grid-cols-12 animate-pulse">
              <div className="lg:col-span-7 h-96 rounded-xl bg-muted" />
              <div className="lg:col-span-5 h-96 rounded-xl bg-muted" />
            </div>
          )}
        </Container>
      </section>

      {/* Interactive Developer Tools Showcase */}
      <DeveloperToolsShowcase />

      {/* Active Community Hub (Daily Poll + Active Desk Micro-Break Timer) */}
      <CommunityInteractiveHub />

      {/* Developer Reference & Cheat Sheets Quick-Deck */}
      <DeveloperResourcesDeck />

      {/* Latest Technical Articles Feed with Active Topic Filter */}
      <section id="articles-feed" className="py-12 sm:py-16">
        <Container width="default">
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Articles Stream — 2/3 width */}
            <div className="lg:col-span-2">
              <div className="mb-6 flex items-end justify-between border-b border-border/70 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-accent" />
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
                      {selectedTopic === "all"
                        ? "Latest Technical Guides & Deep Dives"
                        : `${activeCategoryObj?.name || "Track"} Articles`}
                    </h2>
                  </div>
                  {activeCategoryObj?.description && (
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                      {activeCategoryObj.description}
                    </p>
                  )}
                </div>

                {selectedTopic !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedTopic("all")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted px-2.5 py-1 rounded-md transition-colors"
                  >
                    Clear Filter <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {displayArticles.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                  <p className="text-sm">No articles found in this track yet.</p>
                  <button
                    type="button"
                    onClick={() => setSelectedTopic("all")}
                    className="mt-3 text-xs font-semibold text-accent hover:underline"
                  >
                    Return to all articles
                  </button>
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
        </Container>
      </section>

      {/* Category Deep-Dive Strips (when viewing all tracks) */}
      {selectedTopic === "all" &&
        categories?.slice(0, 4).map((cat) => {
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
