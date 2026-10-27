import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { PostSummary, Author } from "@/lib/content";

interface FeaturedAuthorSpotlightProps {
  author: Author | null;
  posts: PostSummary[];
}

/**
 * Featured author spotlight — shows author avatar, bio, and
 * their recent articles. Placed as a full-width section.
 */
const FeaturedAuthorSpotlight = ({ author, posts }: FeaturedAuthorSpotlightProps) => {
  const [avatarError, setAvatarError] = useState(false);

  if (!author || !posts || posts.length === 0) return null;

  const avatarSrc = avatarError ? "/authors/activenerds-team.jpg" : (author.avatar || "/authors/activenerds-team.jpg");

  return (
    <section className="border-t border-border/80 bg-card py-12 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="eyebrow">Featured Author</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-accent">
            <ShieldCheck className="h-3 w-3" /> Verified Core Team
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Author info (5 cols) */}
          <div className="lg:col-span-5 rounded-xl border border-border/70 bg-muted/20 p-6">
            <Link
              to={`/author/${author.slug}`}
              className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-lg"
            >
              <div className="mb-4 overflow-hidden rounded-full border-2 border-accent/40 shadow-sm w-20 h-20 transition-transform group-hover:scale-105">
                <img
                  src={avatarSrc}
                  alt={author.name}
                  width={80}
                  height={80}
                  loading="lazy"
                  decoding="async"
                  onError={() => setAvatarError(true)}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="font-sans text-xl font-bold text-foreground transition-colors group-hover:text-accent">
                {author.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {author.bio}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:underline">
                View author profile
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden />
              </span>
            </Link>
          </div>

          {/* Author's recent posts (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border border-border/70 bg-card p-6 shadow-2xs">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Latest Publications by {author.name}
            </h4>
            <ul className="divide-y divide-border/60">
              {posts.slice(0, 3).map((post) => (
                <li key={post.slug} className="group py-3.5 first:pt-0 last:pb-0">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="flex items-start justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                    aria-label={post.title}
                  >
                    <div className="min-w-0 space-y-1">
                      <h4 className="font-sans text-sm sm:text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-accent line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {post.description}
                      </p>
                    </div>
                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-1 group-hover:text-accent"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAuthorSpotlight;
