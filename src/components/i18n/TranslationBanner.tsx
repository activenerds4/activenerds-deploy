/**
 * Translation banner — shows available translations for an article.
 *
 * Displayed at the top of an article when translations are available.
 * Shows links to each translated version with the locale's native name.
 */

import { Link } from "react-router-dom";
import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { ArticleTranslation } from "@/lib/i18n/translations";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

interface TranslationBannerProps {
  translations: ArticleTranslation[];
}

export function TranslationBanner({ translations }: TranslationBannerProps) {
  const { t, locale: currentUiLocale } = useI18n();

  // Filter out the currently-viewed translation
  const otherTranslations = translations.filter((tr) => !tr.isCurrent);

  if (otherTranslations.length === 0) return null;

  return (
    <div
      className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm"
      role="region"
      aria-label={t("article.translations")}
    >
      <Languages className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="text-muted-foreground">{t("article.translations")}</span>
      <div className="flex flex-wrap gap-1.5">
        {otherTranslations.map((tr) => {
          const path =
            tr.locale === DEFAULT_LOCALE ? `/blog/${tr.slug}` : `/${tr.locale}/blog/${tr.slug}`;
          const isCurrentUi = tr.locale === currentUiLocale;
          return (
            <Link
              key={tr.locale}
              to={path}
              className={`rounded-md px-2 py-0.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                isCurrentUi
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent/50"
              }`}
            >
              {tr.nativeName}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default TranslationBanner;
