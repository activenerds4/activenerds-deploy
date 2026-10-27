/** Known category slugs. Posts must reference one of these. */
export const KNOWN_CATEGORIES = [
  "ai-machine-learning",
  "containers-kubernetes",
  "fitness-wellness-tech",
  "devsecops-security",
  "gear-gadgets",
  "events-community",
  "platform-engineering-devops",
  "focus-productivity",
] as const;

/** Known tag slugs. Posts may only use tags from this list. */
export const KNOWN_TAGS = [
  "kubernetes",
  "mlops",
  "llms",
  "pytorch",
  "docker",
  "devsecops",
  "standing-desk",
  "desk-stretches",
  "habit-building",
  "ergonomics",
  "deep-work",
  "conferences",
  "fitness-trackers",
  "affiliate",
] as const;

export const WORDS_PER_MINUTE = 200;

/** Minimum reading time in minutes (never report 0). */
export const MIN_READING_TIME = 1;

/** Supported file extensions for content posts. */
export const CONTENT_EXTENSIONS = [".mdx", ".md"];
