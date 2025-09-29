"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/app/contexts/TranslationContext";

export function Advertisement() {
  const { t } = useTranslation();

  const AdvertisementData = {
    title: t("advertisement.title"),
    ctaText: t("advertisement.cta"),
    ctaLink: "/menu",
    backgroundImage: "/delicious-bread-and-pastries-on-wooden-table-with-.jpg",
  };

  return (
    <section className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={
            AdvertisementData.backgroundImage ||
            "/placeholder.svg?height=400&width=1200&query=bread and pastries on wooden table with wheat" ||
            "/placeholder.svg"
          }
          alt="Bread and pastries advertisement background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
            {/* Title */}
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white max-w-4xl leading-tight">
              {AdvertisementData.title}
            </h2>

            {/* CTA Button */}
            <Button
              asChild
              size="lg"
              className="px-8 py-4 text-base md:text-lg font-bold text-white hover:opacity-90 transition-opacity shadow-lg"
              style={{ backgroundColor: "#8B6F47" }}
            >
              <Link href={AdvertisementData.ctaLink}>
                {AdvertisementData.ctaText}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
