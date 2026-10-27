import { Suspense, useMemo, lazy } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import { getToolBySlug, toolCategories } from "@/lib/config/tools-registry";

const ToolMicroReset = lazy(() => import("@/components/tools/ToolMicroReset"));

const ToolDetailPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const tool = useMemo(() => getToolBySlug(slug), [slug]);

  if (!tool) {
    return (
      <Container className="py-20 text-center">
        <h1 className="display-heading text-3xl">Tool not found</h1>
        <p className="mt-2 text-muted-foreground">
          The tool you're looking for doesn't exist or hasn't been built yet.
        </p>
        <Link
          to="/tools"
          className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
        >
          Back to tools
        </Link>
      </Container>
    );
  }

  const ToolComponent = tool.component;

  return (
    <>
      <Seo
        title={`${tool.title} — Interactive Tool`}
        description={tool.description}
        path={`/tools/${tool.slug}`}
      />
      <Container className="py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <Link to="/tools" className="hover:text-foreground">
                Tools
              </Link>
            </li>
            <li className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <span className="text-foreground">{tool.title}</span>
            </li>
          </ol>
        </nav>

        <header className="mb-8">
          <h1 className="display-heading text-4xl">{tool.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{tool.description}</p>
          {(() => {
            const cat = toolCategories.find((c) => c.id === tool.category);
            return cat ? (
              <span className="mt-3 inline-block rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {cat.label}
              </span>
            ) : null;
          })()}
        </header>

        <div className="max-w-3xl">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
              </div>
            }
          >
            <ToolComponent />
          </Suspense>
          <Suspense fallback={null}>
            <ToolMicroReset />
          </Suspense>
        </div>
      </Container>
    </>
  );
};

export default ToolDetailPage;
