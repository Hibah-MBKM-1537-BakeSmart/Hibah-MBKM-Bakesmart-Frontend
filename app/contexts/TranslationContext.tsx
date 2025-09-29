"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { commonTranslations } from "../translations/common";
import { navigationTranslations } from "../translations/navigation";
import { homeTranslations } from "../translations/home";
import { menuTranslations } from "../translations/menu";
import { orderTranslations } from "../translations/order";
import { footerTranslations } from "../translations/footer";

export type Language = "id" | "en";

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

const translations = {
  id: {
    ...commonTranslations.id,
    ...navigationTranslations.id,
    ...homeTranslations.id,
    ...menuTranslations.id,
    ...orderTranslations.id,
    ...footerTranslations.id,
  },
  en: {
    ...commonTranslations.en,
    ...navigationTranslations.en,
    ...homeTranslations.en,
    ...menuTranslations.en,
    ...orderTranslations.en,
    ...footerTranslations.en,
  },
};

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("id");

  const t = (key: string): string => {
    return (
      translations[language][key as keyof (typeof translations)["id"]] || key
    );
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
