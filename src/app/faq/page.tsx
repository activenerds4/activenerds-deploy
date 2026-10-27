import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/site-config";

interface FAQItem {
  question: string;
  answer: string;
  category: "General" | "Editorial & Content" | "Interactive Tools" | "Ergonomics & Wellness" | "Privacy & Technical";
}

const faqData: FAQItem[] = [
  // ── General ───────────────────────────────────────────────────────────────
  {
    category: "General",
    question: "What is ActiveNerds?",
    answer:
      "ActiveNerds is an engineering publication and developer desk wellness hub. We deliver rigorous technical guides across DevSecOps, Kubernetes, Cloud Infrastructure, and AI/ML, combined with actionable, science-backed ergonomics and active health strategies tailored for desk-bound engineers.",
  },
  {
    category: "General",
    question: "Do I need to create an account to access the guides or tools?",
    answer:
      "No. Everything on ActiveNerds—including all articles, architectural blueprints, interactive engineering calculators, and desk wellness timers—is 100% free and open to everyone without registration, accounts, or paywalls.",
  },
  {
    category: "General",
    question: "How can I stay updated with new articles, tools, and releases?",
    answer:
      "You can subscribe to our weekly newsletter via the subscription box on the site or subscribe to our syndication feeds in your favorite reader: RSS (/feed.xml), Atom (/atom.xml), and JSON Feed (/feed.json).",
  },
  {
    category: "General",
    question: "What is the live Tech Events Ticker in the navigation header?",
    answer:
      "Our header event ticker tracks live countdowns to premier global technology, cloud, AI, and developer conferences (such as CES, KubeCon, AWS re:Invent, Google Cloud Next, and RSA Conference). Click the dropdown on the ticker to view full dates, venues, and city schedules.",
  },

  // ── Editorial & Content ───────────────────────────────────────────────────
  {
    category: "Editorial & Content",
    question: "What technical topics does ActiveNerds cover?",
    answer:
      "Our editorial coverage focuses on four core pillars: Platform Engineering & DevSecOps (CI/CD, Terraform/OpenTofu, zero-trust container security), Kubernetes & Cloud Architecture (zero-downtime blue-green rollouts, crashloop diagnostics, resource quotas), Artificial Intelligence & ML Systems (LLM serving, GPU hardware sizing, embeddings, structured outputs), and Developer Ergonomics & Health.",
  },
  {
    category: "Editorial & Content",
    question: "Who writes and reviews the articles on ActiveNerds?",
    answer:
      "All content is authored and peer-reviewed by the ActiveNerds Editorial Team—experienced platform architects, cloud engineers, and developer health advocates. We prioritize battle-tested code patterns, verifiable production benchmarks, and clear tradeoff analysis over marketing buzz.",
  },
  {
    category: "Editorial & Content",
    question: "Can I contribute an article or suggest a technical guide?",
    answer:
      "Yes! We welcome suggestions, technical corrections, and collaborative article proposals from fellow practitioners. Please reach out through our Contact page with your topic proposal and outline.",
  },

  // ── Interactive Tools ─────────────────────────────────────────────────────
  {
    category: "Interactive Tools",
    question: "Are the interactive engineering calculators and tools free to use?",
    answer:
      "Yes, all interactive developer and ergonomics utilities on ActiveNerds are completely free with zero usage caps or hidden fees.",
  },
  {
    category: "Interactive Tools",
    question: "Does ActiveNerds store, log, or transmit my tool inputs or code snippets?",
    answer:
      "No. All utilities—such as the Kubernetes Manifest Validator, AWS IAM Least-Privilege Scoper, NetworkPolicy Generator, and Structured Output Schema Generator—execute 100% client-side in your browser. No code snippets, YAML configurations, cloud credentials, or prompt templates are ever uploaded to remote servers.",
  },
  {
    category: "Interactive Tools",
    question: "What developer utilities are currently available?",
    answer:
      "Our developer tool suite includes the K8s Manifest Validator, NetworkPolicy Visualizer, K8s Exit Code Diagnostics, CloudWatch & Linux Cron Schedule Simulator, AWS IAM Least-Privilege Scoper, GPU Training Run Cost Estimator, LLM VRAM & Hardware Sizer, and Structured Output Schema Generator.",
  },

  // ── Ergonomics & Wellness ─────────────────────────────────────────────────
  {
    category: "Ergonomics & Wellness",
    question: "Why does a technical engineering publication include desk wellness tools?",
    answer:
      "Software engineers and infrastructure operators often spend 8 to 12 hours daily seated at workstations under high cognitive intensity. Repetitive strain injury (RSI), cervical spine compression, posture fatigue, and digital eye strain are major occupational risks. ActiveNerds bridges deep technical expertise with sustainable physical health.",
  },
  {
    category: "Ergonomics & Wellness",
    question: "Which ergonomics timers and wellness utilities can I use right now?",
    answer:
      "You can access the Desk Stretch Timer (customizable work-movement interval pacer), 20-20-20 Eye Health Timer, Focus Session Tracker (deep work blocks with movement reminders), Sit-Stand Duty Cycle Pacer, and Desk & Monitor Ergonomic Height Calculator.",
  },

  // ── Privacy & Technical ───────────────────────────────────────────────────
  {
    category: "Privacy & Technical",
    question: "How does ActiveNerds handle privacy and analytics cookies?",
    answer:
      "We adhere to strict privacy-first principles. Essential cookies are used solely for theme preferences and core site operations. Telemetry via Google Analytics 4 strictly respects Google Consent Mode v2 and requires explicit user opt-in through our cookie banner. You can review or adjust your preferences anytime via the Cookie Preferences link in the footer.",
  },
  {
    category: "Privacy & Technical",
    question: "Does ActiveNerds work on mobile devices and offline?",
    answer:
      "Yes. The entire site is engineered as a responsive Progressive Web App (PWA) with fast client-side navigation, mobile touch optimization, and offline article index caching.",
  },
];

const categories = ["All", ...Array.from(new Set(faqData.map((f) => f.category)))];

const FAQPage = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    return faqData.filter((item) => {
      const matchesQuery =
        !query ||
        item.question.toLowerCase().includes(query.toLowerCase()) ||
        item.answer.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory]);

  const faqSchema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqData.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };
  }, []);

  return (
    <>
      <Seo
        title="FAQ — Frequently Asked Questions"
        description={`Find answers to common questions about ${siteConfig.name}, our technical coverage across Kubernetes, DevSecOps, and AI, our free developer tools, and desk ergonomics utilities.`}
        path="/faq"
      />
      <JsonLd schema={faqSchema} id="faq-page-schema" />

      <Container className="py-12">
        <div className="mb-8">
          <p className="eyebrow mb-2">FAQ</p>
          <h1 className="display-heading text-4xl">Frequently asked questions</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Can't find what you're looking for?{" "}
            <Link to="/contact" className="text-accent hover:underline font-medium">
              Contact us
            </Link>
            .
          </p>
        </div>

        {/* Search + filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search questions or keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ items */}
        <div className="space-y-4">
          {filtered.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-accent/30"
            >
              <summary className="flex cursor-pointer items-center justify-between text-base font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                <span className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-normal">
                    {item.category}
                  </span>
                  <span>{item.question}</span>
                </span>
                <span className="ml-2 text-muted-foreground transition-transform group-open:rotate-45 text-lg font-light">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground border-t border-border/50 pt-3">
                {item.answer}
              </p>
            </details>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center rounded-lg border border-dashed border-border bg-card/40">
              <p className="text-muted-foreground font-medium">
                No questions match "{query}".
              </p>
              <p className="text-sm text-muted-foreground/80 mt-1">
                Try searching for broader keywords like "tools", "privacy", "Kubernetes", or "newsletter".
              </p>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default FAQPage;
