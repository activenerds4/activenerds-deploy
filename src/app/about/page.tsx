import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Seo from "@/components/layout/Seo";
import Container from "@/components/layout/Container";
import { siteConfig } from "@/lib/site-config";
import { useI18n } from "@/lib/i18n";
import { Cpu, Server, ShieldCheck, Activity, CheckCircle2, Globe, ArrowRight } from "lucide-react";

/**
 * 7-Section Localized Editorial About Page.
 *
 * Implements:
 *   1. Cinematic Hero with left-aligned copy and directional vignette
 *   2. Core Mission Statement
 *   3. ActiveNerds Systems Philosophy
 *   4. 4 Content Pillars (AI/ML, K8s, DevSecOps, Desk Biomechanics)
 *   5. Editorial Standards & Engineering Integrity
 *   6. Global Tech Community & Conferences
 *   7. High-Conversion CTA
 */
const AboutPage = () => {
  const { t, locale, isDefault, setLocale } = useI18n();
  const params = useParams<{ locale?: string }>();

  // Sync locale from URL parameter if present
  useEffect(() => {
    if (params.locale && params.locale !== locale) {
      setLocale(params.locale);
    }
  }, [params.locale, locale, setLocale]);

  const articlesLink = isDefault ? "/articles" : `/${locale}/articles`;
  const canonicalPath = isDefault ? "/about" : `/${locale}/about`;

  return (
    <>
      <Seo
        title={t("about.hero.title")}
        description={t("about.hero.lead")}
        path={canonicalPath}
      />

      {/* 1. Cinematic Hero */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-[#0c0406] via-background to-background py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,167,0.08),transparent_50%)] pointer-events-none" />
        <Container width="default" className="relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2dd4a7]/30 bg-[#2dd4a7]/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#2dd4a7] uppercase mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a7] animate-pulse" />
              {t("about.eyebrow")}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground mb-6 leading-[1.12]">
              {t("about.hero.title")}
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground font-normal leading-relaxed text-justify">
              {t("about.hero.lead")}
            </p>
          </div>
        </Container>
      </section>

      {/* 2. Mission Statement */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <Container width="default">
          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-8 sm:p-12 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#2dd4a7] mb-3">
              {t("about.mission.heading")}
            </h2>
            <p className="text-2xl sm:text-3xl font-medium text-foreground leading-snug text-justify">
              {t("about.mission.text")}
            </p>
          </div>
        </Container>
      </section>

      {/* 3. The ActiveNerds Philosophy */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <Container width="default">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight sticky top-28">
                {t("about.philosophy.heading")}
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6 text-lg leading-relaxed text-muted-foreground text-justify">
              <p>{t("about.philosophy.p1")}</p>
              <p>{t("about.philosophy.p2")}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Four Core Content Pillars */}
      <section className="py-16 sm:py-24 border-b border-border/40 bg-muted/20">
        <Container width="default">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              {t("about.pillars.heading")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="rounded-xl border border-border/60 bg-card p-8 transition-all duration-200 hover:border-[#2dd4a7]/50 hover:shadow-md">
              <div className="h-12 w-12 rounded-lg bg-[#2dd4a7]/10 text-[#2dd4a7] flex items-center justify-center mb-5">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2.5">
                {t("about.pillars.p1.title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-justify">
                {t("about.pillars.p1.desc")}
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-xl border border-border/60 bg-card p-8 transition-all duration-200 hover:border-[#2dd4a7]/50 hover:shadow-md">
              <div className="h-12 w-12 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center mb-5">
                <Server className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2.5">
                {t("about.pillars.p2.title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-justify">
                {t("about.pillars.p2.desc")}
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-xl border border-border/60 bg-card p-8 transition-all duration-200 hover:border-[#2dd4a7]/50 hover:shadow-md">
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2.5">
                {t("about.pillars.p3.title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-justify">
                {t("about.pillars.p3.desc")}
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-xl border border-border/60 bg-card p-8 transition-all duration-200 hover:border-[#2dd4a7]/50 hover:shadow-md">
              <div className="h-12 w-12 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-5">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2.5">
                {t("about.pillars.p4.title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-justify">
                {t("about.pillars.p4.desc")}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 5. Editorial Standards & Engineering Integrity */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <Container width="default">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2dd4a7] mb-3">
              <CheckCircle2 className="h-4 w-4" />
              <span>Engineering Quality Gate</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">
              {t("about.standards.heading")}
            </h2>
            <div className="text-lg leading-relaxed text-muted-foreground text-justify">
              <p>{t("about.standards.text")}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* 6. Global Tech Community */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <Container width="default">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0ea5e9] mb-3">
              <Globe className="h-4 w-4" />
              <span>Worldwide Builder Ecosystem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">
              {t("about.community.heading")}
            </h2>
            <div className="text-lg leading-relaxed text-muted-foreground text-justify">
              <p>{t("about.community.text")}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* 7. Join the Movement CTA */}
      <section className="py-20 sm:py-24 bg-gradient-to-t from-[#0c0406] via-background to-background">
        <Container width="default">
          <div className="rounded-3xl border border-[#2dd4a7]/40 bg-gradient-to-br from-[#1e2532]/80 via-card to-card p-10 sm:p-16 text-center max-w-3xl mx-auto shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
              {t("about.cta.heading")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              {t("about.cta.text")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={articlesLink}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2dd4a7] px-6 py-3.5 text-sm font-semibold text-slate-950 transition-all hover:bg-[#25b890] shadow-sm w-full sm:w-auto"
              >
                <span>{t("about.cta.button")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default AboutPage;
