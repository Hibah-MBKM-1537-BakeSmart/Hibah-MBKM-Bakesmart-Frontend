import type React from "react";
import { Poppins, Inter } from "next/font/google";
import { AdminSidebar } from "@/components/adminPage";
import { AdminHeader } from "@/components/adminPage";
import { AdminProvider } from "@/app/contexts/AdminContext";
import { CategoriesProvider } from "@/app/contexts/CategoriesContext";
import { ProductsProvider } from "@/app/contexts/ProductsContext";
import { VouchersProvider } from "@/app/contexts/VouchersContext";
import { StatisticsProvider } from "@/app/contexts/StatisticsContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <CategoriesProvider>
        <ProductsProvider>
          <VouchersProvider>
            <StatisticsProvider>
              <div
                className={`flex h-screen ${poppins.variable} ${inter.variable}`}
                style={{
                  backgroundColor: "#f5f1eb",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                {/* Sidebar */}
                <AdminSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Header */}
                  <AdminHeader />

                  {/* Page Content */}
                  <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-7xl mx-auto">{children}</div>
                  </main>
                </div>
              </div>
            </StatisticsProvider>
          </VouchersProvider>
        </ProductsProvider>
      </CategoriesProvider>
    </AdminProvider>
  );
}
