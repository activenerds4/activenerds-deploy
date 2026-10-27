#!/usr/bin/env node
/**
 * Static SEO and Feed Generator
 *
 * Generates build-time static SEO assets into public/:
 *   - public/sitemap.xml
 *   - public/robots.txt
 *   - public/feed.xml (RSS 2.0)
 *   - public/atom.xml (Atom 1.0)
 *   - public/feed.json (JSON Feed 1.1)
 *   - public/llms.txt
 *   - public/llms-full.txt
 *
 * Usage:
 *   npx tsx scripts/generate-static-seo/script.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

if (typeof (process as unknown as { loadEnvFile?: () => void }).loadEnvFile === "function") {
  try {
    (process as unknown as { loadEnvFile: () => void }).loadEnvFile();
  } catch {}
}
import { splitFrontmatter, validateFrontmatter, toSummary, categoryName, tagName } from "../../src/lib/content/frontmatter";
import { slugFromPath } from "../../src/lib/content/git/paths";
import type { Author, Category, PostSummary, Tag } from "../../src/lib/content/types";
import { siteConfig } from "../../src/lib/site-config";
import { buildSitemapEntries, sitemapToXml } from "../../src/lib/seo/sitemap";
import { generateRobotsTxt } from "../../src/lib/seo/robots";
import { buildFeedItems, feedToXml } from "../../src/lib/seo/feed";
import { atomFeedToXml } from "../../src/lib/seo/atom-feed";
import { buildJsonFeed, jsonFeedToString } from "../../src/lib/seo/json-feed";
import { generateLlmsTxt, generateLlmsFullTxt } from "../../src/lib/seo/llms-txt";

const ROOT_DIR = process.cwd();
const POSTS_DIR = path.resolve(ROOT_DIR, "content/posts");
const AUTHORS_DIR = path.resolve(ROOT_DIR, "content/authors");
const PUBLIC_DIR = path.resolve(ROOT_DIR, "public");

function loadPosts(): Array<PostSummary & { body: string }> {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  const posts: Array<PostSummary & { body: string }> = [];

  for (const file of files) {
    const fullPath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const slug = slugFromPath(file);
    try {
      const parsed = splitFrontmatter(raw);
      const fm = validateFrontmatter(parsed.frontmatter, slug, fullPath);
      const summary = toSummary(slug, fm, parsed.body);
      posts.push({ ...summary, body: parsed.body });
    } catch (err) {
      console.warn(`[static-seo] Warning: Failed to parse post ${file}:`, (err as Error).message);
    }
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function loadAuthors(): Map<string, Author> {
  const authors = new Map<string, Author>();
  if (!fs.existsSync(AUTHORS_DIR)) return authors;
  const files = fs.readdirSync(AUTHORS_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  for (const file of files) {
    const fullPath = path.join(AUTHORS_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const slug = slugFromPath(file);
    try {
      const parsed = splitFrontmatter(raw);
      const fm = parsed.frontmatter as Record<string, unknown>;
      const socialRaw = (fm.social ?? {}) as Record<string, unknown>;
      authors.set(slug, {
        slug,
        name: String(fm.name ?? slug),
        bio: String(fm.bio ?? ""),
        avatar: String(fm.avatar ?? "/placeholder.svg"),
        role: typeof fm.role === "string" ? fm.role : undefined,
        social: {
          twitter: typeof socialRaw.twitter === "string" ? socialRaw.twitter : undefined,
          github: typeof socialRaw.github === "string" ? socialRaw.github : undefined,
          linkedin: typeof socialRaw.linkedin === "string" ? socialRaw.linkedin : undefined,
          website: typeof socialRaw.website === "string" ? socialRaw.website : undefined,
        },
      });
    } catch (err) {
      console.warn(`[static-seo] Warning: Failed to parse author ${file}:`, (err as Error).message);
    }
  }

  // Ensure fallback default author is registered
  if (!authors.has("activenerds-team")) {
    authors.set("activenerds-team", {
      slug: "activenerds-team",
      name: siteConfig.defaultAuthor.name,
      bio: "The institutional voice behind ActiveNerds.",
      avatar: "/logo.svg",
      role: "ActiveNerds Editorial Team",
      social: {
        website: siteConfig.url,
      },
    });
  }

  return authors;
}

function deriveTaxonomy(posts: PostSummary[]): { categories: Category[]; tags: Tag[] } {
  const now = Date.now();
  const published = posts.filter(
    (p) =>
      p.published &&
      (!p.status || p.status === "published") &&
      p.status !== "draft" &&
      p.status !== "scheduled" &&
      (!p.date || new Date(p.date).getTime() <= now),
  );
  const catSlugs = new Set(published.map((p) => p.category));
  const categories: Category[] = Array.from(catSlugs).map((slug) => ({
    slug,
    name: categoryName(slug),
  }));

  const tagCounts = new Map<string, number>();
  for (const post of published) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const tags: Tag[] = Array.from(tagCounts.entries())
    .map(([slug, count]) => ({ slug, name: tagName(slug), count }))
    .sort((a, b) => b.count - a.count);

  return { categories, tags };
}

function deriveTranslations(posts: PostSummary[]): Map<string, Array<{ locale: string; slug: string }>> {
  const map = new Map<string, Array<{ locale: string; slug: string }>>();
  for (const post of posts) {
    if (!post.translationKey) continue;
    const list = map.get(post.translationKey) ?? [];
    list.push({ locale: post.locale ?? "en", slug: post.slug });
    map.set(post.translationKey, list);
  }
  return map;
}

function main() {
  console.log("Generating static SEO & Feed files...");
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const allPosts = loadPosts();
  const now = Date.now();
  const livePosts = allPosts.filter((post) => {
    const pubTime = new Date(post.date).getTime();
    return (
      post.published !== false &&
      post.status !== "draft" &&
      post.status !== "scheduled" &&
      !isNaN(pubTime) &&
      pubTime <= now
    );
  });

  const authorsMap = loadAuthors();
  const authorsList = Array.from(authorsMap.values());
  const { categories, tags } = deriveTaxonomy(livePosts);
  const translationMap = deriveTranslations(livePosts);

  // 1. sitemap.xml
  const sitemapEntries = buildSitemapEntries({
    posts: livePosts,
    categories,
    tags,
    authors: authorsList,
    translationMap,
  });
  const sitemapXml = sitemapToXml(sitemapEntries);
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), sitemapXml, "utf-8");
  console.log(`  ✓ public/sitemap.xml (${sitemapEntries.length} URLs)`);

  // 2. robots.txt
  const robotsTxt = generateRobotsTxt();
  fs.writeFileSync(path.join(PUBLIC_DIR, "robots.txt"), robotsTxt, "utf-8");
  console.log("  ✓ public/robots.txt");

  // 3. feed.xml (RSS 2.0)
  const feedItems = buildFeedItems(livePosts, authorsMap);
  const feedXml = feedToXml(feedItems);
  fs.writeFileSync(path.join(PUBLIC_DIR, "feed.xml"), feedXml, "utf-8");
  console.log(`  ✓ public/feed.xml (${feedItems.length} items)`);

  // 4. atom.xml (Atom 1.0)
  const atomXml = atomFeedToXml(feedItems);
  fs.writeFileSync(path.join(PUBLIC_DIR, "atom.xml"), atomXml, "utf-8");
  console.log(`  ✓ public/atom.xml (${feedItems.length} items)`);

  // 5. feed.json (JSON Feed 1.1)
  const jsonFeed = buildJsonFeed(livePosts, authorsMap);
  const jsonFeedStr = jsonFeedToString(jsonFeed);
  fs.writeFileSync(path.join(PUBLIC_DIR, "feed.json"), jsonFeedStr, "utf-8");
  console.log(`  ✓ public/feed.json (${jsonFeed.items.length} items)`);

  // 6. llms.txt & llms-full.txt
  const llmsTxt = generateLlmsTxt();
  fs.writeFileSync(path.join(PUBLIC_DIR, "llms.txt"), llmsTxt, "utf-8");
  console.log("  ✓ public/llms.txt");

  const llmsFullTxt = generateLlmsFullTxt(livePosts, authorsMap, categories, tags);
  fs.writeFileSync(path.join(PUBLIC_DIR, "llms-full.txt"), llmsFullTxt, "utf-8");
  console.log("  ✓ public/llms-full.txt");

  console.log("Static SEO files generated successfully.");
}

main();
