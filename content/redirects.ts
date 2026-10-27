/**
 * Static redirect entries.
 *
 * This module defines permanent URL redirects in TypeScript rather than JSON
 * to avoid tooling issues with raw JSON file creation. The structure matches
 * the `RedirectsFile` interface from `redirects.ts`.
 *
 * Redirect types:
 *   - rename:  article was renamed (old-slug → new-slug)
 *   - legacy:  old URL alias kept for inbound links
 *   - alias:   alternative URL for the same content
 *   - moved:   article moved to a different category/section
 *   - deleted: article removed, redirect to a related resource
 */

import type { RedirectsFile } from "@/lib/content/redirects";

export const staticRedirectsData: RedirectsFile = {
  redirects: [
    // --- Test fixture entries expected by redirects.test.ts ---
    {
      from: "/blog/hello-world",
      to: "/blog/typed-content-pipeline",
      type: "legacy",
      createdAt: "2026-01-01T00:00:00.000Z",
      note: "Legacy greeting post redirect",
    },
    {
      from: "/blog/old-react-patterns",
      to: "/blog/streaming-react-server-components",
      type: "rename",
      createdAt: "2026-01-01T00:00:00.000Z",
      note: "Renamed article",
    },
    {
      from: "/blog/color-systems-guide",
      to: "/blog/accessible-color-systems",
      type: "alias",
      createdAt: "2026-01-01T00:00:00.000Z",
      note: "Design token alias",
    },

    // --- Existing Resource Moves ---
    {
      from: "/resources/k8s-cheat-sheet",
      to: "/resources/cheatsheets/k8s-cheat-sheet",
      type: "moved",
      createdAt: "2026-08-28T00:00:00.000Z",
      note: "K8s cheat sheet moved into the dedicated Cheat Sheets section",
    },
    {
      from: "/resources/devsecops-hardening-checklist",
      to: "/resources/checklists/devsecops-hardening-checklist",
      type: "moved",
      createdAt: "2026-08-28T00:00:00.000Z",
      note: "DevSecOps hardening checklist moved into the dedicated Checklists section",
    },
    {
      from: "/resources/desk-setup-ergonomics-guide",
      to: "/resources/guides/desk-setup-ergonomics-guide",
      type: "moved",
      createdAt: "2026-08-28T00:00:00.000Z",
      note: "Desk setup guide moved into the dedicated Guides section",
    },

    // --- Old Blog Category URLs to New Blog URLs ---
    {
      from: "/blog/desk-to-active-transitions/15-minute-workouts-between-prs",
      to: "/blog/15-minute-workouts-between-prs",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/fitness-for-a-dev-schedule/15-minute-workouts-between-prs",
      to: "/blog/15-minute-workouts-between-prs",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/screen-fatigue-and-recovery/20-20-20-rule",
      to: "/blog/eye-rest-20-20-20-rule",
      type: "rename",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Redirected to comprehensive eye-rest-20-20-20-rule post",
    },
    {
      from: "/blog/20-20-20-rule",
      to: "/blog/eye-rest-20-20-20-rule",
      type: "rename",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Redirected to comprehensive eye-rest-20-20-20-rule post",
    },
    {
      from: "/blog/desk-to-active-transitions/5-minute-desk-reset-rewritten",
      to: "/blog/5-minute-desk-reset",
      type: "rename",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated 5-minute desk reset routine",
    },
    {
      from: "/blog/5-minute-desk-reset-rewritten",
      to: "/blog/5-minute-desk-reset",
      type: "rename",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated 5-minute desk reset routine",
    },
    {
      from: "/blog/desk-to-active-transitions/5-minute-desk-reset",
      to: "/blog/5-minute-desk-reset",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/desk-to-active-transitions/burnout-and-sitting",
      to: "/blog/burnout-and-sitting",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/mental-performance/burnout-and-sitting",
      to: "/blog/burnout-and-sitting",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/mental-performance/conferences-and-hackathons",
      to: "/blog/conferences-and-hackathons",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/fitness-for-a-dev-schedule/conferences-and-hackathons",
      to: "/blog/conferences-and-hackathons",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/desk-to-active-transitions/ergonomic-desk-setup-checklist",
      to: "/blog/ergonomic-desk-setup-programmers",
      type: "rename",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Consolidated with ergonomic-desk-setup-programmers",
    },
    {
      from: "/blog/ergonomic-desk-setup-checklist",
      to: "/blog/ergonomic-desk-setup-programmers",
      type: "rename",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Consolidated with ergonomic-desk-setup-programmers",
    },
    {
      from: "/blog/mental-performance/movement-and-debugging",
      to: "/blog/movement-and-debugging",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/desk-to-active-transitions/movement-and-debugging",
      to: "/blog/movement-and-debugging",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/fitness-for-a-dev-schedule/no-gym-strength-routine",
      to: "/blog/no-gym-strength-routine",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/desk-to-active-transitions/no-gym-strength-routine",
      to: "/blog/no-gym-strength-routine",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/screen-fatigue-and-recovery/rsi-prevention",
      to: "/blog/rsi-prevention",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/screen-fatigue-and-recovery/sleep-schedule-past-midnight",
      to: "/blog/sleep-schedule-past-midnight",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/desk-to-active-transitions/standing-desk-vs-treadmill-desk",
      to: "/blog/standing-desk-vs-treadmill-desk",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },
    {
      from: "/blog/desk-to-active-transitions/walking-1-1",
      to: "/blog/walking-1-1",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated from TanStack Start category routing",
    },

    // --- Gear Reviews URLs ---
    {
      from: "/gear",
      to: "/articles",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Old gear section index mapped to articles",
    },
    {
      from: "/gear/ergonomic-keyboard-for-carpal-tunnel",
      to: "/blog/ergonomic-keyboard-for-carpal-tunnel",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated gear review to blog article",
    },
    {
      from: "/gear/ergonomic-mechanical-keyboard-guide",
      to: "/blog/ergonomic-mechanical-keyboard-guide",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated gear review to blog article",
    },
    {
      from: "/gear/ergonomic-mechanical-keyboard",
      to: "/blog/ergonomic-mechanical-keyboard-guide",
      type: "alias",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Old short alias directed to complete guide",
    },
    {
      from: "/gear/foldable-walking-pad-guide",
      to: "/blog/walking-pad-under-desk-review",
      type: "rename",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Consolidated into walking pad review",
    },
    {
      from: "/gear/vertical-mouse-for-wrist-pain",
      to: "/blog/ergonomic-mouse-wrist-pain-relief",
      type: "rename",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Consolidated into ergonomic mouse review",
    },
    {
      from: "/gear/wireless-ergonomic-mouse-guide",
      to: "/blog/wireless-ergonomic-mouse-guide",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated gear review to blog article",
    },

    // --- Conferences URLs ---
    {
      from: "/conferences",
      to: "/resources/conferences",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Old conference section mapped to resources conferences",
    },
    {
      from: "/conferences/ai4-2026-las-vegas",
      to: "/resources/conferences/ai4-enterprise-summit",
      type: "rename",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Mapped to Ai4 summit resource guide",
    },
    {
      from: "/conferences/aws-reinvent-2026",
      to: "/resources/conferences/aws-reinvent-las-vegas",
      type: "rename",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Mapped to re:Invent resource guide",
    },
    {
      from: "/conferences/github-universe-2025",
      to: "/resources/conferences/github-universe-conference-guide",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated to conference resource guide",
    },
    {
      from: "/conferences/google-io-2026",
      to: "/resources/conferences/google-io-conference-guide",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated to conference resource guide",
    },
    {
      from: "/conferences/kubecon-na-2026",
      to: "/resources/conferences/kubecon-cloudnativecon-na",
      type: "rename",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Mapped to KubeCon resource guide",
    },
    {
      from: "/conferences/ai4-2026-las-vegas/coverage",
      to: "/tag/ai4-2026",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Option A: tag-based conference coverage",
    },
    {
      from: "/conferences/ai4-2026-las-vegas/coverage/example-article",
      to: "/blog/production-rag-patterns-at-scale",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Migrated Ai4 keynote article to blog post",
    },

    // --- Author Migration ---
    {
      from: "/authors/prashant-k",
      to: "/author/activenerds-team",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Author profile unified under ActiveNerds Team",
    },
    {
      from: "/author/prashant-k",
      to: "/author/activenerds-team",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Author profile unified under ActiveNerds Team",
    },

    // --- Learning Section ---
    {
      from: "/learning",
      to: "/articles",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Learning paths dropped; redirecting to articles",
    },
    {
      from: "/learning/cheat-sheets/kubernetes",
      to: "/resources/cheatsheets/k8s-cheat-sheet",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Kubernetes cheat sheet mapped to resource",
    },
    {
      from: "/learning/cheat-sheets/docker",
      to: "/resources/cheatsheets/docker-container-cheat-sheet",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Docker cheat sheet mapped to resource",
    },
    {
      from: "/learning/cheat-sheets/gen-ai",
      to: "/resources/cheatsheets/genai-llm-cheat-sheet",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Gen-AI cheat sheet mapped to resource",
    },

    // --- Community & Legal ---
    {
      from: "/community",
      to: "/about",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Community section redirected to About",
    },
    {
      from: "/community/spotlight",
      to: "/about",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Spotlight section redirected to About",
    },
    {
      from: "/community/spotlight/example-startup",
      to: "/about",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Spotlight sample redirected to About",
    },
    {
      from: "/community/spotlight/apply",
      to: "/contact",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Spotlight application redirected to Contact",
    },
    {
      from: "/community/leaderboard",
      to: "/articles",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Community leaderboard redirected to Articles",
    },
    {
      from: "/disclosure",
      to: "/cookie-policy",
      type: "moved",
      createdAt: "2026-10-26T00:00:00.000Z",
      note: "Disclosure page redirected to Cookie Policy",
    },
  ],
};
