import type React from "react";
import { Poppins, Inter } from "next/font/google";
import { AdminTranslationProvider } from "@/app/contexts/AdminTranslationContext";
import AdminAuthWrapper from "./AdminAuthWrapper";
import { AdminProvider } from "@/app/contexts/AdminContext";
import { AdminProvider as UsersProvider } from "@/app/contexts/UsersContext";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { ToastProvider } from "@/app/contexts/ToastContext";
import { CategoriesProvider } from "@/app/contexts/CategoriesContext";
import { ProductsProvider } from "@/app/contexts/ProductsContext";
import { CustomersProvider } from "@/app/contexts/CustomersContext";
import { JenisProvider } from "@/app/contexts/JenisContext";
import { SubJenisProvider } from "@/app/contexts/SubJenisContext";

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
        <UsersProvider>
          <CategoriesProvider>
            <JenisProvider>
              <SubJenisProvider>
                <ProductsProvider>
                  <CustomersProvider>
                    <AdminTranslationProvider>
                      <ToastProvider>
                        <div
                          className={`${poppins.variable} ${inter.variable}`}
                          style={{ fontFamily: "var(--font-inter), sans-serif" }}
                        >
                          <AdminAuthWrapper>{children}</AdminAuthWrapper>
                        </div>
                      </ToastProvider>
                    </AdminTranslationProvider>
                  </CustomersProvider>
                </ProductsProvider>
              </SubJenisProvider>
            </JenisProvider>
          </CategoriesProvider>
        </UsersProvider>
      </AdminProvider>
    </AuthProvider>
  );
}
