import { useState } from "react";
import { ResponsiveImage } from "@/components/mdx";
import type { Post } from "@/lib/content";

interface ArticleHeroProps {
  post: Post;
}

/**
 * Full-width hero image for an article.
 * Maintains imageAlt on the HTML <img> element for accessibility and SEO,
 * while removing visual captions and alt text from under the image unless loading fails.
 */
const ArticleHero = ({ post }: ArticleHeroProps) => {
  const [hasError, setHasError] = useState(false);

  if (!post.image) return null;

  return (
    <figure className="mb-10">
      <div className="overflow-hidden rounded-lg border border-border">
        <ResponsiveImage
          src={post.image}
          alt={post.imageAlt ?? post.title}
          priority
          figureClassName="my-0"
          className="h-auto w-full rounded-none border-0"
          showCaption={false}
          onError={() => setHasError(true)}
        />
      </div>
      {/* imageAlt is preserved on img.alt for a11y, but only displayed on-page if loading fails */}
      {hasError && post.imageAlt ? (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {post.imageAlt}
        </figcaption>
      ) : null}
    </figure>
  );
};

export default ArticleHero;
