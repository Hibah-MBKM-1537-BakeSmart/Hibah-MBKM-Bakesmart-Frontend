"use client";

import Image from "next/image";
import { useTranslation } from "@/app/contexts/TranslationContext";

// --- Chef Profile Component ---
function ChefProfile({
  nameKey,
  descriptionKey,
  image,
  isReversed = false,
}: {
  nameKey: string;
  descriptionKey: string;
  image: string;
  isReversed?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-start ${
        isReversed ? "md:grid-flow-col-dense" : ""
      }`}
    >
      <div className={`${isReversed ? "md:col-start-2" : ""}`}>
        <Image
          src={image || "/placeholder.svg"}
          alt={t(nameKey)}
          width={300}
          height={300}
          className="w-full h-auto rounded-lg shadow-lg"
        />
        <h3
          className="mt-4 text-center font-serif text-xl font-bold"
          style={{ color: "#5D4037" }}
        >
          {t(nameKey)}
        </h3>
      </div>
      <div className={`${isReversed ? "md:col-start-1" : ""}`}>
        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
          {t(descriptionKey)}
        </p>
      </div>
    </div>
  );
}

// --- Main Component ---
export function AboutUs() {
  const { t } = useTranslation();

  // Data untuk chef profiles
  const chefProfiles = [
    {
      nameKey: "aboutUs.chef1.name",
      descriptionKey: "aboutUs.chef1.description",
      image: "/professional-baker-in-apron-with-bakery-background.jpg",
    },
    {
      nameKey: "aboutUs.chef2.name",
      descriptionKey: "aboutUs.chef2.description",
      image: "/chef-with-bread-shelves-background-in-bakery.jpg",
    },
  ];

  // Data untuk proud bakers images
  const proudBakersImages = [
    "/baker-kneading-dough-in-traditional-bakery.jpg",
    "/baker-arranging-bread-on-shelves.jpg",
    "/baker-in-white-uniform-working-in-bakery.jpg",
  ];

  return (
    <div className="w-full" style={{ backgroundColor: "#F5F1EB" }}>
      {/* Header Section */}
      <div className="w-full py-8" style={{ backgroundColor: "#8B6F47" }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <h1 className="text-center font-serif text-3xl md:text-4xl font-bold text-white">
            {t("about.title")}
          </h1>
        </div>
      </div>

      {/* Chefs Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="space-y-16 md:space-y-24">
            {chefProfiles.map((chef, index) => (
              <ChefProfile
                key={chef.nameKey}
                nameKey={chef.nameKey}
                descriptionKey={chef.descriptionKey}
                image={chef.image}
                isReversed={index % 2 === 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Authenticity Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          {/* Title */}
          <h2
            className="text-center font-serif text-2xl md:text-3xl lg:text-4xl font-bold mb-16"
            style={{ color: "#5D4037" }}
          >
            {t("about.description")}
          </h2>

          {/* Quote and Image Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
            <div className="order-2 lg:order-1">
              <Image
                src="/bread-shelves-in-traditional-bakery.jpg"
                alt={t("about.title")}
                width={400}
                height={500}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <blockquote
                className="font-serif text-2xl md:text-3xl font-bold mb-8"
                style={{ color: "#5D4037" }}
              >
                "{t("aboutUs.chefQuote")}"
              </blockquote>
            </div>
          </div>

          {/* Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <h3
                className="font-serif text-xl md:text-2xl font-bold mb-6"
                style={{ color: "#5D4037" }}
              >
                {t("aboutUs.authenticity.title")}
              </h3>
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
                {t("aboutUs.authenticity.description")
                  .split("\\n\\n")
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Image
                src="/traditional-bread-loaves-stacked.jpg"
                alt={t("menu.categories.bread")}
                width={200}
                height={300}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Proud Bakers Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <h2
            className="text-center font-serif text-2xl md:text-3xl font-bold mb-12"
            style={{ color: "#5D4037" }}
          >
            {t("aboutUs.proudBakers")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {proudBakersImages.map((image, index) => (
              <div key={index} className="flex justify-center">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${t("aboutUs.baker")} ${index + 1}`}
                  width={200}
                  height={200}
                  className="rounded-lg shadow-lg w-full max-w-xs h-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
