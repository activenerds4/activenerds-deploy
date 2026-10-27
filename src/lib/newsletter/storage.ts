/**
 * Centralized Newsletter & Engagement LocalStorage Store.
 *
 * Encapsulates visitor interaction tracking, article view thresholds,
 * dismissal TTL, and subscription state with SSR and private-browsing safety.
 */

export const NEWSLETTER_STORAGE_KEYS = {
  DISMISSED: "activenerds-newsletter-dismissed",
  SUBSCRIBED: "activenerds-newsletter-subscribed",
  ARTICLES_VIEWED: "activenerds-articles-viewed",
} as const;

export const REQUIRED_ARTICLES_THRESHOLD = 3;

/** Check whether user has already subscribed */
export function getSubscribedStatus(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(NEWSLETTER_STORAGE_KEYS.SUBSCRIBED) === "true";
  } catch {
    return false;
  }
}

/** Set or clear subscription status */
export function setSubscribedStatus(subscribed = true): void {
  if (typeof window === "undefined") return;
  try {
    if (subscribed) {
      localStorage.setItem(NEWSLETTER_STORAGE_KEYS.SUBSCRIBED, "true");
    } else {
      localStorage.removeItem(NEWSLETTER_STORAGE_KEYS.SUBSCRIBED);
    }
  } catch {
    // Graceful fallback for quota or private mode errors
  }
}

/** Get list of unique article slugs viewed by the visitor */
export function getViewedArticles(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NEWSLETTER_STORAGE_KEYS.ARTICLES_VIEWED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Record an article view and return updated list of viewed slugs */
export function recordArticleView(slug: string): string[] {
  if (!slug || typeof window === "undefined") return getViewedArticles();
  try {
    const current = getViewedArticles();
    if (!current.includes(slug)) {
      const updated = [...current, slug];
      localStorage.setItem(NEWSLETTER_STORAGE_KEYS.ARTICLES_VIEWED, JSON.stringify(updated));
      return updated;
    }
    return current;
  } catch {
    return [];
  }
}

/** Check whether newsletter was dismissed within maxAgeDays (default 7 days) */
export function isNewsletterDismissed(maxAgeDays = 7): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(NEWSLETTER_STORAGE_KEYS.DISMISSED);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return Boolean(
      parsed.timestamp && Date.now() - parsed.timestamp < maxAgeDays * 24 * 60 * 60 * 1000,
    );
  } catch {
    return false;
  }
}

/** Record newsletter dismissal timestamp */
export function setNewsletterDismissed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      NEWSLETTER_STORAGE_KEYS.DISMISSED,
      JSON.stringify({ timestamp: Date.now() }),
    );
  } catch {
    // Graceful fallback
  }
}
