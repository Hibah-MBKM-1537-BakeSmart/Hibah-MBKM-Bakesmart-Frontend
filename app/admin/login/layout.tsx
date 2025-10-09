import type React from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable}`} style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
      {children}
    </div>
  );
}