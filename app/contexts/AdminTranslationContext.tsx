"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { adminTranslations, type AdminTranslationKey } from "@/app/translations/admin";

export type AdminLanguage = "id" | "en";

interface AdminTranslationContextType {
  language: AdminLanguage;
  setLanguage: (lang: AdminLanguage) => void;
  t: (key: AdminTranslationKey | string) => string;
}

const AdminTranslationContext = createContext<
  AdminTranslationContextType | undefined
>(undefined);

export function AdminTranslationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] = useState<AdminLanguage>("id");

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("adminLanguage") as AdminLanguage | null;
    if (savedLanguage && (savedLanguage === "id" || savedLanguage === "en")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = useCallback((lang: AdminLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("adminLanguage", lang);
  }, []);

  // Synchronous translation function using static translation files
  const t = useCallback(
    (key: AdminTranslationKey | string): string => {
      const translations = adminTranslations[language];
      const translation = translations[key as keyof typeof translations];

      if (translation) {
        return translation;
      }

      // Fallback: try Indonesian if English key not found
      if (language === "en") {
        const idTranslation = adminTranslations.id[key as keyof typeof adminTranslations.id];
        if (idTranslation) {
          return idTranslation;
        }
      }

      // If key not found, return the key itself (useful for debugging)
      return key;
    },
    [language]
  );

  return (
    <AdminTranslationContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </AdminTranslationContext.Provider>
  );
}

export function useAdminTranslation() {
  const context = useContext(AdminTranslationContext);
  if (context === undefined) {
    throw new Error(
      "useAdminTranslation must be used within AdminTranslationProvider"
    );
  }
  return context;
}
