/**
 * Cached query layer.
 *
 * Wraps the active `ContentSource` with a tagged, stale-while-revalidate
 * cache. Every query is cached with deterministic tags so revalidation
 * helpers can invalidate precisely:
 *
 *   listPostsCached()         → tags: [posts, homepage]
 *   getPostCached(slug)       → tags: [posts, post:{slug}, category:{cat}, tag:{t}..., homepage]
 *   getPostsByCategoryCached  → tags: [category:{slug}, categories]
 *   getPostsByTagCached       → tags: [tag:{slug}, tags]
 *   getAllCategoriesCached    → tags: [categories]
 *   getAllTagsCached          → tags: [tags]
 *   getAuthorCached           → tags: [author:{slug}, authors]
 *   getAllAuthorsCached       → tags: [authors]
 *   getHomepageLatestCached   → tags: [homepage, posts]
 *   getHomepageFeaturedCached → tags: [homepage, posts]
 *
 * Stale-while-revalidate: when a cached entry is past its fresh window but
 * within the stale window, the stale value is returned immediately and a
 * background refresh is triggered. The caller never blocks on revalidation.
 */

import type { Author, Category, Post, PostSummary, Tag, ListPostsOptions } from "./types";
import { contentSource } from "./source-resolver";
import { contentCache, type CacheResult } from "./cache";
import type { CacheProfileName } from "@/lib/cache/profiles";
import {
  POSTS_TAG,
  CATEGORIES_TAG,
  TAGS_TAG,
  AUTHORS_TAG,
  HOMEPAGE_TAG,
  postTag,
  categoryTag,
  tagTag,
  authorTag,
  tagsForPost,
  tagsForPostIndex,
  tagsForCategory,
  tagsForTag,
  tagsForCategories,
  tagsForTags,
  tagsForAuthor,
  tagsForAuthors,
  tagsForHomepage,
} from "@/lib/cache/tags";

/**
 * Read from cache or fetch from source, with SWR background refresh.
 *
 * If the entry is stale (past freshMs but within staleMs), the stale value
 * is returned immediately and a background refresh runs. If no entry exists,
 * the fetch is blocking.
 */
async function cachedQuery<T>(
  key: string,
  tags: string[],
  profile: CacheProfileName,
  fetcher: () => Promise<T>,
): Promise<T> {
  const result: CacheResult<T> = contentCache.get<T>(key);

  if (result.hasValue && !result.isStale) {
    // Fresh cache hit — return immediately.
    return result.value as T;
  }

  if (result.hasValue && result.isStale) {
    // Stale-but-valid — serve immediately, refresh in background.
    if (contentCache.markRevalidating(key)) {
      fetcher()
        .then((fresh) => {
          contentCache.set(key, fresh, { profile, tags });
          contentCache.clearRevalidating(key);
        })
        .catch(() => {
          contentCache.clearRevalidating(key);
        });
    }
    return result.value as T;
  }

  // Cache miss — blocking fetch.
  const value = await fetcher();
  contentCache.set(key, value, { profile, tags });
  return value;
}

// --- Public cached query functions -----------------------------------------

/** List all published posts (cached under posts + homepage tags). */
export async function listPostsCached(options?: ListPostsOptions): Promise<PostSummary[]> {
  const key = `listPosts:${JSON.stringify(options ?? {})}`;
  return cachedQuery(key, tagsForPostIndex(), "short", () => contentSource.listPosts(options));
}

/** Get a single post by slug (cached with post, category, tag, and homepage tags). */
export async function getPostCached(slug: string): Promise<Post | null> {
  const key = `getPost:${slug}`;

  // Check cache first — if fresh or stale, return from cache (SWR handles
  // background refresh for stale entries).
  const cached = contentCache.get<Post>(key);
  if (cached.hasValue) {
    // If stale, trigger background refresh (same SWR pattern as cachedQuery).
    if (cached.isStale && contentCache.markRevalidating(key)) {
      contentSource
        .getPostBySlug(slug)
        .then((fresh) => {
          if (fresh) {
            contentCache.set(key, fresh, {
              profile: "default",
              tags: tagsForPost(fresh.slug, fresh.category, fresh.tags),
            });
          } else {
            // Post was deleted or unpublished — evict the cache entry.
            contentCache.delete(key);
          }
          contentCache.clearRevalidating(key);
        })
        .catch(() => {
          contentCache.clearRevalidating(key);
        });
    }
    return cached.value as Post;
  }

  // Cache miss — blocking fetch, then cache with full tags.
  const post = await contentSource.getPostBySlug(slug);
  if (post) {
    contentCache.set(key, post, {
      profile: "default",
      tags: tagsForPost(post.slug, post.category, post.tags),
    });
  }
  return post;
}

/** List posts in a category (cached under category:{slug} + categories). */
export async function getPostsByCategoryCached(category: string): Promise<PostSummary[]> {
  const key = `byCategory:${category}`;
  return cachedQuery(key, tagsForCategory(category), "short", () =>
    contentSource.getPostsByCategory(category),
  );
}

/** List posts with a tag (cached under tag:{slug} + tags). */
export async function getPostsByTagCached(tag: string): Promise<PostSummary[]> {
  const key = `byTag:${tag}`;
  return cachedQuery(key, tagsForTag(tag), "short", () => contentSource.getPostsByTag(tag));
}

/** Get all categories (cached under categories tag). */
export async function getAllCategoriesCached(): Promise<Category[]> {
  const key = "allCategories";
  return cachedQuery(key, tagsForCategories(), "long", () => contentSource.getAllCategories());
}

/** Get all tags (cached under tags tag). */
export async function getAllTagsCached(): Promise<Tag[]> {
  const key = "allTags";
  return cachedQuery(key, tagsForTags(), "long", () => contentSource.getAllTags());
}

/** Get a single author by slug (cached under author:{slug} + authors). */
export async function getAuthorCached(slug: string): Promise<Author | null> {
  const key = `author:${slug}`;
  return cachedQuery(key, tagsForAuthor(slug), "long", () => contentSource.getAuthor(slug));
}

/** Get all authors (cached under authors tag). */
export async function getAllAuthorsCached(): Promise<Author[]> {
  const key = "allAuthors";
  return cachedQuery(key, tagsForAuthors(), "long", () => contentSource.getAllAuthors());
}

/** Get latest posts for the homepage (cached under homepage + posts). */
export async function getHomepageLatestCached(limit = 3): Promise<PostSummary[]> {
  const key = `homepage:latest:${limit}`;
  return cachedQuery(key, tagsForHomepage(), "homepage", async () => {
    const all = await contentSource.listPosts();
    return all.slice(0, limit);
  });
}

/** Get featured posts for the homepage (cached under homepage + posts). */
export async function getHomepageFeaturedCached(limit = 3): Promise<PostSummary[]> {
  const key = `homepage:featured:${limit}`;
  return cachedQuery(key, tagsForHomepage(), "homepage", async () => {
    const all = await contentSource.listPosts({ featuredOnly: true });
    return all.slice(0, limit);
  });
}

/** Get latest posts for the homepage ticker (cached under homepage + posts). */
export async function getHomepageTickerCached(limit = 5): Promise<PostSummary[]> {
  const key = `homepage:ticker:${limit}`;
  return cachedQuery(key, tagsForHomepage(), "homepage", async () => {
    const all = await contentSource.listPosts();
    return all.slice(0, limit);
  });
}

/** Get posts for a category for the homepage (cached under category + homepage). */
export async function getHomepageCategoryCached(
  category: string,
  limit = 4,
): Promise<PostSummary[]> {
  const key = `homepage:category:${category}:${limit}`;
  return cachedQuery(
    key,
    [...tagsForCategory(category), ...tagsForHomepage()],
    "homepage",
    async () => {
      const all = await contentSource.getPostsByCategory(category);
      return all.slice(0, limit);
    },
  );
}

/** Get trending posts for the homepage sidebar (cached under homepage + posts). */
export async function getHomepageTrendingCached(limit = 5): Promise<PostSummary[]> {
  const key = `homepage:trending:${limit}`;
  return cachedQuery(key, tagsForHomepage(), "homepage", async () => {
    const all = await contentSource.listPosts();
    return all.slice(0, limit);
  });
}

/** Get recent posts by a specific author for the homepage spotlight. */
export async function getHomepageAuthorPostsCached(
  authorSlug: string,
  limit = 3,
): Promise<PostSummary[]> {
  const key = `homepage:author:${authorSlug}:${limit}`;
  return cachedQuery(
    key,
    [...tagsForAuthor(authorSlug), ...tagsForHomepage()],
    "homepage",
    async () => {
      const all = await contentSource.listPosts();
      return all.filter((p) => p.author === authorSlug).slice(0, limit);
    },
  );
}

/** Find all published posts sharing a translationKey (for i18n). */
export async function getPostsByTranslationKeyCached(
  translationKey: string,
): Promise<PostSummary[]> {
  const key = `translations:${translationKey}`;
  return cachedQuery(key, [POSTS_TAG], "long", () =>
    contentSource.getPostsByTranslationKey(translationKey),
  );
}
