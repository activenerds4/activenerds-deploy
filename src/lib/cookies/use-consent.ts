/**
 * useConsent — React hook for reading and updating consent state.
 *
 * Re-renders components when consent changes, so ConsentGate and other
 * consumers always reflect the latest user preferences.
 */

import { useState, useEffect, useCallback } from "react";
import {
  readConsent,
  acceptAllConsent,
  rejectNonEssentialConsent,
  saveCustomConsent,
  revokeConsent,
  hasConsented,
  type ConsentState,
} from "./consent";
import { getDefaultConsent } from "./consent";
import { cookieConfig, type CookieCategory } from "@/lib/config/cookies";

export interface UseConsentReturn {
  /** Current consent state (or default if no decision yet) */
  consent: ConsentState;
  /** Whether the user has made any consent decision */
  hasDecided: boolean;
  /** Accept all categories */
  acceptAll: () => void;
  /** Reject all non-essential categories */
  rejectNonEssential: () => void;
  /** Save custom preferences */
  saveCustom: (prefs: Record<CookieCategory, boolean>) => void;
  /** Revoke consent entirely */
  revoke: () => void;
  /** Check if a specific category has consent */
  hasCategory: (category: CookieCategory) => boolean;
  /** Open the preferences modal */
  openPreferences: () => void;
  /** Close the preferences modal */
  closePreferences: () => void;
  /** Whether the preferences modal is open */
  isPreferencesOpen: boolean;
}

let globalPreferencesOpen = false;
const preferencesListeners = new Set<(open: boolean) => void>();

function setGlobalPreferencesOpen(open: boolean) {
  globalPreferencesOpen = open;
  preferencesListeners.forEach((listener) => listener(open));
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(open ? "cookie-preferences-open" : "cookie-preferences-close")
    );
  }
}

export function useConsent(): UseConsentReturn {
  const [consent, setConsent] = useState<ConsentState>(() => readConsent() ?? getDefaultConsent());
  const [hasDecided, setHasDecided] = useState<boolean>(() => hasConsented());
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(globalPreferencesOpen);

  useEffect(() => {
    const consentHandler = (e: Event) => {
      const customEvent = e as CustomEvent<ConsentState>;
      if (customEvent.detail) {
        setConsent(customEvent.detail);
        setHasDecided(true);
      } else {
        setConsent(getDefaultConsent());
        setHasDecided(false);
      }
    };

    const prefListener = (open: boolean) => setIsPreferencesOpen(open);
    preferencesListeners.add(prefListener);

    const openHandler = () => setIsPreferencesOpen(true);
    const closeHandler = () => setIsPreferencesOpen(false);

    window.addEventListener("consent-change", consentHandler);
    window.addEventListener("cookie-preferences-open", openHandler);
    window.addEventListener("cookie-preferences-close", closeHandler);

    return () => {
      preferencesListeners.delete(prefListener);
      window.removeEventListener("consent-change", consentHandler);
      window.removeEventListener("cookie-preferences-open", openHandler);
      window.removeEventListener("cookie-preferences-close", closeHandler);
    };
  }, []);

  const acceptAll = useCallback(() => {
    const state = acceptAllConsent();
    setConsent(state);
    setHasDecided(true);
  }, []);

  const rejectNonEssential = useCallback(() => {
    const state = rejectNonEssentialConsent();
    setConsent(state);
    setHasDecided(true);
  }, []);

  const saveCustom = useCallback((prefs: Record<CookieCategory, boolean>) => {
    const state = saveCustomConsent(prefs);
    setConsent(state);
    setHasDecided(true);
  }, []);

  const revoke = useCallback(() => {
    revokeConsent();
    setConsent(getDefaultConsent());
    setHasDecided(false);
  }, []);

  const hasCategory = useCallback(
    (category: CookieCategory) => consent.categories[category] ?? false,
    [consent],
  );

  const openPreferences = useCallback(() => setGlobalPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setGlobalPreferencesOpen(false), []);

  return {
    consent,
    hasDecided,
    acceptAll,
    rejectNonEssential,
    saveCustom,
    revoke,
    hasCategory,
    openPreferences,
    closePreferences,
    isPreferencesOpen,
  };
}

export { cookieConfig };
