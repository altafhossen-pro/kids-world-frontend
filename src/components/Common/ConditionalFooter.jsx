'use client';

import { usePathname } from 'next/navigation';
import NewFooter from '@/components/NewFooter/NewFooter';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  const noFooterRoutes = [
    '/admin',
    '/login',
    '/register',
    '/forgot-password'
  ];
  
  const shouldHideFooter = noFooterRoutes.some(route => pathname.startsWith(route));
  
  if (shouldHideFooter) {
    return null;
  }
  
  return <NewFooter />;
}
