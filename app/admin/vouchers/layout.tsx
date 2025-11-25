'use client';

import { VouchersProvider } from '@/app/contexts/VouchersContext';

export default function VoucherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VouchersProvider>
      {children}
    </VouchersProvider>
  );
}
