import { splitFrontmatter } from "@/lib/content/frontmatter";

export interface ConferenceDetails {
  name: string;
  organizer: string;
  typicalDates: string;
  primaryLocation: string;
  format: string;
  estimatedPassCost: string;
}

export interface ConferenceGuide {
  slug: string;
  title: string;
  description: string;
  category: string;
  lastUpdated?: string;
  parentCalendarUrl?: string;
  conferenceDetails: ConferenceDetails;
  tags: string[];
  published: boolean;
}

export type ConferenceCategory =
  | "all"
  | "kubernetes-cloud"
  | "ai-ml"
  | "cloud-devops"
  | "cybersecurity"
  | "devex-open-source";

export interface CategoryOption {
  id: ConferenceCategory;
  label: string;
  tagMatches: string[];
}

export const CONFERENCE_CATEGORIES: CategoryOption[] = [
  { id: "all", label: "All Events", tagMatches: [] },
  {
    id: "kubernetes-cloud",
    label: "Kubernetes & Cloud-Native",
    tagMatches: ["kubernetes", "cncf", "platform-engineering"],
  },
  {
    id: "ai-ml",
    label: "AI, Hardware & Data",
    tagMatches: ["ai-ml", "gpu", "inference", "gemini-ai", "mlops", "data-engineering"],
  },
  {
    id: "cloud-devops",
    label: "Cloud Hyperscalers & DevOps",
    tagMatches: ["aws", "cloud", "gcp", "azure", "devops"],
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity & DevSecOps",
    tagMatches: ["security", "cybersecurity", "devsecops", "cloud-security"],
  },
  {
    id: "devex-open-source",
    label: "DevEx, Mobile & Open Source",
    tagMatches: ["devex", "copilot", "open-source", "web", "android", "community", "consumer-tech"],
  },
];

// Raw glob imports for conference MDX files
const conferenceFiles = import.meta.glob<string>(
  "/content/pages/resources/conferences/*.{mdx,md}",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

function slugFromKey(key: string): string {
  const fileName = key.split("/").pop() ?? key;
  return fileName.replace(/\.(mdx|md)$/, "");
}

function loadConferenceGuides(): ConferenceGuide[] {
  const guides: ConferenceGuide[] = [];

  for (const [key, raw] of Object.entries(conferenceFiles)) {
    const slug = slugFromKey(key);
    // Ignore index file if present
    if (slug === "index") continue;

    try {
      const { frontmatter } = splitFrontmatter(raw);

      const title = (frontmatter.title as string) ?? slug;
      const description = (frontmatter.description as string) ?? "";
      const category = (frontmatter.category as string) ?? "Conferences";
      const lastUpdated = frontmatter.lastUpdated as string | undefined;
      const parentCalendarUrl = (frontmatter.parentCalendarUrl as string) ?? "/resources/conferences";
      const tags = Array.isArray(frontmatter.tags)
        ? (frontmatter.tags as string[])
        : [];
      const published = frontmatter.published !== false;

      const detailsRaw = (frontmatter.conferenceDetails as Record<string, unknown>) ?? {};
      const conferenceDetails: ConferenceDetails = {
        name: (detailsRaw.name as string) ?? title.replace(/\s+Guide.*$/i, ""),
        organizer: (detailsRaw.organizer as string) ?? "ActiveNerds Curated",
        typicalDates: (detailsRaw.typicalDates as string) ?? "TBD",
        primaryLocation: (detailsRaw.primaryLocation as string) ?? "TBD",
        format: (detailsRaw.format as string) ?? "In-person",
        estimatedPassCost: (detailsRaw.estimatedPassCost as string) ?? "See official site",
      };

      if (!published) continue;

      guides.push({
        slug,
        title,
        description,
        category,
        lastUpdated,
        parentCalendarUrl,
        conferenceDetails,
        tags,
        published,
      });
    } catch (err) {
      console.error(`[conference-registry] Error parsing ${key}:`, err);
    }
  }

  // Sort by popular/flagship first, then alphabetically
  const flagshipOrder: Record<string, number> = {
    "aws-reinvent-las-vegas": 1,
    "kubecon-cloudnativecon-na": 2,
    "nvidia-gtc-global": 3,
    "google-cloud-next": 4,
    "kubecon-cloudnativecon-europe": 5,
    "black-hat-defcon-vegas": 6,
    "databricks-data-ai-summit": 7,
    "ces-las-vegas": 8,
    "github-universe-conference-guide": 9,
    "microsoft-ignite": 10,
    "google-io-conference-guide": 11,
    "ai4-enterprise-summit": 12,
    "fwd-cloudsec-summit": 13,
    "all-things-open": 14,
    "devopsdays-global-series": 15,
  };

  return guides.sort((a, b) => {
    const orderA = flagshipOrder[a.slug] ?? 99;
    const orderB = flagshipOrder[b.slug] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.conferenceDetails.name.localeCompare(b.conferenceDetails.name);
  });
}

let cachedGuides: ConferenceGuide[] | null = null;

export function getConferenceGuides(): ConferenceGuide[] {
  if (!cachedGuides) {
    cachedGuides = loadConferenceGuides();
  }
  return cachedGuides;
}

export function getConferenceGuideBySlug(slug: string): ConferenceGuide | undefined {
  return getConferenceGuides().find((g) => g.slug === slug);
}
