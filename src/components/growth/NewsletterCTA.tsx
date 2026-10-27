import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { track } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
import { subscribeToNewsletter } from "@/lib/integrations/newsletter";
import {
  getVerifiedEmail,
  setVerifiedEmail,
  isEmailVerified,
} from "@/lib/cookies/identity";

interface NewsletterCTAProps {
  /** Placement identifier for analytics tracking. */
  placement?: "article-footer" | "homepage" | "sidebar" | "coming-soon";
  /** Optional heading override. */
  heading?: string;
  /** Optional description override. */
  description?: string;
  /** Compact mode for sidebar placement. */
  compact?: boolean;
}

/**
 * Newsletter call-to-action component.
 *
 * Captures an email address for newsletter signup via Google Apps Script Webhook.
 * Includes honeypot spam protection, verified user cookie persistence,
 * and accessible feedback states.
 */
const NewsletterCTA = ({
  placement = "article-footer",
  heading,
  description,
  compact = false,
}: NewsletterCTAProps) => {
  const [email, setEmail] = useState(() => getVerifiedEmail() || "");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const isVerified = isEmailVerified(email);

  useEffect(() => {
    const handleIdentityChange = (e: Event) => {
      const custom = e as CustomEvent<{ email: string | null }>;
      if (custom.detail?.email && !email) {
        setEmail(custom.detail.email);
      }
    };
    window.addEventListener("verified-email-changed", handleIdentityChange);
    return () => {
      window.removeEventListener("verified-email-changed", handleIdentityChange);
    };
  }, [email]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Silent honeypot drop if filled by bots
      if (honeypot) {
        setStatus("success");
        setMessage("Thanks for subscribing!");
        return;
      }

      if (!email.trim()) return;

      setStatus("loading");
      setMessage("");

      track("newsletter_cta_click", { placement });

      try {
        const result = await subscribeToNewsletter({
          email: email.trim(),
          placement,
        });

        if (result.success) {
          setStatus("success");
          setMessage(
            result.alreadySubscribed
              ? "You're already on our list! We appreciate your continued support."
              : result.message || "Thanks for subscribing!"
          );
          track("newsletter_signup", { placement, url: siteConfig.url });
          setVerifiedEmail(email);
        } else {
          setStatus("error");
          setMessage(
            result.message || "Subscription failed. Please try again."
          );
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err.message || "Something went wrong. Please try again later."
        );
      }
    },
    [email, honeypot, placement]
  );

  if (status === "success") {
    return (
      <div
        className={`rounded-lg border border-accent/30 bg-accent/5 ${
          compact ? "p-5" : "p-8"
        } animate-in fade-in duration-300`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 text-accent">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="font-serif text-lg font-semibold text-foreground">
            You're Subscribed!
          </p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-border bg-card ${
        compact ? "p-5" : "p-8"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="eyebrow">Newsletter</p>
        {isVerified && (
          <span className="inline-flex items-center gap-1 rounded bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
            <ShieldCheck className="h-3 w-3" /> Verified Identity
          </span>
        )}
      </div>

      <h2
        className={`display-heading text-foreground ${
          compact ? "text-xl" : "text-2xl"
        }`}
      >
        {heading ?? "Tech deep dives + desk-friendly fitness tips."}
      </h2>
      <p
        className={`mt-2 text-muted-foreground ${
          compact ? "text-sm" : "text-base"
        }`}
      >
        {description ??
          "Practical AI/ML, K8s, and DevSecOps coverage with a side of micro-exercises and habit hacks — delivered weekly, no preachy wellness fluff."}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
        {/* Anti-spam honeypot */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="_gotcha"
            tabIndex={-1}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor={`newsletter-email-${placement}`} className="sr-only">
            Email address
          </label>
          <input
            id={`newsletter-email-${placement}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={status === "loading"}
            className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            aria-describedby={`newsletter-status-${placement}`}
            autoComplete="email"
          />
        </div>

        {status === "error" && message && (
          <div
            id={`newsletter-status-${placement}`}
            role="alert"
            className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Subscribing...
            </>
          ) : isVerified ? (
            "Instant Subscribe"
          ) : (
            "Subscribe"
          )}
        </button>
      </form>

      <p className="mt-3 text-xs text-muted-foreground">
        Unsubscribe anytime. We respect your privacy.
      </p>
    </div>
  );
};

export default NewsletterCTA;
