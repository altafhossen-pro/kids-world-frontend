'use client';

import { usePathname } from 'next/navigation';
import NewHeader from '@/components/NewHeader/NewHeader';

export default function ConditionalHeader({ logoUrl }) {
  const pathname = usePathname();
  
  // Routes that should not show header at all
  const noHeaderRoutes = [
    '/admin',
    '/login',
    '/register',
    '/forgot-password'
  ];
  
  // Check if current path should not show header
  const shouldHideHeader = noHeaderRoutes.some(route => pathname.startsWith(route));
  
  // Don't render header for these routes
  if (shouldHideHeader) {
    return null;
  }
  
  return <NewHeader logoUrl={logoUrl} />;
}
