#!/usr/bin/env node
/**
 * Pre-build MDX compiler.
 *
 * Compiles all .mdx files in content/posts/ and content/authors/ into
 * standalone ES module .js files in a generated directory. These compiled
 * modules are then imported by the content source at runtime instead of
 * raw strings, eliminating the need for Blob URL runtime compilation.
 *
 * This script runs as part of the `prebuild` npm script, before `vite build`.
 *
 * Usage:
 *   npx tsx scripts/precompile-mdx/script.ts
 */

import { readdir, mkdir, writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { createLowlight } from "lowlight";
import bash from "highlight.js/lib/languages/bash";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import jsonLang from "highlight.js/lib/languages/json";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import python from "highlight.js/lib/languages/python";
import shell from "highlight.js/lib/languages/shell";
import matter from "gray-matter";

// Subset of highlight.js languages to avoid bundling all 190+ languages.
const lowlight = createLowlight();
lowlight.register("bash", bash);
lowlight.register("typescript", typescript);
lowlight.register("javascript", javascript);
lowlight.register("json", jsonLang);
lowlight.register("css", css);
lowlight.register("html", xml);
lowlight.register("xml", xml);
lowlight.register("python", python);
lowlight.register("shell", shell);
lowlight.register("sh", shell);

const rehypeHighlightConfigured = [rehypeHighlight, { lowlight }];

const CONTENT_DIR = path.resolve(process.cwd(), "content");
const POSTS_DIR = path.join(CONTENT_DIR, "posts");
const AUTHORS_DIR = path.join(CONTENT_DIR, "authors");
const CHECKLISTS_DIR = path.join(CONTENT_DIR, "pages", "resources", "checklists");
const GUIDES_DIR = path.join(CONTENT_DIR, "pages", "resources", "guides");
const CONFERENCES_DIR = path.join(CONTENT_DIR, "pages", "resources", "conferences");
const LEARNING_DIR = path.join(CONTENT_DIR, "learning");
const OUTPUT_DIR = path.resolve(process.cwd(), "src/lib/content/__compiled__");

interface CompileEntry {
  /** Source path (e.g., content/posts/my-post.mdx) */
  source: string;
  /** Output path (e.g., src/lib/content/__compiled__/posts/my-post.js) */
  output: string;
  /** Slug derived from filename */
  slug: string;
}

async function discoverFiles(dir: string, subdir: string): Promise<CompileEntry[]> {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile() && (e.name.endsWith(".mdx") || e.name.endsWith(".md")));

  return files.map((f) => {
    const slug = f.name.replace(/\.(mdx|md)$/, "");
    return {
      source: path.join(dir, f.name),
      output: path.join(OUTPUT_DIR, subdir, `${slug}.js`),
      slug,
    };
  });
}

async function compileFile(entry: CompileEntry): Promise<void> {
  const raw = await readFile(entry.source, "utf-8");

  // Strip frontmatter — the compiled module should only contain the body.
  const parsed = matter(raw);
  const body = parsed.content.trim();

  // Compile MDX to a JS module string
  const compiled = await compile(body, {
    format: "mdx",
    jsxRuntime: "automatic",
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeHighlightConfigured as any],
  });

  const code = String(compiled);

  // Ensure output directory exists
  await mkdir(path.dirname(entry.output), { recursive: true });

  // Write the compiled module
  await writeFile(entry.output, code, "utf-8");
}

async function main() {
  console.log("[precompile-mdx] Discovering MDX files...");

  const postEntries = await discoverFiles(POSTS_DIR, "posts");
  const authorEntries = await discoverFiles(AUTHORS_DIR, "authors");
  const checklistEntries = await discoverFiles(CHECKLISTS_DIR, "pages/resources/checklists");
  const guideEntries = await discoverFiles(GUIDES_DIR, "pages/resources/guides");
  const conferenceEntries = await discoverFiles(CONFERENCES_DIR, "pages/resources/conferences");

  const learningPaths = ["docker", "kubernetes", "gen-ai", "agentic-ai"];
  const learningEntries: CompileEntry[] = [];
  for (const lp of learningPaths) {
    const entries = await discoverFiles(path.join(LEARNING_DIR, lp), `learning/${lp}`);
    learningEntries.push(...entries);
  }

  const allEntries = [
    ...postEntries,
    ...authorEntries,
    ...checklistEntries,
    ...guideEntries,
    ...conferenceEntries,
    ...learningEntries,
  ];

  console.log(
    `[precompile-mdx] Found ${postEntries.length} posts, ${authorEntries.length} authors, ${learningEntries.length} learning modules, ${checklistEntries.length} checklists, ${guideEntries.length} guides, ${conferenceEntries.length} conference guides`,
  );

  // Ensure output directories exist
  await mkdir(path.join(OUTPUT_DIR, "posts"), { recursive: true });
  await mkdir(path.join(OUTPUT_DIR, "authors"), { recursive: true });
  await mkdir(path.join(OUTPUT_DIR, "pages/resources/checklists"), { recursive: true });
  await mkdir(path.join(OUTPUT_DIR, "pages/resources/guides"), { recursive: true });
  await mkdir(path.join(OUTPUT_DIR, "pages/resources/conferences"), { recursive: true });
  for (const lp of learningPaths) {
    await mkdir(path.join(OUTPUT_DIR, "learning", lp), { recursive: true });
  }

  let success = 0;
  let failed = 0;

  for (const entry of allEntries) {
    try {
      await compileFile(entry);
      success++;
    } catch (err) {
      console.error(`[precompile-mdx] Failed to compile ${entry.source}:`, err);
      failed++;
    }
  }

  console.log(`[precompile-mdx] Compiled ${success}/${allEntries.length} files (${failed} failed)`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[precompile-mdx] Fatal error:", err);
  process.exit(1);
});
