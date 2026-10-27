import { useState, useCallback, useEffect, type FormEvent } from "react";
import { getSubscribedStatus, setSubscribedStatus } from "@/lib/newsletter/storage";
import { subscribeToNewsletter, getNewsletterProvider } from "@/lib/integrations/newsletter";
import { setVerifiedEmail, getVerifiedEmail } from "@/lib/cookies/identity";
import { track } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";

export const FooterNewsletterCTA = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    setIsSubscribed(getSubscribedStatus());
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      setStatus("loading");
      track("newsletter_cta_click", { source: "footer_banner" });

      const provider = getNewsletterProvider();

      try {
        const result = await subscribeToNewsletter({ email, placement: "footer_banner" });

        if (result.success) {
          setStatus("success");
          setSubscribedStatus(true);
          setIsSubscribed(true);
          setVerifiedEmail(email);
          setEmail("");
          track("newsletter_signup", { source: "footer_banner", url: siteConfig.url });
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    },
    [email],
  );

  if (isSubscribed && status !== "success") {
    return (
      <div className="mb-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">✓ You're subscribed to updates.</p>
        <button
          type="button"
          onClick={() => {
            setSubscribedStatus(false);
            setIsSubscribed(false);
          }}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          Change email
        </button>
      </div>
    );
  }

  return (
    <div className="relative mb-12 overflow-hidden rounded-2xl border border-border bg-card/75 p-6 sm:p-8 lg:p-10 shadow-sm backdrop-blur-md">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow mb-1">Newsletter</p>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">Stay in the loop</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Sharp AI/ML, Kubernetes, and DevSecOps coverage paired with desk-friendly fitness tips.
            No spam, unsubscribe anytime.
          </p>
        </div>
        <div className="w-full lg:max-w-md">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={status === "loading"}
              className="flex-1 rounded-xl border border-input bg-background/90 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              autoComplete="email"
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={status === "loading" || !email.trim()}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          {status === "error" && (
            <p className="mt-2 text-xs text-destructive" role="alert">
              Unable to subscribe. Please try again.
            </p>
          )}
          {status === "success" && (
            <p className="mt-2 text-xs text-primary font-medium" role="status">
              ✓ Thanks for subscribing!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FooterNewsletterCTA;
