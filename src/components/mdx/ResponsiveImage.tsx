import { useState } from "react";
import { getImageEntry } from "@/lib/content/image-manifest";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Explicit opt-in caption; omitted or false by default to prevent visual clutter */
  caption?: string;
  showCaption?: boolean;
  priority?: boolean;
  className?: string;
  figureClassName?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export const ResponsiveImage = ({
  src,
  alt,
  width,
  height,
  caption,
  showCaption = false,
  priority = false,
  className,
  figureClassName,
  onError,
  onLoad,
}: ResponsiveImageProps) => {
  const [error, setError] = useState(false);
  const entry = getImageEntry(src);
  const resolvedSrc = error ? "/placeholder.svg" : (entry?.src ?? src);

  return (
    <figure className={figureClassName ?? "my-6"}>
      <img
        src={resolvedSrc}
        alt={alt}
        width={entry?.width ?? width}
        height={entry?.height ?? height}
        srcSet={entry?.srcset}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        // @ts-expect-error — fetchPriority is a valid HTML attribute not yet in React's types
        fetchpriority={priority ? "high" : "auto"}
        onError={() => {
          setError(true);
          onError?.();
        }}
        onLoad={onLoad}
        className={className ?? "h-auto w-full rounded-lg border border-border"}
        style={
          entry?.lqip
            ? {
                backgroundImage: `url(${entry.lqip})`,
                backgroundSize: "cover",
              }
            : undefined
        }
      />
      {/* Visual captions are suppressed by default; alt text is preserved purely on img.alt for a11y & SEO */}
      {showCaption && caption ? (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
};

export default ResponsiveImage;
