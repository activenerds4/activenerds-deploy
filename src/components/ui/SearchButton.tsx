import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { IconButton } from "./IconButton";
import VisuallyHidden from "./VisuallyHidden";
import { cn } from "@/lib/utils";

interface SearchButtonProps {
  variant?: "compact" | "expanded";
  className?: string;
}

/**
 * Search trigger button. Navigates to the /search page.
 * Supports a compact icon-only variant and an expanded input-like pill variant with keyboard shortcut badge.
 */
const SearchButton = ({ variant = "compact", className }: SearchButtonProps) => {
  const navigate = useNavigate();

  if (variant === "expanded") {
    return (
      <button
        type="button"
        onClick={() => navigate("/search")}
        className={cn(
          "group flex items-center gap-2 rounded-md border border-border/80 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-all hover:border-accent/50 hover:bg-muted/70 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          className,
        )}
        aria-label="Search articles, tools and resources"
      >
        <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent transition-colors" aria-hidden />
        <span className="hidden lg:inline text-xs font-medium">Search articles & tools...</span>
        <span className="inline lg:hidden text-xs font-medium">Search...</span>
        <kbd className="ml-1.5 hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground shadow-xs">
          <span className="text-[9px]">⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <IconButton
      variant="ghost"
      size="sm"
      label="Search articles"
      onClick={() => navigate("/search")}
      className={cn("gap-1.5", className)}
    >
      <Search className="h-4 w-4" aria-hidden />
      <VisuallyHidden>Search articles</VisuallyHidden>
    </IconButton>
  );
};

export default SearchButton;
