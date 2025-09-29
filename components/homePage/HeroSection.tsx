"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/app/contexts/TranslationContext";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full" style={{ backgroundColor: "#f5f1eb" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Layout (< 768px) */}
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 py-12 md:hidden">
          {/* Image First on Mobile */}
          <div className="w-full max-w-sm">
            <Image
              src="/img/hero-bread.jpg"
              alt={t("heroSection.breadImageAlt")}
              width={400}
              height={400}
              priority
              className="h-auto w-full rounded-2xl object-cover shadow-2xl"
            />
          </div>

          {/* Text Content */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1
              className="font-serif text-2xl font-bold"
              style={{ color: "#8b6f47" }}
            >
              {t("hero.title")}
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-gray-600 sm:text-base">
              {t("hero.subtitle")}
            </p>

            {/* CTA Buttons - Stacked on Mobile */}
            <div className="flex w-full flex-col gap-3 pt-4">
              <Button
                asChild
                size="lg"
                className="w-full px-6 py-3 text-sm font-medium text-white hover:opacity-90"
                style={{ backgroundColor: "#8b6f47" }}
              >
                <Link href="/menu">{t("hero.cta")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-2 px-6 py-3 text-sm font-medium hover:opacity-90 bg-transparent"
                style={{
                  borderColor: "#8b6f47",
                  color: "#8b6f47",
                  backgroundColor: "transparent",
                }}
              >
                <Link href="/menu">{t("menu.viewAll")}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Tablet & Desktop Layout (>= 768px) */}
        <div className="hidden min-h-screen grid-cols-1 items-center gap-8 py-12 md:grid lg:grid-cols-2 lg:gap-16">
          {/* Text Content - Left Side */}
          <div className="flex flex-col items-start space-y-6 md:items-center md:text-center lg:items-end lg:text-right">
            <div className="space-y-4">
              <h1
                className="font-serif text-3xl font-bold md:text-4xl lg:text-5xl"
                style={{ color: "#8b6f47" }}
              >
                {t("hero.title")}
              </h1>
            </div>

            <p className="max-w-md text-base leading-relaxed text-gray-600 md:max-w-lg md:text-lg">
              {t("hero.subtitle")}
            </p>

            {/* CTA Buttons - Side by Side on Tablet/Desktop */}
            <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="px-8 py-4 text-base font-medium text-white hover:opacity-90"
                style={{ backgroundColor: "#8b6f47" }}
              >
                <Link href="/menu">{t("hero.cta")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 px-8 py-4 text-base font-medium hover:opacity-90 bg-transparent"
                style={{
                  borderColor: "#8b6f47",
                  color: "#8b6f47",
                  backgroundColor: "transparent",
                }}
              >
                <Link href="/menu">{t("menu.viewAll")}</Link>
              </Button>
            </div>
          </div>

          {/* Image - Right Side */}
          <div className="flex items-center justify-center md:justify-start lg:justify-center">
            <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
              <Image
                src="/img/hero-bread.jpg"
                alt={t("heroSection.breadImageAlt")}
                width={600}
                height={600}
                priority
                className="h-auto w-full rounded-2xl object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
