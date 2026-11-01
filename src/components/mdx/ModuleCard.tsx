import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";

interface ModuleCardProps {
  moduleNumber: string | number;
  domain?: string;
  title: string;
  description?: string;
  readTime?: string;
  href: string;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  moduleNumber,
  domain,
  title,
  description,
  readTime = "20m read",
  href,
}) => {
  const displayNum =
    typeof moduleNumber === "number" && moduleNumber < 10
      ? `0${moduleNumber}`
      : String(moduleNumber).padStart(2, "0");

  return (
    <Link
      to={href}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/50 p-4 sm:p-5 hover:border-primary/50 hover:bg-card transition-all shadow-sm"
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="pt-0.5 shrink-0">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-xs font-mono font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {displayNum}
          </span>
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {domain && (
              <span className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-mono font-medium border bg-primary/10 text-primary border-primary/30 uppercase">
                {domain}
              </span>
            )}
            <span className="font-mono text-xs text-muted-foreground">
              Module {moduleNumber}
            </span>
            {readTime && (
              <>
                <span className="font-mono text-xs text-muted-foreground/80">•</span>
                <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {readTime}
                </span>
              </>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
            {title}
          </h3>

          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs font-mono text-primary font-semibold shrink-0 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
        <span>Read Notes</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};

export default ModuleCard;
