"use client";

import { useTranslation } from "@/app/contexts/TranslationContext";

export function Contact() {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#5D4037]">
          {t("contact.pageTitle")}
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#8B6F47]">
                {t("contact.address")}
              </h3>
              <p className="text-gray-600 mb-6">
                Jl. Raya Bakery No. 123
                <br />
                Jakarta Selatan 12345
                <br />
                Indonesia
              </p>

              <h3 className="text-xl font-semibold mb-4 text-[#8B6F47]">
                {t("contact.phone")}
              </h3>
              <p className="text-gray-600 mb-6">+62 21 1234 5678</p>

              <h3 className="text-xl font-semibold mb-4 text-[#8B6F47]">
                {t("contact.email")}
              </h3>
              <p className="text-gray-600 mb-6">info@merpatibakery.com</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#8B6F47]">
                {t("contact.hours")}
              </h3>
              <div className="text-gray-600">
                <p className="mb-2">
                  {t("day.monday")} - {t("day.friday")}: 07:00 - 21:00
                </p>
                <p className="mb-2">
                  {t("day.saturday")} - {t("day.sunday")}: 08:00 - 22:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
