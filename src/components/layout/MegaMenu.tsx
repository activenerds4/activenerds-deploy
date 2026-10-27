import { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import VisuallyHidden from "@/components/ui/VisuallyHidden";
import type { NavItem, NavChildItem, NavMenuGroup } from "@/lib/config/navigation";

/* ── Badge component ────────────────────────────────────────────────────── */

function NavBadge({ variant, text }: { variant: "new" | "beta" | "hot"; text: string }) {
  const styles: Record<string, string> = {
    new: "bg-accent/15 text-accent border-accent/30",
    beta: "bg-secondary text-secondary-foreground border-border",
    hot: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <span
      className={cn(
        "ml-1.5 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        styles[variant],
      )}
    >
      {text}
    </span>
  );
}

/* ── Mega-Menu Panel ───────────────────────────────────────────────────── */

function MegaMenuPanel({
  item,
  isOpen,
  onClose,
}: {
  item: NavItem;
  isOpen: boolean;
  onClose: () => void;
}) {
  // Build groups: explicit groups take priority, otherwise use children as a single group
  const menuGroups: NavMenuGroup[] = item.groups
    ? item.groups
    : item.children
      ? [{ label: item.label, items: item.children }]
      : [];

  // Don't render anything if no groups
  if (!menuGroups.length) return null;

  return (
    <div
      className={cn(
        "absolute left-0 top-full z-50 pt-1 transition-all duration-150",
        isOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0",
      )}
      role="menu"
      aria-hidden={!isOpen}
    >
      <div
        className="overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        style={{ minWidth: menuGroups.length > 1 ? "560px" : "240px" }}
      >
        {/* Multi-column grid for grouped links */}
        {menuGroups.length > 1 && (
          <div className="grid grid-cols-2 gap-0">
            {menuGroups.map((group) => (
              <div key={group.label} className="p-4">
                <h3 className="eyebrow mb-2.5">{group.label}</h3>
                <nav aria-label={group.label} className="space-y-0.5">
                  {group.items.map((child) => (
                    <MegaMenuLink key={child.href} child={child} onClose={onClose} />
                  ))}
                </nav>
              </div>
            ))}
          </div>
        )}

        {/* Single-column layout for 1 group */}
        {menuGroups.length === 1 && (
          <div className="p-2">
            <nav aria-label={menuGroups[0].label} className="space-y-0.5">
              {menuGroups[0].items.map((child) => (
                <MegaMenuLink key={child.href} child={child} onClose={onClose} />
              ))}
            </nav>
          </div>
        )}

        {/* Promo card (shown in multi-column mode) */}
        {item.promo && menuGroups.length > 1 && (
          <Link
            to={item.promo.href}
            onClick={onClose}
            className="flex items-center justify-between gap-3 border-t border-border bg-secondary/50 px-5 py-3.5 transition-colors hover:bg-secondary"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{item.promo.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.promo.description}</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-accent">
              {item.promo.ctaLabel}
              <ArrowRight className="h-3 w-3" aria-hidden />
            </span>
          </Link>
        )}

        {/* View all link */}
        {item.viewAll && (
          <div className="border-t border-border px-4 py-2">
            <Link
              to={item.viewAll.href}
              onClick={onClose}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.viewAll.label} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Cascading Mega-Menu Panel ─────────────────────────────────────────── */

function CascadingMegaMenuPanel({
  item,
  isOpen,
  onClose,
}: {
  item: NavItem;
  isOpen: boolean;
  onClose: () => void;
}) {
  const menuGroups: NavMenuGroup[] = item.groups || [];
  const browseGroup = menuGroups.find((g) => g.label.toLowerCase() === "browse") || menuGroups[0];
  const categoryGroups = menuGroups.filter((g) => g !== browseGroup);

  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(0);

  useEffect(() => {
    if (!isOpen) {
      setActiveCategoryIndex(0);
    }
  }, [isOpen]);

  if (!menuGroups.length) return null;

  const activeGroup = activeCategoryIndex !== null ? categoryGroups[activeCategoryIndex] : null;

  return (
    <div
      className={cn(
        "absolute left-0 top-full z-50 pt-1 transition-all duration-150",
        isOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0",
      )}
      role="menu"
      aria-hidden={!isOpen}
    >
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xl flex min-w-[620px] max-w-[780px]">
        {/* Left Side: Categories column */}
        <div className="w-[260px] flex-shrink-0 border-r border-border bg-muted/20 p-3 space-y-4">
          {browseGroup && (
            <div>
              <h3 className="eyebrow mb-2 px-2">{browseGroup.label}</h3>
              <div className="space-y-1">
                {browseGroup.items.map((child) => (
                  <MegaMenuLink key={child.href} child={child} onClose={onClose} />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="eyebrow mb-2 px-2">Categories</h3>
            <div className="space-y-1" role="tablist">
              {categoryGroups.map((group, idx) => {
                const isActive = activeCategoryIndex === idx;
                return (
                  <button
                    key={group.label}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategoryIndex(idx)}
                    onMouseEnter={() => setActiveCategoryIndex(idx)}
                    className={cn(
                      "w-full flex items-center justify-between text-left rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                      isActive
                        ? "bg-accent/15 text-accent font-semibold"
                        : "text-foreground hover:bg-accent/10 hover:text-foreground",
                    )}
                  >
                    <span className="truncate pr-2">{group.label}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {group.items.length}
                      </span>
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          isActive ? "text-accent translate-x-0.5" : "text-muted-foreground",
                        )}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Cascading sub-menu items */}
        <div className="flex-1 p-4 bg-card min-h-[320px] flex flex-col justify-between">
          {activeGroup ? (
            <div>
              <div className="mb-3 border-b border-border pb-2.5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{activeGroup.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeGroup.items.length} interactive utilities available
                  </p>
                </div>
                <span className="text-[11px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                  Select item
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1 max-h-[380px] overflow-y-auto pr-1">
                {activeGroup.items.map((child) => (
                  <MegaMenuLink key={child.href} child={child} onClose={onClose} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
              <p className="text-sm font-medium">Select a category on the left to view items</p>
            </div>
          )}

          {item.viewAll && (
            <div className="border-t border-border pt-3 mt-4">
              <Link
                to={item.viewAll.href}
                onClick={onClose}
                className="text-xs font-semibold text-accent flex items-center gap-1 hover:underline"
              >
                {item.viewAll.label} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Individual mega-menu link ──────────────────────────────────────────── */

function MegaMenuLink({ child, onClose }: { child: NavChildItem; onClose: () => void }) {
  if (child.external) {
    return (
      <a
        href={child.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="block rounded-md px-3 py-2 transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span className="block text-sm font-medium text-foreground">{child.label}</span>
        {child.description && (
          <span className="block text-xs text-muted-foreground">{child.description}</span>
        )}
      </a>
    );
  }

  return (
    <NavLink
      to={child.href}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          "block rounded-md px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          isActive ? "bg-accent/10 text-accent" : "hover:bg-accent/50",
        )
      }
    >
      <span className="block text-sm font-medium text-foreground">{child.label}</span>
      {child.description && (
        <span className="block text-xs text-muted-foreground">{child.description}</span>
      )}
    </NavLink>
  );
}

/* ── Main MegaMenu trigger + panel ──────────────────────────────────────── */

export function MegaMenu({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const openMenu = useCallback(() => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    setOpen(false);
  }, []);

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(openMenu, 50);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    leaveTimeoutRef.current = setTimeout(() => setOpen(false), 200);
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, closeMenu]);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };
    const id = requestAnimationFrame(() => {
      document.addEventListener("mousedown", handleClickOutside);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, closeMenu]);

  return (
    <div className="relative group" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
          open
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <NavLink
          to={item.href}
          end
          className={({ isActive }) =>
            cn(
              "flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-ring rounded-sm",
              isActive ? "text-foreground font-semibold" : "",
            )
          }
        >
          {item.label}
          {item.badge && <NavBadge variant={item.badge.variant} text={item.badge.text} />}
        </NavLink>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (open ? closeMenu() : openMenu())}
          aria-haspopup="menu"
          aria-expanded={open}
          className="p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring rounded-sm"
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              open && "rotate-180 text-accent",
            )}
            aria-hidden
          />
          <VisuallyHidden>Toggle {item.label} menu</VisuallyHidden>
        </button>
      </div>

      <div ref={panelRef} onMouseEnter={openMenu} onMouseLeave={handleMouseLeave}>
        {item.cascade ? (
          <CascadingMegaMenuPanel item={item} isOpen={open} onClose={closeMenu} />
        ) : (
          <MegaMenuPanel item={item} isOpen={open} onClose={closeMenu} />
        )}
      </div>
    </div>
  );
}

export default MegaMenu;
