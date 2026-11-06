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
  BookOpen,
  FileQuestion,
  Layers3,
  BookmarkCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CertTrackCardProps {
  title: string;
  badge?: string;
  modules?: string;
  hours?: string;
  exam?: string;
  level?: string;
  href: string;
  description: string;
  icon?: string;
  resources?: string[];
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

export const CertTrackCard: React.FC<CertTrackCardProps> = ({
  title,
  badge,
  modules,
  hours,
  exam,
  level,
  href,
  description,
  icon = "award",
  resources = ["Study Notes", "Mock Tests", "Flash Cards"],
}) => {
  const IconComponent = ICON_MAP[icon.toLowerCase()] || Award;

  return (
    <Link
      to={href}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 hover:border-primary/50 hover:bg-card transition-all duration-200 shadow-sm backdrop-blur-sm overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all pointer-events-none" />

      <div className="space-y-4 relative z-10">
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

        {/* Available Artifact Pills */}
        <div className="pt-2">
          <span className="text-[11px] font-mono text-muted-foreground/90 uppercase tracking-wider block mb-1.5">
            Artifacts & Prep Tools:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {resources.map((res, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-mono rounded px-2 py-0.5 border border-border/70 bg-background/50 text-foreground/80 group-hover:border-primary/30 transition-colors"
              >
                {res.toLowerCase().includes("notes") && <BookOpen className="h-3 w-3 text-primary" />}
                {res.toLowerCase().includes("mock") && <FileQuestion className="h-3 w-3 text-amber-400" />}
                {res.toLowerCase().includes("flash") && <Layers3 className="h-3 w-3 text-purple-400" />}
                {res.toLowerCase().includes("cheat") && <BookmarkCheck className="h-3 w-3 text-blue-400" />}
                <span>{res}</span>
              </span>
            ))}
          </div>
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

      <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between text-sm font-semibold text-primary group-hover:text-primary/90 relative z-10">
        <span>Explore Certification Track</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
      </div>
    </Link>
  );
};

export default CertTrackCard;
