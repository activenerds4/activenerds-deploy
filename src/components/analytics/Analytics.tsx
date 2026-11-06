import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  loadAnalyticsConfig,
  setAnalyticsProvider,
  setAnalyticsConsent,
  isAnalyticsConsentGranted,
  trackPageView,
  NoopAnalyticsProvider,
  ANALYTICS_CONSENT_STORAGE_KEY,
  type AnalyticsProvider,
  type AnalyticsConfig,
} from "@/lib/analytics";
import { readConsent } from "@/lib/cookies/consent";

/**
 * Analytics bootstrap component.
 *
 * Mounted once in the app shell (SiteShell). Responsibilities:
 * 1. Synchronously initialize the provider and dataLayer buffer on mount (eliminating race conditions).
 * 2. Configure Google Consent Mode v2 with 4 mandatory storage permissions.
 * 3. Invoke standard GA4 config (without send_page_view: false) to restore native telemetry.
 * 4. Deduplicate route changes via an isInitialMount guard.
 */
const Analytics = () => {
  const location = useLocation();
  const initialized = useRef(false);

  // Initialize the provider and dataLayer immediately on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const config = loadAnalyticsConfig();
    if (!config) {
      setAnalyticsProvider(new NoopAnalyticsProvider());
      return;
    }

    // Apply consent mode: check both cookie consent store and legacy storage key
    const isOptIn = config.consentMode === "opt-in";
    if (isOptIn) {
      const cookieConsent = readConsent();
      const hasPriorConsent =
        cookieConsent?.categories?.analytics ??
        (() => {
          try {
            return localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) === "granted";
          } catch {
            return false;
          }
        })();
      setAnalyticsConsent(hasPriorConsent);
    } else {
      setAnalyticsConsent(true);
    }

    try {
      const provider = createProvider(config);
      setAnalyticsProvider(provider);
    } catch {
      setAnalyticsProvider(new NoopAnalyticsProvider());
    }

    // Handle real-time consent updates (Accept All / Reject Non-Essential / Custom Preferences)
    const handleConsentChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const state = customEvent.detail;
      const isGranted = Boolean(state?.categories?.analytics);
      setAnalyticsConsent(isGranted);

      if (typeof window !== "undefined") {
        const w = window as unknown as { gtag?: (...args: unknown[]) => void };
        if (w.gtag) {
          w.gtag("consent", "update", {
            analytics_storage: isGranted ? "granted" : "denied",
            ad_storage: isGranted ? "granted" : "denied",
            ad_user_data: isGranted ? "granted" : "denied",
            ad_personalization: isGranted ? "granted" : "denied",
          });
        }
      }

      // If granted and using GA, ensure script tag is loaded
      if (isGranted && config.gaMeasurementId) {
        const gtagSrc = `https://www.googletagmanager.com/gtag/js?id=${config.gaMeasurementId.trim()}`;
        injectScript(gtagSrc, { async: "true" });
      }
    };

    window.addEventListener("consent-change", handleConsentChange);
    return () => {
      window.removeEventListener("consent-change", handleConsentChange);
    };
  }, []);

  // Track page views on subsequent SPA route changes (skip initial mount to avoid duplicate beacons)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    trackPageView(location.pathname + location.search, {
      path: location.pathname,
      search: location.search,
      title: typeof document !== "undefined" ? document.title : "",
    });
  }, [location.pathname, location.search]);

  return null;
};

/**
 * Create an analytics provider from configuration.
 */
function createProvider(config: AnalyticsConfig): AnalyticsProvider {
  const providerType = String(config.provider).toLowerCase();

  if (
    providerType === "ga4" ||
    providerType === "ga" ||
    providerType === "both" ||
    providerType === "dual"
  ) {
    return createGaProvider(config);
  }

  if (providerType === "plausible") {
    return createPlausibleProvider(config);
  }

  if (providerType === "fathom") {
    return createFathomProvider(config);
  }

  if (providerType === "posthog") {
    return createPostHogProvider(config);
  }

  return new NoopAnalyticsProvider();
}

// --- Google Analytics 4 (GA4) ------------------------------------------------

function createGaProvider(config: AnalyticsConfig): AnalyticsProvider {
  if (!config.gaMeasurementId) return new NoopAnalyticsProvider();

  const measurementId = config.gaMeasurementId.trim();

  if (typeof window !== "undefined") {
    const w = window as unknown as {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };
    w.dataLayer = w.dataLayer || [];
    if (!w.gtag) {
      w.gtag = function () {
        // Strict Arguments object required by gtag.js internal parser
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer!.push(arguments);
      };
    }
    w.gtag("js", new Date());

    // Set Google Consent Mode v2 default with all 4 mandatory parameters
    const isOptIn = config.consentMode === "opt-in";
    const currentConsent = isOptIn ? isAnalyticsConsentGranted() : true;
    w.gtag("consent", "default", {
      analytics_storage: currentConsent ? "granted" : "denied",
      ad_storage: currentConsent ? "granted" : "denied",
      ad_user_data: currentConsent ? "granted" : "denied",
      ad_personalization: currentConsent ? "granted" : "denied",
    });

    // GA4 config with send_page_view: false to prevent sending hits before or without consent
    w.gtag("config", measurementId, {
      send_page_view: false,
    });
  }

  // Only inject the gtag.js script if affirmative consent is already granted
  const isOptIn = config.consentMode === "opt-in";
  const currentConsent = isOptIn ? isAnalyticsConsentGranted() : true;
  if (currentConsent) {
    const gtagSrc = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    injectScript(gtagSrc, { async: "true" });
  }

  return {
    id: "ga",
    track(event, properties) {
      if (!isAnalyticsConsentGranted()) return;
      try {
        const w = window as unknown as { gtag?: (...args: unknown[]) => void };
        w.gtag?.("event", event, properties);
      } catch {
        // non-throwing
      }
    },
    trackPageView(path, properties) {
      if (!isAnalyticsConsentGranted()) return;
      try {
        const w = window as unknown as { gtag?: (...args: unknown[]) => void };
        w.gtag?.("event", "page_view", {
          page_path: path,
          ...properties,
        });
      } catch {
        // non-throwing
      }
    },
  };
}

// --- Plausible ---------------------------------------------------------------

function createPlausibleProvider(config: AnalyticsConfig): AnalyticsProvider {
  if (!config.plausibleDomain) return new NoopAnalyticsProvider();

  const src = config.plausibleSrc ?? "https://plausible.io/js/script.tagged-events.js";
  injectScript(src, {
    "data-domain": config.plausibleDomain,
    defer: "true",
  });

  return {
    id: "plausible",
    track(event, properties) {
      try {
        (
          window as unknown as { plausible?: (event: string, opts?: unknown) => void }
        ).plausible?.(event, { props: properties });
      } catch {
        // non-throwing
      }
    },
    trackPageView(path) {
      try {
        (
          window as unknown as { plausible?: (event: string, opts?: unknown) => void }
        ).plausible?.("pageview", { u: path });
      } catch {
        // non-throwing
      }
    },
  };
}

// --- Fathom ------------------------------------------------------------------

function createFathomProvider(config: AnalyticsConfig): AnalyticsProvider {
  if (!config.fathomSiteId) return new NoopAnalyticsProvider();

  injectScript("https://cdn.usefathom.com/script.js", {
    "data-site": config.fathomSiteId,
    defer: "true",
  });

  return {
    id: "fathom",
    track(event, properties) {
      try {
        (
          window as unknown as { fathom?: { trackEvent?: (...args: unknown[]) => void } }
        ).fathom?.trackEvent?.(event, properties);
      } catch {
        // non-throwing
      }
    },
    trackPageView() {
      // Fathom tracks pageviews automatically via the script.
    },
  };
}

// --- PostHog ------------------------------------------------------------------

function createPostHogProvider(_config: AnalyticsConfig): AnalyticsProvider {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  if (!apiKey) return new NoopAnalyticsProvider();

  injectScript("https://app.posthog.com/arrays.js", {
    "data-api-key": apiKey,
    defer: "true",
  });

  return {
    id: "posthog",
    track(event, properties) {
      try {
        (
          window as unknown as { posthog?: { capture?: (...args: unknown[]) => void } }
        ).posthog?.capture?.(event, properties);
      } catch {
        // non-throwing
      }
    },
    trackPageView(path) {
      try {
        (
          window as unknown as { posthog?: { capture?: (...args: unknown[]) => void } }
        ).posthog?.capture?.("$pageview", { $current_url: path });
      } catch {
        // non-throwing
      }
    },
  };
}

// --- Helper ------------------------------------------------------------------

function injectScript(src: string, attrs: Record<string, string> = {}): void {
  if (typeof document === "undefined") return;
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) return;

  const script = document.createElement("script");
  script.src = src;
  for (const [key, value] of Object.entries(attrs)) {
    script.setAttribute(key, value);
  }
  document.head.appendChild(script);
}

export default Analytics;
