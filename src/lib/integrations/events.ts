import { clientEnv } from "@/lib/env";

export interface ConferenceEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  endDate?: string | null;
  location: string;
  linkUrl: string;
  category: string;
  daysLeft: number;
  isHappeningNow: boolean;
  countdownLabel: string;
  featured?: boolean;
}

/**
 * Curated fallback events tailored to ActiveNerds coverage areas.
 * Used when the Google Apps Script webhook is loading, offline, or unconfigured.
 */
export const CURATED_FALLBACK_EVENTS: Omit<ConferenceEvent, "daysLeft" | "isHappeningNow" | "countdownLabel">[] = [
  {
    id: "aws-reinvent-2026",
    name: "AWS re:Invent 2026",
    date: "2026-11-30",
    endDate: "2026-12-04",
    location: "Las Vegas, NV",
    linkUrl: "/resources/conferences/aws-reinvent-las-vegas",
    category: "Cloud & DevOps",
    featured: true,
  },
  {
    id: "ces-2027",
    name: "CES 2027 Las Vegas",
    date: "2027-01-05",
    endDate: "2027-01-08",
    location: "Las Vegas, NV",
    linkUrl: "https://www.ces.tech/",
    category: "Consumer Tech & AI",
    featured: true,
  },
  {
    id: "kubecon-na-2026",
    name: "KubeCon + CloudNativeCon NA",
    date: "2026-11-10",
    endDate: "2026-11-13",
    location: "Salt Lake City, UT",
    linkUrl: "/resources/conferences/kubecon-cloudnativecon-na",
    category: "Kubernetes & Cloud",
    featured: true,
  },
  {
    id: "nvidia-gtc-2027",
    name: "NVIDIA GTC Global 2027",
    date: "2027-03-15",
    endDate: "2027-03-19",
    location: "San Jose, CA",
    linkUrl: "/resources/conferences/nvidia-gtc-global",
    category: "AI & Hardware",
    featured: true,
  },
  {
    id: "google-cloud-next-2027",
    name: "Google Cloud Next 2027",
    date: "2027-04-20",
    endDate: "2027-04-22",
    location: "Las Vegas, NV",
    linkUrl: "/resources/conferences/google-cloud-next",
    category: "Cloud & AI",
    featured: false,
  },
  {
    id: "databricks-summit-2027",
    name: "Databricks Data + AI Summit",
    date: "2027-06-08",
    endDate: "2027-06-11",
    location: "San Francisco, CA",
    linkUrl: "/resources/conferences/databricks-data-ai-summit",
    category: "Data & AI",
    featured: false,
  },
  {
    id: "blackhat-defcon-2027",
    name: "Black Hat USA & DEF CON 35",
    date: "2027-08-07",
    endDate: "2027-08-12",
    location: "Las Vegas, NV",
    linkUrl: "/resources/conferences/black-hat-defcon-vegas",
    category: "Cybersecurity",
    featured: false,
  },
];

/**
 * Calculates the exact days remaining until an event date relative to today's local date.
 */
export function calculateEventCountdown(startDateStr: string, endDateStr?: string | null): {
  daysLeft: number;
  isHappeningNow: boolean;
  countdownLabel: string;
} {
  const now = new Date();
  // Normalize today to local midnight for day-accurate calculations
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const [sYear, sMonth, sDay] = startDateStr.split("-").map(Number);
  const startDate = new Date(sYear, sMonth - 1, sDay).getTime();

  const diffMs = startDate - today;
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let isHappeningNow = false;
  if (endDateStr) {
    const [eYear, eMonth, eDay] = endDateStr.split("-").map(Number);
    const endDate = new Date(eYear, eMonth - 1, eDay).getTime();
    if (today >= startDate && today <= endDate) {
      isHappeningNow = true;
    }
  } else if (daysLeft === 0) {
    isHappeningNow = true;
  }

  let countdownLabel = "";
  if (isHappeningNow) {
    countdownLabel = "Happening Now";
  } else if (daysLeft === 0) {
    countdownLabel = "Today";
  } else if (daysLeft === 1) {
    countdownLabel = "Tomorrow";
  } else if (daysLeft > 1) {
    countdownLabel = `${daysLeft} days left`;
  } else {
    countdownLabel = "Concluded";
  }

  return {
    daysLeft,
    isHappeningNow,
    countdownLabel,
  };
}

/**
 * Computes countdowns for a list of base events, filters past events, and sorts chronologically.
 */
export function processEventsList(
  rawList: Array<Omit<ConferenceEvent, "daysLeft" | "isHappeningNow" | "countdownLabel"> & Partial<ConferenceEvent>>
): ConferenceEvent[] {
  const processed: ConferenceEvent[] = [];

  for (const item of rawList) {
    if (!item.name || !item.date) continue;

    const { daysLeft, isHappeningNow, countdownLabel } = calculateEventCountdown(item.date, item.endDate);

    // Skip events that concluded in the past (unless happening right now)
    if (daysLeft < 0 && !isHappeningNow) {
      continue;
    }

    processed.push({
      id: item.id || `event-${item.date}-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: item.name,
      date: item.date,
      endDate: item.endDate || null,
      location: item.location || "Online",
      linkUrl: item.linkUrl || "/resources/conferences",
      category: item.category || "Technology",
      daysLeft,
      isHappeningNow,
      countdownLabel,
      featured: item.featured ?? false,
    });
  }

  // Sort: "Happening Now" events first, then nearest upcoming events
  processed.sort((a, b) => {
    if (a.isHappeningNow && !b.isHappeningNow) return -1;
    if (!a.isHappeningNow && b.isHappeningNow) return 1;
    return a.daysLeft - b.daysLeft;
  });

  return processed;
}

/**
 * Fetches events asynchronously from Google Apps Script Webhook.
 * Falls back to curated static events if the webhook URL is unconfigured or unavailable.
 */
export async function fetchUpcomingEvents(): Promise<ConferenceEvent[]> {
  const webhookUrl = clientEnv.VITE_EVENTS_WEBHOOK_URL?.trim();

  if (webhookUrl && webhookUrl.startsWith("http")) {
    try {
      const url = new URL(webhookUrl);
      url.searchParams.set("action", "get_events");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        redirect: "follow",
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.status === "success" && Array.isArray(data.events) && data.events.length > 0) {
          return processEventsList(data.events);
        }
      }
    } catch (err) {
      console.warn("[events] Could not load events from Google Apps Script webhook, using fallback data:", err);
    }
  }

  // Fallback to curated ActiveNerds conferences
  return processEventsList(CURATED_FALLBACK_EVENTS);
}
