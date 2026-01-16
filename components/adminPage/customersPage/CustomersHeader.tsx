"use client";

import React from "react";
import { Users, UserCheck, Activity } from "lucide-react";
import { useCustomers } from "../../../app/contexts/CustomersContext";
import { useAdminTranslation } from "../../../app/contexts/AdminTranslationContext";

export default function CustomersHeader() {
  const { t } = useAdminTranslation();
  const { state } = useCustomers();

  // Calculate statistics
  const totalCustomers = state.customers.length;
  const activeMembers = state.customers.filter((c) => c.role === "user").length;
  const activeNow = state.customers.filter((c) => {
    if (!c.lastPurchase) return false;
    const daysSinceLastPurchase = Math.floor(
      (new Date().getTime() - new Date(c.lastPurchase.created_at).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysSinceLastPurchase <= 7; // Active if purchased within last 7 days
  }).length;

  const statisticsCards = [
    {
      titleKey: "customers.totalCustomers",
      value: totalCustomers,
      change: "+2.1%",
      changeType: "positive" as const,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      titleKey: "customers.activeMembers",
      value: activeMembers,
      change: "+5.3%",
      changeType: "positive" as const,
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      titleKey: "customers.activeThisWeek",
      value: activeNow,
      change: "-1.2%",
      changeType: "negative" as const,
      icon: Activity,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="mb-6">
      {/* Page Title */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            {t("customers.title")}
          </h1>
          <p className="text-gray-600 font-inter">
            {t("customers.subtitle")}
          </p>
        </div>

        {/* Action Buttons - Moved to CustomersFilter */}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statisticsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 font-inter">
                    {t(card.titleKey as any)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 font-poppins mt-1">
                    {card.value.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-sm font-medium font-inter ${
                        card.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {card.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1 font-inter">
                      {t("customers.vsLastMonth")}
                    </span>
                  </div>
                </div>
                <div className={`${card.iconBg} p-3 rounded-lg`}>
                  <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
