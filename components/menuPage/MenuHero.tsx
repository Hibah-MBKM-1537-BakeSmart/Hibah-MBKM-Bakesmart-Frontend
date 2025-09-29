"use client";
import { useTranslation } from "@/app/contexts/TranslationContext";

export function MenuHero() {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 py-16">
      <div className="container mx-auto px-4 text-center">
        <h1
          className="font-serif text-4xl md:text-5xl font-bold mb-4"
          style={{ color: "#5D4037" }}
        >
          {t("menuHero.title")}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          {t("menuHero.description")}
        </p>
      </div>
    </div>
  );
}
