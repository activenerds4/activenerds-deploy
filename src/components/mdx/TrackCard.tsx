import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Layers,
  Clock,
  Award,
  ShieldCheck,
  Cpu,
  Network,
  Container as ContainerIcon,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TrackCardProps {
  title: string;
  badge?: string;
  modules?: string;
  hours?: string;
  exam?: string;
  level?: string;
  href: string;
  description: string;
  icon?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  cpu: Cpu,
  shield: ShieldCheck,
  network: Network,
  container: ContainerIcon,
  layers: Layers,
  award: Award,
  sparkles: Sparkles,
};

export const TrackCard: React.FC<TrackCardProps> = ({
  title,
  badge,
  modules,
  hours,
  exam,
  level,
  href,
  description,
  icon = "award",
}) => {
  const IconComponent = ICON_MAP[icon.toLowerCase()] || Award;

  return (
    <Link
      to={href}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 hover:border-primary/50 hover:bg-card transition-all duration-200 shadow-sm backdrop-blur-sm overflow-hidden cursor-pointer block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all pointer-events-none" />

      <div className="space-y-4 relative z-10 pointer-events-none">
        <div className="flex items-start justify-between gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary group-hover:scale-105 transition-transform">
            <IconComponent className="h-6 w-6" />
          </div>
          {badge && (
            <Badge
              variant="outline"
              className="font-mono text-xs uppercase text-primary border-primary/30 bg-primary/5"
            >
              {badge}
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          {exam && (
            <p className="font-mono text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="text-primary font-medium">Exam:</span> {exam}
            </p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 pt-1">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground pt-1">
          {modules && (
            <span className="inline-flex items-center gap-1 text-foreground/90 font-medium">
              <Layers className="h-3.5 w-3.5 text-primary" />
              {modules}
            </span>
          )}
          {hours && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {hours}
              </span>
            </>
          )}
          {level && (
            <>
              <span>•</span>
              <span className="capitalize">{level}</span>
            </>
          )}
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between text-sm font-semibold text-primary group-hover:text-primary/90 relative z-10 pointer-events-none">
        <span>Explore Study Track</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
      </div>
    </Link>
  );
};

export default TrackCard;
