import type React from "react";
import { Poppins, Inter } from "next/font/google";
import { AdminTranslationProvider } from "@/app/contexts/AdminTranslationContext";
import AdminAuthWrapper from "./AdminAuthWrapper";
import { AdminProvider } from "@/app/contexts/AdminContext";
import { AdminProvider as UsersProvider } from "@/app/contexts/UsersContext";
import { AuthProvider } from "@/app/contexts/AuthContext";
// import { ToastProvider } from "@/app/contexts/ToastContext";
import { CategoriesProvider } from "@/app/contexts/CategoriesContext";
import { CustomersProvider } from "@/app/contexts/CustomersContext";
import { JenisProvider } from "@/app/contexts/JenisContext";
import { SubJenisProvider } from "@/app/contexts/SubJenisContext";
import { ProductProvider } from "@/app/contexts/ProductsContext";
import { AppAlertProvider } from "@/components/AppAlert";

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
    <AppAlertProvider>
      <AuthProvider>
        <AdminProvider>
          <UsersProvider>
            <CategoriesProvider>
              <JenisProvider>
                <SubJenisProvider>
                  <ProductProvider>
                    <CustomersProvider>
                      <AdminTranslationProvider>
                          <div
                            className={`${poppins.variable} ${inter.variable}`}
                            style={{ fontFamily: "var(--font-inter), sans-serif" }}
                          >
                            <AdminAuthWrapper>{children}</AdminAuthWrapper>
                          </div>
                      </AdminTranslationProvider>
                    </CustomersProvider>
                  </ProductProvider>
                </SubJenisProvider>
              </JenisProvider>
            </CategoriesProvider>
          </UsersProvider>
        </AdminProvider>
      </AuthProvider>
    </AppAlertProvider>
  );
}
