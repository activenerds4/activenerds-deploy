import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  FileQuestion,
  Layers3,
  BookmarkCheck,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ResourceCardProps {
  title: string;
  type?: "notes" | "mock" | "flash" | "cheat";
  number?: string | number;
  badge?: string;
  meta?: string;
  description: string;
  href?: string;
  status?: "live" | "preview" | "upcoming";
  actionLabel?: string;
}

const TYPE_ICONS = {
  notes: BookOpen,
  mock: FileQuestion,
  flash: Layers3,
  cheat: BookmarkCheck,
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  type = "mock",
  number,
  badge,
  meta,
  description,
  href = "#",
  status = "live",
  actionLabel,
}) => {
  const Icon = TYPE_ICONS[type] || FileQuestion;
  const isLink = href && href !== "#";

  const content = (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/80 bg-card/60 p-5 sm:p-6 hover:border-primary/50 hover:bg-card transition-all shadow-sm backdrop-blur-sm">
      <div className="flex items-start gap-4 min-w-0">
        <div className="pt-0.5 shrink-0">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            {number ? (
              <span className="font-mono text-sm font-bold">{String(number).padStart(2, "0")}</span>
            ) : (
              <Icon className="h-5 w-5" />
            )}
          </div>
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {badge && (
              <Badge variant="outline" className="font-mono text-[11px] text-primary border-primary/30 bg-primary/5">
                {badge}
              </Badge>
            )}
            {meta && (
              <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                {meta}
              </span>
            )}
            {status === "upcoming" && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                <Clock className="h-2.5 w-2.5" />
                Coming Soon
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-primary shrink-0 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
        <span>{actionLabel || (type === "mock" ? "Launch Exam" : type === "flash" ? "Open Deck" : "View Sheet")}</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );

  if (isLink) {
    return <Link to={href} className="block cursor-pointer">{content}</Link>;
  }

  return <div>{content}</div>;
};

export default ResourceCard;
