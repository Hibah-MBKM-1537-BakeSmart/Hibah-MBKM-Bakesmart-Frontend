"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Phone, Mail } from "lucide-react";
import { useTranslation } from "@/app/contexts/TranslationContext";

export function Footer() {
  const { t } = useTranslation();

  const footerData = {
    brand: {
      name: t("footer.brandName"),
      logo: "/img/logo.png",
      slogan: t("footer.slogan"),
    },
    social: [
      { icon: Facebook, href: "#", label: "Facebook" },
      { icon: Instagram, href: "#", label: "Instagram" },
      { icon: Phone, href: "#", label: "WhatsApp" },
      { icon: Mail, href: "#", label: "Email" },
    ],
    tentangKami: {
      title: t("footer.aboutUs"),
      info: [
        "(456) 789-12301",
        "info@modrino.co.uk",
        "South 13th street",
        "New York, America",
      ],
    },
    jelajahi: {
      title: t("footer.explore"),
      links: [
        { name: t("footer.home"), href: "/" },
        { name: t("footer.topProducts"), href: "/top-produk" },
        { name: t("footer.menu"), href: "/menu" },
        { name: t("footer.aboutUsPage"), href: "/tentang-kami" },
      ],
    },
    infoTerbaru: {
      title: t("footer.latestInfo"),
      posts: [
        {
          img: "/img/pastry1.jpg",
          date: "June 14, 2024",
          text: "Puff pastry bliss.",
        },
        {
          img: "/img/pastry2.jpg",
          date: "June 14, 2024",
          text: "Croissant delight.",
        },
      ],
    },
  };

  return (
    <footer className="bg-[#9B6D49] text-white pt-10 pb-6">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        {/* Bagian atas: Logo + Social Media */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white pb-6 mb-8">
          {/* Logo + Nama */}
          <div className="flex items-center gap-4 mb-6 md:mb-0">
            <Image
              src={footerData.brand.logo || "/placeholder.svg"}
              alt={`${footerData.brand.name} Logo`}
              width={80}
              height={75}
            />
            <span className="text-2xl font-semibold tracking-widest font-[Poppins,sans-serif]">
              {footerData.brand.name}
            </span>
          </div>

          {/* Social Media */}
          <div className="flex items-center gap-6">
            <span className="text-white text-sm">
              {t("footer.followUsText")}
            </span>
            <div className="flex gap-4">
              {footerData.social.map((item, idx) => (
                <Link key={idx} href={item.href} aria-label={item.label}>
                  <item.icon className="w-6 h-6 hover:text-gray-200" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bagian bawah: 3 Kolom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Kolom 1: Tentang Kami */}
          <div>
            <h3 className="font-semibold text-lg mb-4">
              {footerData.tentangKami.title}
            </h3>
            {footerData.tentangKami.info.map((text, idx) => (
              <p key={idx} className="text-sm mb-2">
                {text}
              </p>
            ))}
          </div>

          {/* Kolom 2: Jelajahi */}
          <div>
            <h3 className="font-semibold text-lg mb-4">
              {footerData.jelajahi.title}
            </h3>
            <ul className="space-y-2">
              {footerData.jelajahi.links.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="hover:underline">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Info Terbaru */}
          <div>
            <h3 className="font-semibold text-lg mb-4">
              {footerData.infoTerbaru.title}
            </h3>
            {footerData.infoTerbaru.posts.map((post, idx) => (
              <div key={idx} className="flex items-center gap-4 mb-4">
                <Image
                  src={post.img || "/placeholder.svg"}
                  alt={post.text}
                  width={60}
                  height={60}
                  className="rounded-md object-cover"
                />
                <div>
                  <p className="text-xs text-gray-200">{post.date}</p>
                  <p className="text-sm">{post.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 text-center text-sm text-gray-200">
          © {new Date().getFullYear()} {footerData.brand.name}.{" "}
          {t("footer.allRightsReserved")}.
        </div>
      </div>
    </footer>
  );
}
