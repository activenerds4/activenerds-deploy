import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useParams, useLocation, Navigate } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import MdxRenderer from "@/components/mdx/MdxRenderer";
import TableOfContents, { type TocHeading } from "@/components/article/TableOfContents";
import ReadingProgress from "@/components/article/ReadingProgress";
import { extractHeadings } from "@/lib/content/headings";
import { splitFrontmatter } from "@/lib/content/frontmatter";
import { checkRedirect } from "@/lib/content/redirects";

const pageModules = import.meta.glob("/content/pages/**/*.mdx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

interface PageFrontmatter {
  title: string;
  description: string;
  date?: string;
  author?: string;
  category?: string;
  track?: string;
  trackSlug?: string;
  moduleNumber?: number | string;
  totalModules?: number | string;
  layout?: "hub" | "article" | "default";
}

function parsePage(raw: string): { frontmatter: PageFrontmatter; content: string } {
  const { frontmatter, body } = splitFrontmatter(raw);
  return {
    frontmatter: {
      title: (frontmatter.title as string) ?? "Untitled",
      description: (frontmatter.description as string) ?? "",
      date: frontmatter.date as string | undefined,
      author: frontmatter.author as string | undefined,
      category: frontmatter.category as string | undefined,
      track: frontmatter.track as string | undefined,
      trackSlug: frontmatter.trackSlug as string | undefined,
      moduleNumber: frontmatter.moduleNumber as number | string | undefined,
      totalModules: frontmatter.totalModules as number | string | undefined,
      layout: frontmatter.layout as "hub" | "article" | "default" | undefined,
    },
    content: body,
  };
}

function buildBreadcrumbs(segments: string[]) {
  return segments.map((seg, idx) => {
    const path = "/" + segments.slice(0, idx + 1).join("/");
    let label = seg
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    if (seg.toLowerCase() === "vcf") label = "VCF";
    if (seg.toLowerCase() === "vmware") label = "VMware";
    if (seg.toLowerCase() === "certifications") label = "Certifications";
    if (seg.toLowerCase() === "study-notes") label = "Study Notes";
    if (seg.toLowerCase() === "mock-tests") label = "Mock Tests";
    if (seg.toLowerCase() === "flash-cards") label = "Flash Cards";
    if (seg.toLowerCase() === "vcf9-architect") label = "Cloud Foundation Architect (2V0-13.25)";
    if (seg.toLowerCase() === "vcf-administrator") label = "Cloud Foundation Administrator (2V0-17.25)";
    if (seg.toLowerCase() === "vks-tanzu") label = "VCF vSphere Kubernetes Service (3V0-24.25)";
    if (seg.toLowerCase() === "learning") label = "Deep Learning";
    if (seg.toLowerCase() === "aws") label = "AWS";
    if (seg.toLowerCase() === "kubernetes") label = "Kubernetes";
    if (seg.toLowerCase() === "ai-ml") label = "AI & ML";
    if (seg.toLowerCase() === "hashicorp") label = "HashiCorp";
    if (seg.toLowerCase() === "azure") label = "Azure";

    return { label, path };
  });
}

const MdxSubPage = () => {
  const params = useParams();
  const location = useLocation();
  const fullPath = location.pathname.replace(/^\//, "").replace(/\/$/, "");
  const slug = fullPath || (params["*"] ?? "");

  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const articleRef = useRef<HTMLDivElement>(null);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);

  const pageData = useMemo(() => {
    const key = `/content/pages/${slug}.mdx`;
    if (pageModules[key]) {
      return parsePage(pageModules[key]);
    }
    const indexKey = `/content/pages/${slug}/index.mdx`;
    if (pageModules[indexKey]) {
      return parsePage(pageModules[indexKey]);
    }
    return null;
  }, [slug]);

  // Check for a static redirect before rendering 404.
  const redirect = useMemo(() => {
    if (pageData) return null;
    const result = checkRedirect(location.pathname);
    if (result.hasRedirect && result.destination) return result.destination;
    return null;
  }, [pageData, location.pathname]);

  const isArticle = useMemo(() => {
    if (!pageData) return false;
    if (pageData.frontmatter.layout === "article") return true;
    if (pageData.frontmatter.layout === "hub") return false;

    // In certification study notes: if it has 5 or more path segments, it is a module article
    const segments = slug.split("/").filter(Boolean);
    if (segments.includes("study-notes") && segments.length >= 5) {
      return true;
    }
    return Boolean(pageData.frontmatter.track && pageData.frontmatter.moduleNumber);
  }, [pageData, slug]);

  // Parent track information for article pages
  const parentTrack = useMemo(() => {
    const segments = slug.split("/").filter(Boolean);
    if (segments.length >= 2) {
      const parentPath = "/" + segments.slice(0, segments.length - 1).join("/");
      const trackFolder = segments[segments.length - 2];
      let name = "Certification Track";
      if (trackFolder === "vcf-administrator") name = "Cloud Foundation Administrator (2V0-17.25) Track";
      if (trackFolder === "vcf9-architect") name = "Cloud Foundation Architect (2V0-13.25) Track";
      if (trackFolder === "vks-tanzu") name = "VCF vSphere Kubernetes Service (3V0-24.25) Track";
      if (pageData?.frontmatter.track) name = pageData.frontmatter.track;
      return { path: parentPath, name };
    }
    return { path: "/certifications", name: "Certifications Hub" };
  }, [pageData, slug]);

  // Extract headings from the rendered article after MDX compiles
  useEffect(() => {
    if (!pageData || !isArticle) return;

    const timer = setTimeout(() => {
      if (!articleRef.current) return;
      const container = articleRef.current;
      let found = extractHeadings(container);
      if (found.length > 0) {
        setHeadings(found);
        return;
      }

      const observer = new MutationObserver(() => {
        found = extractHeadings(container);
        if (found.length > 0) {
          setHeadings(found);
          observer.disconnect();
        }
      });

      observer.observe(container, { childList: true, subtree: true });
    }, 50);

    return () => clearTimeout(timer);
  }, [pageData, isArticle]);

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  if (!pageData) {
    return (
      <Container className="py-20 text-center">
        <h1 className="display-heading text-3xl">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist or hasn't been created yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
        >
          Back to home
        </Link>
      </Container>
    );
  }

  const segments = slug.split("/").filter(Boolean);
  const breadcrumbs = buildBreadcrumbs(segments);

  // ARTICLE VIEW: Matches blog article layout with sticky outline on the left
  if (isArticle) {
    return (
      <>
        <Seo
          title={pageData.frontmatter.title}
          description={pageData.frontmatter.description}
          path={`/${slug}`}
        />
        <ReadingProgress />

        <article className="py-8 sm:py-12">
          <Container width="default">
            {/* Top Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-muted-foreground">
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                {breadcrumbs.map((crumb, idx) => (
                  <li key={crumb.path} className="flex items-center gap-1.5">
                    <ChevronRight className="h-3 w-3 text-muted-foreground/60" aria-hidden />
                    {idx === breadcrumbs.length - 1 ? (
                      <span className="text-foreground font-medium truncate max-w-xs sm:max-w-md">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link to={crumb.path} className="hover:text-primary transition-colors">
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            {/* Back link */}
            <Link
              to={parentTrack.path}
              className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Back to {parentTrack.name}</span>
            </Link>

            {/* Desktop two-column layout: Left sticky TOC + Right article content */}
            <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
              {/* Left TOC Sidebar (desktop sticky) */}
              <aside className="hidden lg:block">
                {headings.length >= 2 ? (
                  <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
                    <TableOfContents headings={headings} />
                  </div>
                ) : null}
              </aside>

              {/* Main Article Column */}
              <div className="mx-auto w-full max-w-article min-w-0">
                {/* Mobile TOC (collapsible) */}
                <div className="lg:hidden mb-6">
                  <TableOfContents headings={headings} />
                </div>

                {/* Article Header */}
                <header className="mb-10">
                  <div className="mb-4 flex flex-wrap items-center gap-2.5">
                    <Link
                      to={parentTrack.path}
                      className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs font-semibold uppercase text-primary hover:bg-primary/20 transition-colors"
                    >
                      {pageData.frontmatter.track ?? parentTrack.name}
                    </Link>
                    {pageData.frontmatter.moduleNumber && (
                      <span className="font-mono text-xs text-muted-foreground">
                        Module {pageData.frontmatter.moduleNumber}{" "}
                        {pageData.frontmatter.totalModules
                          ? `of ${pageData.frontmatter.totalModules}`
                          : ""}
                      </span>
                    )}
                  </div>

                  <h1 className="display-heading mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                    {pageData.frontmatter.title}
                  </h1>

                  {pageData.frontmatter.description && (
                    <p className="mb-6 text-lg text-muted-foreground leading-relaxed">
                      {pageData.frontmatter.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground border-y border-border/60 py-3">
                    <span>
                      {pageData.frontmatter.author ?? "ActiveNerds Cloud Architecture Team"}
                    </span>
                    <span>•</span>
                    <span>{pageData.frontmatter.track ?? "Technical Certification Guide"}</span>
                    <span>•</span>
                    <span>Updated {pageData.frontmatter.date ?? "2026-10-31"}</span>
                  </div>
                </header>

                {/* Rendered Article Content */}
                <div ref={articleRef} className="prose-article text-lg leading-relaxed mt-6">
                  <MdxRenderer key={slug} body={pageData.content} slug={slug} />
                </div>
              </div>
            </div>
          </Container>
        </article>
      </>
    );
  }

  // CATEGORY / HUB VIEW: Full width container with styled header and full-width tiles
  return (
    <>
      <Seo
        title={pageData.frontmatter.title}
        description={pageData.frontmatter.description}
        path={`/${slug}`}
      />
      <div className="py-8 sm:py-12">
        <Container width="default" className="space-y-8">
          {/* Top Breadcrumbs */}
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb, idx) => (
                <li key={crumb.path} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-muted-foreground/60" aria-hidden />
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="hover:text-primary transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Full-width Category Header */}
          <header className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-10 backdrop-blur-sm space-y-4 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                <span>
                  {pageData.frontmatter.category
                    ? `Certifications • ${pageData.frontmatter.category.toUpperCase()}`
                    : "Technical Certifications"}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                {pageData.frontmatter.title}
              </h1>
              {pageData.frontmatter.description && (
                <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed pt-1">
                  {pageData.frontmatter.description}
                </p>
              )}
            </div>
          </header>

          {/* Full Width MDX Content (Tiles, Lists, Comparison Tables) */}
          <div className="w-full">
            <MdxRenderer key={slug} body={pageData.content} slug={slug} />
          </div>
        </Container>
      </div>
    </>
  );
};

export default MdxSubPage;
