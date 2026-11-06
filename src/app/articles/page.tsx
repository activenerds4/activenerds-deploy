import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Seo from "@/components/layout/Seo";
import Container from "@/components/layout/Container";
import PostList from "@/components/content/PostList";
import Pagination from "@/components/content/Pagination";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";
import { listPostsCached, getAllCategoriesCached, getAllTagsCached } from "@/lib/content";
import type { PostSummary, Category, Tag } from "@/lib/content";
import { paginate, slicePage, parsePageParam } from "@/lib/content/pagination";
import { categories as allCategories } from "../../../content/categories";
import { tags as allTags } from "../../../content/tags";

/**
 * Articles listing page — shows published posts in a paginated responsive grid (12/page),
 * with browse-by-category and browse-by-tag sections at the bottom.
 */
const ArticlesPage = () => {
  const [searchParams] = useSearchParams();
  const page = parsePageParam(searchParams.get("page"));

  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [cats, setCats] = useState<Category[] | null>(null);
  const [tagList, setTagList] = useState<Tag[] | null>(null);

  useEffect(() => {
    Promise.all([listPostsCached(), getAllCategoriesCached(), getAllTagsCached()]).then(
      ([p, c, t]) => {
        setPosts(p);
        setCats(c);
        setTagList(t);
      },
    );
  }, []);

  useEffect(() => {
    if (page > 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page]);

  const pagination = posts ? paginate({ total: posts.length, page, pageSize: 12 }) : null;
  const pagePosts = posts && pagination ? slicePage(posts, pagination) : [];

  const seoTitle = pagination && pagination.page > 1 ? `Articles — Page ${pagination.page}` : "Articles";
  const seoDescription =
    pagination && pagination.page > 1
      ? `Browse all published articles, guides, and insights — page ${pagination.page} of ${pagination.totalPages}.`
      : "Browse all published articles, guides, and insights by category and topic.";

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={pagination && pagination.page > 1 ? `/articles?page=${pagination.page}` : "/articles"}
      />
      <JsonLd
        schema={breadcrumbSchema([{ label: "Home", href: "/" }, { label: "Articles" }])}
        id="breadcrumb"
      />
      <Container className="py-12 sm:py-16" width="default">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow mb-3">All Articles</p>
          <h1 className="display-heading mb-4 text-4xl text-foreground sm:text-5xl">The Archive</h1>
          <p className="text-lg text-muted-foreground">
            {posts ? `${posts.length} published articles, guides, and insights.` : "Browse all published articles, guides, and insights by category and topic."}
          </p>
        </header>

        {posts === null ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-[16/9] rounded-lg bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <PostList posts={pagePosts} layout="grid" />
            {pagination && <Pagination pagination={pagination} basePath="/articles" />}
          </>
        )}

        {/* Browse by Category */}
        <section id="categories" className="mt-16 scroll-mt-20">
          <h2 className="display-heading mb-6 text-2xl text-foreground">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {allCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by Tag */}
        <section id="tags" className="mt-12 scroll-mt-20">
          <h2 className="display-heading mb-6 text-2xl text-foreground">Browse by Tag</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Link
                key={tag.slug}
                to={`/tag/${tag.slug}`}
                className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
};

export default ArticlesPage;
