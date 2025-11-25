'use client';

import { StatisticsProvider } from '@/app/contexts/StatisticsContext';

export default function StatisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StatisticsProvider>
      {children}
    </StatisticsProvider>
  );
}
