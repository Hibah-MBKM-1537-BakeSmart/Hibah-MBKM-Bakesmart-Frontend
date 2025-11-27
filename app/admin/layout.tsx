import type React from "react";
import { Poppins, Inter } from "next/font/google";
import { AdminProvider } from "@/app/contexts/AdminContext";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { AdminTranslationProvider } from "@/app/contexts/AdminTranslationContext";
import AdminAuthWrapper from "./AdminAuthWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminProvider>
        <AdminTranslationProvider>
          <div
            className={`${poppins.variable} ${inter.variable}`}
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            <AdminAuthWrapper>{children}</AdminAuthWrapper>
          </div>
        </AdminTranslationProvider>
      </AdminProvider>
    </AuthProvider>
  );
}
