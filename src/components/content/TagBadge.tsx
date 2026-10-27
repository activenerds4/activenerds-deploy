import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: string;
  className?: string;
}

/**
 * Maps a tag slug to its display name.
 * In production this would come from the content source's tag registry.
 */
const tagNames: Record<string, string> = {
  kubernetes: "Kubernetes",
  mlops: "MLOps",
  llms: "LLMs",
  pytorch: "PyTorch",
  docker: "Docker",
  devsecops: "DevSecOps",
  "standing-desk": "Standing Desk",
  "desk-stretches": "Desk Stretches",
  "habit-building": "Habit Building",
  ergonomics: "Ergonomics",
  "deep-work": "Deep Work",
  conferences: "Conferences",
  "fitness-trackers": "Fitness Trackers",
  affiliate: "Affiliate",
};

function displayName(slug: string): string {
  return tagNames[slug] ?? slug;
}

/**
 * Editorial tag badge — links to the tag listing page.
 * Uses a pill style with muted background for a restrained, magazine look.
 */
const TagBadge = ({ tag, className }: TagBadgeProps) => {
  return (
    <Link
      to={`/tag/${tag}`}
      className={cn(
        "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      {displayName(tag)}
    </Link>
  );
};

export default TagBadge;
