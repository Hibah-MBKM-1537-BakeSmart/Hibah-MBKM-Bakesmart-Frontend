"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type AdminLanguage =
  | "id"
  | "en"
  | "es"
  | "fr"
  | "de"
  | "zh"
  | "ja"
  | "ko"
  | "th";

interface AdminTranslationContextType {
  language: AdminLanguage;
  setLanguage: (lang: AdminLanguage) => void;
  tAdmin: (text: string) => Promise<string>;
  tAdminSync: (text: string) => string;
  clearCache: () => void;
}

const AdminTranslationContext = createContext<
  AdminTranslationContextType | undefined
>(undefined);

const translationCache = new Map<string, Map<AdminLanguage, string>>();

export function AdminTranslationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<AdminLanguage>("id");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "adminLanguage"
    ) as AdminLanguage | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = useCallback((lang: AdminLanguage) => {
    setLanguage(lang);
    localStorage.setItem("adminLanguage", lang);
  }, []);

  const tAdmin = useCallback(
    async (text: string): Promise<string> => {
      if (language === "id") {
        return text;
      }

      // Check cache dulu
      if (translationCache.has(text)) {
        const cached = translationCache.get(text);
        if (cached?.has(language)) {
          return cached.get(language)!;
        }
      }

      try {
        setIsLoading(true);
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetLanguage: language }),
        });

        if (!response.ok) {
          console.error("[v0] Translation failed:", response.statusText);
          return text;
        }

        const data = await response.json();
        const translatedText = data.translatedText || text;

        // Simpan ke cache
        if (!translationCache.has(text)) {
          translationCache.set(text, new Map());
        }
        translationCache.get(text)!.set(language, translatedText);

        return translatedText;
      } catch (error) {
        console.error("[v0] Translation error:", error);
        return text;
      } finally {
        setIsLoading(false);
      }
    },
    [language]
  );

  const tAdminSync = useCallback(
    (text: string): string => {
      if (language === "id") {
        return text;
      }

      if (translationCache.has(text)) {
        const cached = translationCache.get(text);
        if (cached?.has(language)) {
          return cached.get(language)!;
        }
      }

      return text; // Return original sambil loading di background
    },
    [language]
  );

  const clearCache = useCallback(() => {
    translationCache.clear();
  }, []);

  return (
    <AdminTranslationContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        tAdmin,
        tAdminSync,
        clearCache,
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
