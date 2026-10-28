import React, { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getModule, getModulesForPath } from "@/lib/learning/learning-modules";
import { getLearningPath } from "@/lib/learning/learning-paths";
import { SeriesSidebar } from "@/components/learning/SeriesSidebar";
import { ArticleContent } from "@/components/learning/ArticleContent";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";
import Seo from "@/components/layout/Seo";

const ModuleArticlePage: React.FC = () => {
  const { pathSlug = "", moduleSlug = "" } = useParams<{ pathSlug: string; moduleSlug: string }>();

  const currentModule = getModule(pathSlug, moduleSlug);
  const path = getLearningPath(pathSlug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathSlug, moduleSlug]);

  if (!currentModule || !path) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
          Module Article Not Found
        </h1>
        <p className="mt-3 text-muted-foreground">
          The requested Deep Learning module article does not exist or has been moved.
        </p>
        <Link
          to="/learning/paths"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Learning Paths
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Seo
        title={`${currentModule.seoTitle || currentModule.title} | Active Nerds`}
        description={currentModule.metaDescription || currentModule.description}
        path={`/learning/paths/${pathSlug}/${moduleSlug}`}
        article={true}
      />

      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs text-muted-foreground mb-6 overflow-x-auto">
        <Link to="/learning" className="hover:text-primary transition-colors shrink-0">
          Deep Learning
        </Link>
        <span>/</span>
        <Link to="/learning/paths" className="hover:text-primary transition-colors shrink-0">
          Paths
        </Link>
        <span>/</span>
        <Link
          to={`/learning/paths/${path.slug}`}
          className="hover:text-primary transition-colors shrink-0 font-medium"
        >
          {path.name}
        </Link>
        <span>/</span>
        <span className="text-foreground truncate">{currentModule.title}</span>
      </nav>

      {/* 2-Column Layout: Left Series Sidebar + Main Article */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <SeriesSidebar currentModule={currentModule} />
        <ArticleContent module={currentModule} />
      </div>
    </div>
  );
};

export default ModuleArticlePage;
