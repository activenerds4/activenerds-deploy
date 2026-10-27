import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  CheckCircle2,
  Cpu,
  Layers,
  Calendar,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import NewsletterCTA from "@/components/growth/NewsletterCTA";
import { getVerifiedEmail, isEmailVerified } from "@/lib/cookies/identity";

/**
 * Dedicated Newsletter Subscription Landing Page.
 *
 * Linked from the primary "Subscribe" CTA on the top navbar.
 * Integrates directly with the Google Apps Script Newsletter Webhook
 * and the verified user identity cookie bridge.
 */
export default function SubscribePage() {
  const verifiedEmail = getVerifiedEmail();
  const isVerified = isEmailVerified(verifiedEmail || "");

  const benefits = [
    {
      icon: Layers,
      title: "Real-World Architecture Blueprints",
      description:
        "Battle-tested patterns for Kubernetes microservices, distributed observability, zero-downtime deployments, and cloud cost containment.",
    },
    {
      icon: Cpu,
      title: "Production AI & Agentic Engineering",
      description:
        "Pragmatic guides for building LLM agents, local embeddings, model quantization, and production inference optimization.",
    },
    {
      icon: Calendar,
      title: "Tech Conference Guides & Roadmaps",
      description:
        "Insider survival guides, session schedules, and travel ROI blueprints for AWS re:Invent, CES Las Vegas, KubeCon, and NVIDIA GTC.",
    },
    {
      icon: ShieldCheck,
      title: "Zero Spam, Unsubscribe Anytime",
      description:
        "High-signal technical content only. No sponsored fluff, no sales pitches. Unsubscribe with a single click whenever you wish.",
    },
  ];

  return (
    <>
      <Seo
        title="Subscribe to ActiveNerds — Engineering Blueprints & Tech Summits"
        description="Join thousands of software engineers and system architects receiving weekly deep-dives on cloud architecture, AI engineering, and tech conference guides."
        path="/subscribe"
      />

      <div className="border-b border-border bg-gradient-to-b from-muted/40 via-background to-background py-16 sm:py-24">
        <Container width="article" className="text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Weekly Engineering Dispatch</span>
          </div>

          <h1 className="display-heading text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Stay ahead in cloud architecture, AI, and developer tools.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Practical, zero-fluff breakdowns written for engineers, architects, and technical leaders who build production systems.
          </p>

          {/* Identity verified badge if visitor already verified email */}
          {isVerified && verifiedEmail && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>
                Verified identity recognized: <strong>{verifiedEmail}</strong>
              </span>
            </div>
          )}

          {/* Form container */}
          <div className="mt-10 max-w-lg mx-auto text-left">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xl">
              <NewsletterCTA
                placement="homepage"
                heading="Get the Dispatch Every Tuesday"
                description="Join 25,000+ engineers. Enter your email below to receive the latest teardowns directly in your inbox."
              />
            </div>
          </div>
        </Container>
      </div>

      {/* Value pillars section */}
      <section className="py-16 sm:py-20 bg-background">
        <Container width="default">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              What's inside every dispatch
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Curated by practitioners with real production experience.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-border/80 bg-card/60 p-6 transition-all hover:border-border hover:bg-card"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-base text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick links to explore while subscribing */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              Want to see what we publish first?{" "}
              <Link
                to="/articles"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline ml-1"
              >
                Browse recent articles
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
