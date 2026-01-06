"use client";

import { useAdminTranslation } from "@/app/contexts/AdminTranslationContext";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function AdminLanguageSwitcher() {
  const { language, setLanguage, t } = useAdminTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "en", name: "English", flag: "🇬🇧" },
  ] as const;

  const currentLang =
    languages.find((l) => l.code === language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/50 transition-colors"
        style={{ color: "#8b6f47" }}
        title={t("header.selectLanguage")}
        aria-label={t("header.selectLanguage")}
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">
          {currentLang.flag} {currentLang.code.toUpperCase()}
        </span>
      </button>

      {showDropdown && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50"
          style={{ borderColor: "#e0d5c7" }}
        >
          <div className="p-3 border-b" style={{ borderColor: "#e0d5c7" }}>
            <p className="text-sm font-medium" style={{ color: "#5d4037" }}>
              {t("header.selectLanguage")}
            </p>
          </div>
          <div className="py-1 max-h-64 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as any);
                  setShowDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors ${language === lang.code
                    ? "bg-blue-50 font-medium"
                    : "hover:bg-gray-50"
                  }`}
                style={{
                  color: language === lang.code ? "#8b6f47" : "#5d4037",
                }}
              >
                <span>
                  {lang.flag} {lang.name}
                </span>
                {language === lang.code && (
                  <span style={{ color: "#8b6f47" }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
