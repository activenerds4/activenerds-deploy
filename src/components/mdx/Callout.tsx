import type { ReactNode } from "react";

/**
 * Callout — a visually distinct advisory box.
 *
 * Renders as an ARIA `role="note"` region so screen readers announce it
 * appropriately. The `variant` prop controls the icon and color treatment.
 */
export type CalloutVariant = "info" | "note" | "warning" | "tip";

interface CalloutProps {
  variant?: CalloutVariant;
  type?: CalloutVariant;
  title?: string;
  children: ReactNode;
}

const variantConfig: Record<CalloutVariant, { label: string; className: string; icon: string }> = {
  info: {
    label: "Information",
    className: "border-blue-500/30 bg-blue-500/5 text-foreground",
    icon: "ℹ",
  },
  note: {
    label: "Note",
    className: "border-primary/30 bg-primary/5 text-foreground",
    icon: "✎",
  },
  warning: {
    label: "Warning",
    className: "border-destructive/30 bg-destructive/5 text-foreground",
    icon: "⚠",
  },
  tip: {
    label: "Tip",
    className: "border-emerald-500/40 bg-emerald-500/5 text-foreground",
    icon: "✦",
  },
};

export const Callout = ({ variant, type, title, children }: CalloutProps) => {
  const activeVariant: CalloutVariant = variant || type || "info";
  const config = variantConfig[activeVariant] || variantConfig.info;
  const heading = title ?? config.label;

  return (
    <aside aria-label={heading} className={`my-6 rounded-lg border p-4 ${config.className}`}>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span aria-hidden="true">{config.icon}</span>
        {heading}
      </p>
      <div className="text-sm leading-relaxed text-muted-foreground [&>ul]:my-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:my-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ul>li]:my-1.5 [&>ol>li]:my-1.5 [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul>li>strong]:text-foreground [&>ol>li>strong]:text-foreground">
        {children}
      </div>
    </aside>
  );
};

export default Callout;
