import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { track } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
import { subscribeToNewsletter, getNewsletterProvider } from "@/lib/integrations/newsletter";
import { setVerifiedEmail, getVerifiedEmail } from "@/lib/cookies/identity";
import {
  getSubscribedStatus,
  setSubscribedStatus,
  recordArticleView,
  isNewsletterDismissed,
  setNewsletterDismissed,
  REQUIRED_ARTICLES_THRESHOLD,
} from "@/lib/newsletter/storage";

const SCROLL_THRESHOLD = 0.7; // 70% of page scrolled

/**
 * SlideInNewsletter — non-intrusive slide-in newsletter trigger.
 *
 * Gated by visitor engagement: only triggers after the visitor has viewed at least
 * REQUIRED_ARTICLES_THRESHOLD (default 3) unique articles, within article reading routes.
 * Suppressed if already subscribed or recently dismissed.
 */
export const SlideInNewsletter = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [articleCount, setArticleCount] = useState(0);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Route matching: only trigger on individual content articles (/blog/:slug or /articles/:slug)
  const match = location.pathname.match(/^\/(?:blog|articles)\/([^/]+)/);
  const isArticlePage = Boolean(match && match[1]);
  const currentSlug = match ? match[1] : null;

  useEffect(() => {
    setDismissed(isNewsletterDismissed());
    setSubscribed(getSubscribedStatus());
  }, []);

  // Track unique article pageviews
  useEffect(() => {
    if (currentSlug) {
      const updated = recordArticleView(currentSlug);
      setArticleCount(updated.length);
    }
  }, [currentSlug]);

  const isEligible =
    !dismissed &&
    !subscribed &&
    isArticlePage &&
    articleCount >= REQUIRED_ARTICLES_THRESHOLD;

  useEffect(() => {
    if (!isEligible) {
      setVisible(false);
      return;
    }

    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= SCROLL_THRESHOLD) {
        setVisible(true);
      }
    };

    // Exit intent trigger on desktop
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !visible) {
        setVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isEligible, visible]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    setNewsletterDismissed();
    track("newsletter_slide_in_dismiss");
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!email.trim()) return;

      setStatus("loading");
      track("newsletter_slide_in_click");

      const provider = getNewsletterProvider();

      try {
        const result = await subscribeToNewsletter({ email, placement: "slide_in" });

        if (result.success) {
          setStatus("success");
          setSubscribedStatus(true);
          setSubscribed(true);
          setVerifiedEmail(email);
          setNewsletterDismissed();
          track("newsletter_slide_in_signup", { url: siteConfig.url });
          // Auto-dismiss after 3 seconds
          setTimeout(() => handleDismiss(), 3000);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    },
    [email, handleDismiss],
  );

  if (!isEligible && !visible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-[150] w-[calc(100vw-2rem)] max-w-sm transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="rounded-xl border border-border bg-card p-5 shadow-xl">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="Dismiss newsletter popup"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {status === "success" ? (
          <div className="py-4 text-center" role="status" aria-live="polite">
            <p className="font-semibold text-foreground">You're subscribed!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Watch your inbox for the next issue.
            </p>
          </div>
        ) : (
          <>
            <p className="eyebrow mb-2">Newsletter</p>
            <h3 className="display-heading mb-1 text-lg text-foreground">Enjoying this article?</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Get the latest articles delivered straight to your inbox. No spam, unsubscribe
              anytime.
            </p>
            <form onSubmit={handleSubmit} className="space-y-2" noValidate>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={status === "loading"}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                autoComplete="email"
                aria-label="Email address"
              />
              <button
                type="submit"
                disabled={status === "loading" || !email.trim()}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {status === "error" && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                Something went wrong. Please try again.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SlideInNewsletter;
