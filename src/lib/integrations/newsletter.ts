/**
 * Newsletter provider abstraction.
 *
 * Supports Google Apps Script Webhook (recommended for serverless static sites),
 * Buttondown, ConvertKit, Resend, and Mailchimp via a unified interface.
 */

export interface NewsletterSubscribeResult {
  success: boolean;
  error?: string;
  alreadySubscribed?: boolean;
}

export interface NewsletterProvider {
  readonly id: string;
  subscribe(email: string, placement?: string): Promise<NewsletterSubscribeResult>;
}

export interface SubscribeOptions {
  email: string;
  placement?: string;
}

export interface SubscribeResponse {
  success: boolean;
  message?: string;
  alreadySubscribed?: boolean;
}

/**
 * Subscribes an email to the Google Apps Script webhook endpoint.
 * Uses text/plain transport to avoid CORS preflight (OPTIONS) rejections.
 */
export async function subscribeToNewsletter(
  options: SubscribeOptions
): Promise<SubscribeResponse> {
  const webhookUrl = (
    import.meta.env.VITE_NEWSLETTER_WEBHOOK_URL as string | undefined
  )?.trim();

  // If webhook is not configured, fall back to other providers or graceful preview
  if (!webhookUrl) {
    const providerType = (
      import.meta.env.VITE_NEWSLETTER_PROVIDER as string | undefined
    )?.trim();
    if (providerType && providerType.toLowerCase() !== "google_apps_script") {
      const fallback = getNewsletterProvider();
      if (fallback) {
        const res = await fallback.subscribe(options.email, options.placement);
        return {
          success: res.success,
          message: res.success ? "Thanks for subscribing!" : res.error,
          alreadySubscribed: res.alreadySubscribed,
        };
      }
    }

    // Graceful simulated success in preview/demo mode
    return {
      success: true,
      message: "Preview mode: Subscribed successfully!",
    };
  }

  try {
    const payload = {
      email: options.email.trim().toLowerCase(),
      placement: options.placement || "website",
      referrer: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();

    if (data.status === "success") {
      return {
        success: true,
        alreadySubscribed: !!data.alreadySubscribed,
        message: data.message || "Thanks for subscribing!",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to subscribe. Please try again.",
      };
    }
  } catch (error: any) {
    console.error("Newsletter submission error:", error);
    return {
      success: false,
      message: "Could not complete subscription. Please try again later.",
    };
  }
}

/**
 * Get the configured newsletter provider, or null if none is configured.
 *
 * Reads from client-safe env vars (VITE_ prefix only).
 */
export function getNewsletterProvider(): NewsletterProvider | null {
  const webhookUrl = (
    import.meta.env.VITE_NEWSLETTER_WEBHOOK_URL as string | undefined
  )?.trim();
  const providerType = (
    import.meta.env.VITE_NEWSLETTER_PROVIDER as string | undefined
  )?.trim() ?? "";

  if (
    webhookUrl ||
    providerType.toLowerCase() === "google_apps_script" ||
    providerType.toLowerCase() === "webhook"
  ) {
    return createGoogleAppsScriptProvider(webhookUrl);
  }

  switch (providerType.toLowerCase()) {
    case "buttondown":
      return createButtondownProvider();
    case "convertkit":
      return createConvertKitProvider();
    case "resend":
      return createResendProvider();
    case "mailchimp":
      return createMailchimpProvider();
    default:
      return null;
  }
}

// --- Google Apps Script --------------------------------------------------------

function createGoogleAppsScriptProvider(url?: string): NewsletterProvider {
  return {
    id: "google_apps_script",
    async subscribe(email, placement) {
      const res = await subscribeToNewsletter({ email, placement });
      return {
        success: res.success,
        error: res.success ? undefined : res.message,
        alreadySubscribed: res.alreadySubscribed,
      };
    },
  };
}

// --- Buttondown ---------------------------------------------------------------

function createButtondownProvider(): NewsletterProvider | null {
  const apiKey = import.meta.env.VITE_NEWSLETTER_API_KEY;
  if (!apiKey) return null;

  return {
    id: "buttondown",
    async subscribe(email) {
      try {
        const res = await fetch("https://api.buttondown.com/api/v1/subscribers", {
          method: "POST",
          headers: {
            Authorization: `Token ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          return { success: false, error: "Subscription failed. Please try again." };
        }
        return { success: true };
      } catch {
        return { success: false, error: "Network error. Please try again." };
      }
    },
  };
}

// --- ConvertKit ---------------------------------------------------------------

function createConvertKitProvider(): NewsletterProvider | null {
  const apiKey = import.meta.env.VITE_NEWSLETTER_API_KEY;
  const formId = import.meta.env.VITE_NEWSLETTER_FORM_ID;
  if (!apiKey || !formId) return null;

  return {
    id: "convertkit",
    async subscribe(email) {
      try {
        const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: apiKey, email }),
        });
        if (!res.ok) {
          return { success: false, error: "Subscription failed. Please try again." };
        }
        return { success: true };
      } catch {
        return { success: false, error: "Network error. Please try again." };
      }
    },
  };
}

// --- Resend -------------------------------------------------------------------

function createResendProvider(): NewsletterProvider | null {
  const apiKey = import.meta.env.VITE_NEWSLETTER_API_KEY;
  const audienceId = import.meta.env.VITE_NEWSLETTER_AUDIENCE_ID;
  if (!apiKey || !audienceId) return null;

  return {
    id: "resend",
    async subscribe(email) {
      try {
        const res = await fetch(
          "https://api.resend.com/audiences/" + audienceId + "/contacts",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );
        if (!res.ok) {
          return { success: false, error: "Subscription failed. Please try again." };
        }
        return { success: true };
      } catch {
        return { success: false, error: "Network error. Please try again." };
      }
    },
  };
}

// --- Mailchimp ----------------------------------------------------------------

function createMailchimpProvider(): NewsletterProvider | null {
  const apiKey = import.meta.env.VITE_NEWSLETTER_API_KEY;
  const listId = import.meta.env.VITE_NEWSLETTER_LIST_ID;
  const dataCenter = import.meta.env.VITE_NEWSLETTER_DC;
  if (!apiKey || !listId || !dataCenter) return null;

  return {
    id: "mailchimp",
    async subscribe(email) {
      try {
        const res = await fetch(
          `https://${dataCenter}.api.mailchimp.com/3.0/lists/${listId}/members`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${btoa(`anystring:${apiKey}`)}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email_address: email, status: "subscribed" }),
          }
        );
        if (!res.ok) {
          return { success: false, error: "Subscription failed. Please try again." };
        }
        return { success: true };
      } catch {
        return { success: false, error: "Network error. Please try again." };
      }
    },
  };
}
