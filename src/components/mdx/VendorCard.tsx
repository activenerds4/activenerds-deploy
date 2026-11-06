import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Server,
  Cloud,
  Terminal,
  Brain,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface VendorCardProps {
  name: string;
  badge?: string;
  status?: "live" | "coming-soon";
  certCount?: string;
  description: string;
  href?: string;
  icon?: string;
  tags?: string[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  vmware: Server,
  aws: Cloud,
  kubernetes: Layers,
  ai: Brain,
  hashicorp: Terminal,
  azure: Cpu,
  shield: ShieldCheck,
  sparkles: Sparkles,
};

export const VendorCard: React.FC<VendorCardProps> = ({
  name,
  badge,
  status = "coming-soon",
  certCount,
  description,
  href,
  icon = "cloud",
  tags = [],
}) => {
  const IconComponent = ICON_MAP[icon.toLowerCase()] || Cloud;
  const isLive = status === "live" && Boolean(href);

  const cardContent = (
    <div className="relative flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/90 hover:shadow-lg group overflow-hidden">
      {/* Dynamic ambient background glow */}
      <div
        className={`absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl pointer-events-none transition-all ${
          isLive
            ? "bg-primary/15 group-hover:bg-primary/25"
            : "bg-muted-foreground/10 group-hover:bg-muted-foreground/15"
        }`}
      />

      <div className="space-y-4 relative z-10">
        {/* Top header row */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border shrink-0 transition-transform group-hover:scale-105 ${
              isLive
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border/80 bg-muted/40 text-muted-foreground"
            }`}
          >
            <IconComponent className="h-6 w-6" />
          </div>

          <div className="flex items-center gap-2">
            {isLive ? (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1.5 border-emerald-500/30 bg-emerald-500/10 font-mono text-[11px] font-medium text-emerald-400"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Tracks
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 border-amber-500/30 bg-amber-500/10 font-mono text-[11px] font-medium text-amber-400"
              >
                <Clock className="h-3 w-3" />
                Coming Soon
              </Badge>
            )}

            {badge && (
              <Badge
                variant="outline"
                className="font-mono text-[11px] uppercase text-muted-foreground border-border/80 bg-background/50"
              >
                {badge}
              </Badge>
            )}
          </div>
        </div>

        {/* Vendor Title & Count */}
        <div className="space-y-1">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
          {certCount && (
            <p className="font-mono text-xs text-muted-foreground flex items-center gap-1.5">
              <span className={isLive ? "text-primary font-medium" : "text-muted-foreground"}>
                {certCount}
              </span>
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {description}
        </p>

        {/* Tags / certifications preview */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md border border-border/60 bg-background/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between text-xs font-semibold relative z-10">
        {isLive ? (
          <>
            <span className="font-mono uppercase tracking-wider text-primary group-hover:text-primary/90">
              Explore Track Guides
            </span>
            <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1.5 transition-transform" />
          </>
        ) : (
          <span className="font-mono text-muted-foreground/80 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/60" />
            Curriculum In Development
          </span>
        )}
      </div>
    </div>
  );

  if (isLive && href) {
    return (
      <Link to={href} className="block h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
        {cardContent}
      </Link>
    );
  }

  return <div className="h-full opacity-90">{cardContent}</div>;
};

export default VendorCard;
