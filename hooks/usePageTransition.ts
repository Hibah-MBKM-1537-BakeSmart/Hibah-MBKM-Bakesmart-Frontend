'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function usePageTransition() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const startTransition = () => {
    setIsLoading(true);
  };

  return { isLoading, startTransition };
}