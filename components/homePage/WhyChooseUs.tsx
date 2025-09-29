"use client";

import type * as React from "react";
import { useTranslation } from "@/app/contexts/TranslationContext";

export function WhyChooseUs() {
  const { t } = useTranslation();

  const features = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v20" />
          <path d="M8 5c0 4-2 7-2 11 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-4-2-7-2-11" />
          <path d="M12 2L8 5l4-1 4 1-4-3z" />
        </svg>
      ),
      title: t("whyChoose.qualityIngredients.title"),
      description: t("whyChoose.qualityIngredients.desc"),
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      title: t("whyChoose.authenticTaste.title"),
      description: t("whyChoose.authenticTaste.desc"),
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
      title: t("whyChoose.competitivePrice.title"),
      description: t("whyChoose.competitivePrice.desc"),
    },
  ];

  // --- Komponen untuk satu item/card ---
  // Memecah UI menjadi komponen kecil seperti ini adalah praktik yang baik
  function FeatureCard({
    icon,
    title,
    description,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }) {
    return (
      <div className="flex flex-col items-center space-y-4 rounded-lg bg-white p-8 text-center shadow-lg transition-shadow hover:shadow-xl">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: "#F5F1EB", color: "#5D4037" }}
        >
          {icon}
        </div>
        <h3
          className="font-serif text-xl font-bold"
          style={{ color: "#5D4037" }}
        >
          {title}
        </h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    );
  }

  return (
    <section
      className="w-full py-16 md:py-24"
      style={{ backgroundColor: "#F5F1EB" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        {/* --- Bagian Judul --- */}
        <div className="mb-12 md:mb-16 flex items-center justify-center gap-4 md:gap-8">
          <div
            className="h-px flex-grow max-w-32 md:max-w-none"
            style={{ backgroundColor: "#8B6F47" }}
          />
          <h2
            className="text-center font-serif text-2xl md:text-3xl lg:text-4xl font-bold whitespace-nowrap"
            style={{ color: "#5D4037" }}
          >
            {t("whyChoose.title")}
          </h2>
          <div
            className="h-px flex-grow max-w-32 md:max-w-none"
            style={{ backgroundColor: "#8B6F47" }}
          />
        </div>

        {/* --- Grid 3 Kolom --- */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
