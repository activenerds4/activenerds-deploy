/**
 * Unified Verified User Identity Management
 *
 * Persists the user's verified email address across a first-party cookie
 * (`an_verified_email`) and localStorage.
 *
 * Enables seamless cross-feature verification:
 * - Verified voters bypass the OTP verification step on subsequent polls.
 * - Subscribed newsletter readers bypass the poll OTP verification step.
 * - Voting transparently verifies the user for the newsletter.
 */

const COOKIE_NAME = "an_verified_email";
const STORAGE_KEY = "an_verified_email";
const COOKIE_EXPIRY_DAYS = 180; // 6 months

/**
 * Read a first-party cookie by name.
 */
function getRawCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`));
    if (!match) return null;
    return decodeURIComponent(match.split("=").slice(1).join("="));
  } catch {
    return null;
  }
}

/**
 * Set a secure first-party cookie.
 */
function setRawCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return null as unknown as void;
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const secure =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "; Secure"
        : "";
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure}`;
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Delete a first-party cookie.
 */
function deleteRawCookie(name: string): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  } catch {
    // Ignore
  }
}

/**
 * Retrieves the currently verified email address, checking cookie first,
 * then localStorage as a resilient fallback, keeping them synchronized.
 */
export function getVerifiedEmail(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const cookieVal = getRawCookie(COOKIE_NAME);
    if (cookieVal && cookieVal.includes("@")) {
      const normalized = cookieVal.trim().toLowerCase();
      // Keep localStorage in sync
      if (localStorage.getItem(STORAGE_KEY) !== normalized) {
        localStorage.setItem(STORAGE_KEY, normalized);
      }
      return normalized;
    }

    const storageVal = localStorage.getItem(STORAGE_KEY);
    if (storageVal && storageVal.includes("@")) {
      const normalized = storageVal.trim().toLowerCase();
      // Sync back to cookie
      setRawCookie(COOKIE_NAME, normalized, COOKIE_EXPIRY_DAYS);
      return normalized;
    }
  } catch {
    // Ignore errors
  }

  return null;
}

/**
 * Persists a verified email address to both cookie and localStorage,
 * and notifies other active components via a custom browser event.
 */
export function setVerifiedEmail(email: string): void {
  if (typeof window === "undefined") return;
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) return;

  try {
    setRawCookie(COOKIE_NAME, cleanEmail, COOKIE_EXPIRY_DAYS);
    localStorage.setItem(STORAGE_KEY, cleanEmail);

    // Notify other components (e.g. PollWidget, NewsletterCTA)
    window.dispatchEvent(
      new CustomEvent("verified-email-changed", {
        detail: { email: cleanEmail },
      })
    );
  } catch {
    // Ignore
  }
}

/**
 * Clears the verified email cookie and localStorage item.
 */
export function clearVerifiedEmail(): void {
  if (typeof window === "undefined") return;

  try {
    deleteRawCookie(COOKIE_NAME);
    localStorage.removeItem(STORAGE_KEY);

    window.dispatchEvent(
      new CustomEvent("verified-email-changed", {
        detail: { email: null },
      })
    );
  } catch {
    // Ignore
  }
}

/**
 * Checks if a specific email address is already verified on this browser.
 */
export function isEmailVerified(email: string): boolean {
  const verified = getVerifiedEmail();
  if (!verified || !email) return false;
  return verified === email.trim().toLowerCase();
}
