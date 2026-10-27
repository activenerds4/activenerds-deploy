import { clientEnv, serverEnv } from "./env";

/**
 * Central, typed site configuration.
 *
 * Deployment-specific repository values come from environment variables; all
 * other values are static defaults defined here. This is the single source of
 * truth consumed by SEO helpers, the layout, and (later) the content pipeline.
 */

export interface SocialProfiles {
  twitter: string;
  github: string;
  linkedin: string;
}

export interface SiteConfig {
  /** Site name. */
  name: string;
  /** Public site URL with no trailing slash. */
  url: string;
  /** Short site description used for SEO and OG metadata. */
  description: string;
  /** Default locale (BCP-47). */
  defaultLocale: string;
  /** Default author / site publisher. */
  defaultAuthor: {
    name: string;
    slug?: string;
    role?: string;
    url: string;
  };
  /** Social profile URLs. */
  social: SocialProfiles;
  /** Absolute URL of the default Open Graph image. */
  defaultOgImage: string;
  /** Content repository configuration. */
  content: {
    /** Repository provider, e.g. "github" or "gitlab". */
    provider: string;
    /** Repository owner (user or org). */
    owner: string;
    /** Repository name. */
    name: string;
    /** Branch to read content from. */
    branch: string;
    /** Path inside the repo where content lives. */
    path: string;
    /**
     * Content source mode: "local" reads bundled MDX; "git" fetches from the
     * repository provider at runtime (no rebuild needed for content changes).
     */
    source: "local" | "git";
  };
}

export const siteConfig: SiteConfig = {
  name: "ActiveNerds",
  url: clientEnv.VITE_SITE_URL,
  description:
    "ActiveNerds is the go-to destination for AI/ML, Kubernetes, and DevSecOps professionals — sharp technical coverage woven with genuinely useful, non-preachy fitness and wellness content for desk-bound tech pros.",
  defaultLocale: "en-US",
  defaultAuthor: {
    name: "ActiveNerds Team",
    slug: "activenerds-team",
    role: "ActiveNerds Editorial Team",
    url: clientEnv.VITE_SITE_URL,
  },
  social: {
    twitter: "https://twitter.com/activenerds",
    github: "https://github.com/activenerds",
    linkedin: "https://www.linkedin.com/company/activenerds",
  },
  defaultOgImage: clientEnv.VITE_DEFAULT_OG_IMAGE,
  content: {
    provider: serverEnv?.CONTENT_REPO_PROVIDER ?? "github",
    owner: serverEnv?.CONTENT_REPO_OWNER ?? "my-org",
    name: serverEnv?.CONTENT_REPO_NAME ?? "my-blog-content",
    branch: serverEnv?.CONTENT_REPO_BRANCH ?? "main",
    path: serverEnv?.CONTENT_REPO_PATH ?? "posts",
    source: (serverEnv?.CONTENT_SOURCE?.toLowerCase() as "local" | "git") ?? "local",
  },
};
