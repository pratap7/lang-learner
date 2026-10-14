"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import enTranslations from "./locales/en.json";
import deTranslations from "./locales/de.json";
import esTranslations from "./locales/es.json";
import arTranslations from "./locales/ar.json";

export type SupportedLocale = "en" | "de" | "es" | "ar";

export interface LocaleMeta {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleMeta[] = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr", flag: "🇬🇧" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr", flag: "🇩🇪" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr", flag: "🇪🇸" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl", flag: "🇦🇪" },
];

const TRANSLATIONS: Record<SupportedLocale, Record<string, any>> = {
  en: enTranslations,
  de: deTranslations,
  es: esTranslations,
  ar: arTranslations,
};

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  dir: "ltr" | "rtl";
  isRtl: boolean;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
  availableLocales: LocaleMeta[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = "deutschpfad_preferred_locale_v1";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");

  // Restore preferred locale on client mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as SupportedLocale;
      if (saved && TRANSLATIONS[saved]) {
        setLocaleState(saved);
      } else {
        // Detect browser language
        const browserLang = navigator.language?.split("-")[0]?.toLowerCase();
        if (browserLang && (browserLang === "de" || browserLang === "es" || browserLang === "ar")) {
          setLocaleState(browserLang as SupportedLocale);
        }
      }
    } catch {}
  }, []);

  const currentMeta = useMemo(() => {
    return SUPPORTED_LOCALES.find((l) => l.code === locale) || SUPPORTED_LOCALES[0];
  }, [locale]);

  const dir = currentMeta.dir;
  const isRtl = dir === "rtl";

  // Sync document language & text direction
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;

    if (isRtl) {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {}
  }, [locale, dir, isRtl]);

  const setLocale = (newLocale: SupportedLocale) => {
    if (TRANSLATIONS[newLocale]) {
      setLocaleState(newLocale);
    }
  };

  /**
   * Type-safe key resolver with fallback to English and parameter interpolation
   * e.g. t('exercise.heartsRemaining', { count: 3 })
   */
  const t = useCallback(
    (keyPath: string, params?: Record<string, string | number>): string => {
      const resolvePath = (obj: any, path: string) => {
        return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
      };

      // Try active locale, fallback to English
      let value = resolvePath(TRANSLATIONS[locale], keyPath);
      if (value === undefined) {
        value = resolvePath(TRANSLATIONS.en, keyPath);
      }

      if (typeof value !== "string") {
        return keyPath; // Fallback to raw key string if not found
      }

      // Parameter replacement {param}
      if (params) {
        return Object.entries(params).reduce((str, [k, v]) => {
          return str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }, value);
      }

      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        dir,
        isRtl,
        t,
        availableLocales: SUPPORTED_LOCALES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Safe fallback if used outside provider
    return {
      locale: "en" as SupportedLocale,
      setLocale: () => {},
      dir: "ltr" as const,
      isRtl: false,
      t: (k: string) => k,
      availableLocales: SUPPORTED_LOCALES,
    };
  }
  return context;
}
