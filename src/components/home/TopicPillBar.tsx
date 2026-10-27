import { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Wrench, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TopicPill {
  id: string;
  name: string;
  icon?: string;
  badge?: string;
  type?: "category" | "anchor" | "route";
  target?: string;
}

const defaultTopics: TopicPill[] = [
  { id: "all", name: "All Tracks", icon: "⚡" },
  { id: "ai-machine-learning", name: "AI & ML", icon: "🤖" },
  { id: "containers-kubernetes", name: "Kubernetes & Containers", icon: "☸️" },
  { id: "devsecops-security", name: "DevSecOps & Cloud", icon: "🛡️" },
  { id: "fitness-wellness-tech", name: "Desk Health & Fitness", icon: "🏃" },
  { id: "platform-engineering-devops", name: "Platform Engineering", icon: "⚙️" },
  { id: "focus-productivity", name: "Deep Work & Focus", icon: "🎯" },
  { id: "gear-gadgets", name: "Active Desk Gear", icon: "🔌" },
  { id: "tools-showcase", name: "Interactive Tools", icon: "🛠️", badge: "14 Live", type: "anchor", target: "tools-section" },
  { id: "resources-showcase", name: "Cheat Sheets & Audits", icon: "📋", badge: "25+ Free", type: "anchor", target: "resources-section" },
];

interface TopicPillBarProps {
  activeCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  className?: string;
}

export const TopicPillBar = ({
  activeCategory,
  onSelectCategory,
  className,
}: TopicPillBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const distance = 240;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const handleClick = (topic: TopicPill) => {
    if (topic.type === "anchor" && topic.target) {
      const element = document.getElementById(topic.target);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    onSelectCategory(topic.id);
  };

  return (
    <div
      className={cn(
        "sticky top-16 z-40 w-full border-b border-border/70 bg-background/95 backdrop-blur-md transition-colors",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll topics left"
          className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring mr-1"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        {/* Scrollable Topics Row */}
        <div
          ref={scrollRef}
          role="tablist"
          aria-label="Technical Tracks"
          className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto py-2.5 scroll-smooth"
        >
          {defaultTopics.map((topic) => {
            const isActive = activeCategory === topic.id;
            return (
              <button
                key={topic.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => handleClick(topic)}
                className={cn(
                  "group relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-ring",
                  isActive
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "border border-border/80 bg-card/60 text-muted-foreground hover:border-accent/40 hover:bg-muted hover:text-foreground",
                )}
              >
                {topic.icon && <span className="text-[13px] leading-none">{topic.icon}</span>}
                <span>{topic.name}</span>
                {topic.badge && (
                  <span
                    className={cn(
                      "ml-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-mono font-semibold uppercase tracking-wider",
                      isActive
                        ? "bg-background/20 text-background"
                        : "bg-accent/15 text-accent border border-accent/20",
                    )}
                  >
                    {topic.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll topics right"
          className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring ml-1"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default TopicPillBar;
