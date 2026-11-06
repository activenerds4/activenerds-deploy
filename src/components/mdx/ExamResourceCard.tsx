import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  FileQuestion,
  Layers3,
  BookmarkCheck,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ExamResourceCardProps {
  title: string;
  type?: "notes" | "mock" | "flash" | "cheat" | "lab";
  badge?: string;
  count?: string;
  description: string;
  href: string;
  status?: "live" | "preview" | "upcoming";
  actionLabel?: string;
}

const THEME_MAP = {
  notes: {
    icon: BookOpen,
    iconBg: "bg-primary/10 border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    glow: "bg-primary/10 group-hover:bg-primary/20",
    borderHover: "hover:border-primary/50",
    badgeColor: "text-primary border-primary/30 bg-primary/5",
    linkText: "text-primary",
  },
  mock: {
    icon: FileQuestion,
    iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white",
    glow: "bg-amber-500/10 group-hover:bg-amber-500/20",
    borderHover: "hover:border-amber-500/50",
    badgeColor: "text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-500/5",
    linkText: "text-amber-500 dark:text-amber-400",
  },
  flash: {
    icon: Layers3,
    iconBg: "bg-purple-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white",
    glow: "bg-purple-500/10 group-hover:bg-purple-500/20",
    borderHover: "hover:border-purple-500/50",
    badgeColor: "text-purple-500 dark:text-purple-400 border-purple-500/30 bg-purple-500/5",
    linkText: "text-purple-500 dark:text-purple-400",
  },
  cheat: {
    icon: BookmarkCheck,
    iconBg: "bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white",
    glow: "bg-blue-500/10 group-hover:bg-blue-500/20",
    borderHover: "hover:border-blue-500/50",
    badgeColor: "text-blue-500 dark:text-blue-400 border-blue-500/30 bg-blue-500/5",
    linkText: "text-blue-500 dark:text-blue-400",
  },
  lab: {
    icon: Terminal,
    iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white",
    glow: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    borderHover: "hover:border-emerald-500/50",
    badgeColor: "text-emerald-500 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    linkText: "text-emerald-500 dark:text-emerald-400",
  },
};

export const ExamResourceCard: React.FC<ExamResourceCardProps> = ({
  title,
  type = "notes",
  badge,
  count,
  description,
  href,
  status = "live",
  actionLabel,
}) => {
  const theme = THEME_MAP[type] || THEME_MAP.notes;
  const IconComponent = theme.icon;

  const defaultAction =
    actionLabel ||
    (type === "notes"
      ? "Browse Study Notes"
      : type === "mock"
        ? "Explore Mock Tests"
        : type === "flash"
          ? "Practice Flash Cards"
          : type === "cheat"
            ? "View Cheat Sheets"
            : "Explore Resource");

  return (
    <Link
      to={href}
      className={`group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-7 ${theme.borderHover} hover:bg-card transition-all duration-200 shadow-sm backdrop-blur-sm overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
    >
      <div
        className={`absolute -top-16 -right-16 w-44 h-44 ${theme.glow} rounded-full blur-3xl transition-all pointer-events-none`}
      />

      <div className="space-y-4 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 transition-all ${theme.iconBg}`}
          >
            <IconComponent className="h-6 w-6" />
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            {badge && (
              <Badge variant="outline" className={`font-mono text-xs ${theme.badgeColor}`}>
                {badge}
              </Badge>
            )}
            {count && (
              <span className="font-mono text-xs px-2 py-0.5 rounded-md border border-border/70 bg-muted/30 text-muted-foreground">
                {count}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>
      </div>

      <div
        className={`pt-5 mt-6 border-t border-border/60 flex items-center justify-between text-sm font-semibold ${theme.linkText} relative z-10`}
      >
        <span>{defaultAction}</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
      </div>
    </Link>
  );
};

export default ExamResourceCard;
