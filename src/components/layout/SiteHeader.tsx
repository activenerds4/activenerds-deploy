import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { IconButton } from "@/components/ui/IconButton";
import ThemeToggle from "@/components/ui/ThemeToggle";
import SearchButton from "@/components/ui/SearchButton";
import VisuallyHidden from "@/components/ui/VisuallyHidden";
import MobileNavigation from "./MobileNavigation";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { cn } from "@/lib/utils";
import { navigationConfig, getEnabledNavItems, hasDropdown } from "@/lib/config/navigation";
import { MegaMenu } from "./MegaMenu";
import { ActiveNerdsMark } from "@/components/brand/ActiveNerdsMark";
import NavbarEventsTicker from "./NavbarEventsTicker";

const enabledNavItems = getEnabledNavItems();
const headerCta = navigationConfig.cta;

/**
 * Site header with config-driven desktop navigation, mega-menu dropdowns,
 * theme toggle, search trigger, and language selector.
 * The mobile menu is rendered via MobileNavigation (client-side dialog).
 */
const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = () => setMobileOpen(false);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Return focus to the toggle button when the menu closes
  useEffect(() => {
    if (!mobileOpen) {
      toggleRef.current?.focus();
    }
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / site name */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 font-sans text-lg sm:text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-md"
          aria-label={`${siteConfig.name} home`}
        >
          <ActiveNerdsMark title={`${siteConfig.name} logo`} className="h-7 w-7 transition-transform group-hover:scale-105" />
          <div className="flex items-center gap-2">
            <span>{siteConfig.name}</span>
            <span className="hidden sm:inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-accent">
              DevHub
            </span>
          </div>
        </Link>

        {/* Desktop nav — config-driven */}
        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Primary">
          {enabledNavItems.map((item) =>
            hasDropdown(item) ? (
              <MegaMenu key={item.id} item={item} />
            ) : (
              <NavLink
                key={item.id}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    isActive
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        {/* Desktop controls */}
        <div className="hidden items-center gap-2 md:flex">
          <NavbarEventsTicker />
          <SearchButton variant="expanded" />
          {headerCta && (
            <Link
              to={headerCta.href}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-xs transition-all hover:bg-accent/90 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ring"
            >
              {headerCta.label}
            </Link>
          )}
          <LanguageSelector />
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <SearchButton />
          <ThemeToggle />
          <IconButton
            ref={toggleRef}
            variant="ghost"
            size="sm"
            label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
            <VisuallyHidden>{mobileOpen ? "Close menu" : "Open menu"}</VisuallyHidden>
          </IconButton>
        </div>
      </div>

      {/* Mobile navigation panel */}
      <MobileNavigation open={mobileOpen} onClose={closeMenu} />
    </header>
  );
};

export default SiteHeader;
