"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu, ShoppingCart, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/contexts/CartContext";
import { useTranslation } from "@/app/contexts/TranslationContext";

// Komponen Logo (bisa diganti dengan komponen logo Anda sendiri atau tag <img>)
const Logo = () => (
  <Image
    src="/img/logo.png" // simpan file di folder public/logo.png
    alt="Merpati Bakery Logo"
    width={80}
    height={75}
    priority
  />
);

export function Navbar() {
  const pathname = usePathname();
  const { getTotalItems, showCartAnimation } = useCart();
  const { t, language, setLanguage } = useTranslation();
  const totalItems = getTotalItems();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    {
      href: "/",
      label: t("nav.home"),
    },
    {
      href: "/menu",
      label: t("nav.menu"),
    },
    {
      href: "/contact",
      label: t("nav.contact"),
    },
  ];

  const toggleLanguage = () => {
    setLanguage(language === "id" ? "en" : "id");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#9B6D49] backdrop-blur supports-[backdrop-filter]:bg-[#9B6D49]/90 p-1.5">
      <div className="flex h-20 items-center justify-between px-4 md:pr-36">
        {/* Sisi Kiri: Logo & Nama Brand */}
        <a href="/" className="flex items-center gap-2 md:gap-4">
          <Logo />
          <span
            className="
          text-white font-medium
          text-[18px] leading-[28px] tracking-[3px]  /* mobile */
          sm:text-[20px] sm:leading-[30px] sm:tracking-[5px] /* ≥640px */
          md:text-[24px] md:leading-[36px] md:tracking-[7px] /* ≥768px */
          lg:text-[30px] lg:leading-[45px] lg:tracking-[9px] /* ≥1024px */
          font-[Poppins,sans-serif]
        "
          >
            Merpati Bakery
          </span>
        </a>

        {/* Sisi Kanan (Desktop): Navigasi & Ikon Keranjang */}
        <div className="hidden lg:flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent hover:bg-transparent focus:bg-transparent shadow-none text-center text-[18px] font-[Poppins,sans-serif]",
                      pathname === link.href
                        ? "text-[#4A1D1F] font-bold"
                        : "text-white font-normal"
                    )}
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="w-px h-6 bg-border mx-2" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            aria-label="Switch Language"
            className="relative text-white hover:bg-white/20 rounded-full"
          >
            <Globe className="h-5 w-5" />
            <span className="absolute -bottom-1 -right-1 text-xs font-bold">
              {language.toUpperCase()}
            </span>
          </Button>

          <Link href="/order">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Keranjang Belanja"
              className={`relative transition-all duration-300 ${
                showCartAnimation ? "animate-bounce bg-white/20" : ""
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Tombol Menu Mobile */}
        <div className="lg:hidden flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            aria-label="Switch Language"
            className="relative rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <Globe className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 text-xs font-bold">
              {language.toUpperCase()}
            </span>
          </Button>

          <Link href="/order">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Keranjang Belanja"
              className={`relative rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 ${
                showCartAnimation ? "animate-bounce bg-white/40" : ""
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Buka Menu"
                className="rounded-full bg-white/20 hover:bg-white/30 text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-[#9B6D49] text-white border-b border-[#7b5235]"
            >
              <SheetHeader>
                <SheetTitle className="text-left">
                  <a href="/" className="flex items-center gap-2">
                    <Logo />
                    <span className="text-white font-medium text-lg">
                      Merpati Bakery
                    </span>
                  </a>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-md p-3 font-medium text-white hover:bg-[#7b5235]"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
