'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initMetaPixel, trackPageView } from '@/utils/metaPixel';

export default function MetaPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef('');

  // Initialize Pixel on mount
  useEffect(() => {
    initMetaPixel();
  }, []);

  // Track PageView on route changes
  useEffect(() => {
    // Avoid tracking inside Admin dashboard pages
    if (pathname && pathname.startsWith('/admin')) {
      return;
    }

    const currentUrl = `${pathname}${searchParams?.toString() ? '?' + searchParams.toString() : ''}`;

    // Deduplicate consecutive triggers on same URL
    if (lastTrackedUrl.current === currentUrl) {
      return;
    }

    lastTrackedUrl.current = currentUrl;
    trackPageView(currentUrl);
  }, [pathname, searchParams]);

  return null;
}
