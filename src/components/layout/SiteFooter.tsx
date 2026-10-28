import { Link } from "react-router-dom";
import { siteConfig } from "@/lib/site-config";
import { track } from "@/lib/analytics";
import Container from "./Container";
import CookieSettingsTrigger from "@/components/cookies/CookieSettingsTrigger";
import FooterNewsletterCTA from "@/components/growth/FooterNewsletterCTA";

const exploreNav = [
  { label: "Articles", to: "/articles" },
  { label: "Developer Tools", to: "/tools" },
  { label: "Resources", to: "/resources" },
  { label: "Conferences & Summits", to: "/resources/conferences" },
  { label: "Browse by Category", to: "/articles#categories" },
  { label: "Browse by Tag", to: "/articles#tags" },
];

const deepLearningNav = [
  { label: "Deep Learning Hub", to: "/learning" },
  { label: "Learning Paths", to: "/learning/paths" },
  { label: "Engineering Glossary", to: "/learning/glossary" },
  { label: "Q&A Challenges", to: "/learning/challenges" },
  { label: "Cheat Sheets", to: "/learning/cheat-sheets" },
];

const aboutNav = [
  { label: "About", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
  { label: "Search", to: "/search" },
];

const socialLinks = [
  { label: "Twitter", href: siteConfig.social.twitter, isExternal: true },
  { label: "GitHub", href: siteConfig.social.github, isExternal: true },
  { label: "LinkedIn", href: siteConfig.social.linkedin, isExternal: true },
  { label: "RSS Feed", href: "/feed.xml", isExternal: false },
  { label: "Sitemap", href: "/sitemap.xml", isExternal: false },
];

/**
 * Site footer with above-footer conversion slot, partitioned 5-column navigation, and legal bar.
 */
export const SiteFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <Container className="py-12 lg:py-16">
        {/* SLOT 1: Primary Conversion Banner (Horizontal) */}
        <FooterNewsletterCTA />

        {/* SLOT 2: Brand and Multi-Column Sitemap Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="max-w-xs">
            <Link
              to="/"
              className="font-serif text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
            >
              {siteConfig.name}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">{siteConfig.description}</p>
          </div>

          {/* Explore Column */}
          <nav aria-label="Explore content">
            <h2 className="eyebrow mb-3">Explore</h2>
            <ul className="space-y-2">
              {exploreNav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Deep Learning Column (Migrated) */}
          <nav aria-label="Deep learning and roadmaps">
            <h2 className="eyebrow mb-3">Deep Learning</h2>
            <ul className="space-y-2">
              {deepLearningNav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* About & Support Column */}
          <nav aria-label="About and support">
            <h2 className="eyebrow mb-3">About</h2>
            <ul className="space-y-2">
              {aboutNav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect & Feeds Column */}
          <nav aria-label="Social media and feeds">
            <h2 className="eyebrow mb-3">Connect</h2>
            <ul className="space-y-2">
              {socialLinks.map((item) => (
                <li key={item.label}>
                  {item.isExternal ? (
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("outbound_link_click", { url: item.href })}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* SLOT 3: Bottom Bar & Legal Links */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {year} {siteConfig.name}. Built with care for the web.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/cookie-policy"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Cookie Policy
            </Link>
            <CookieSettingsTrigger variant="link" label="Cookie Settings" />
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default SiteFooter;
