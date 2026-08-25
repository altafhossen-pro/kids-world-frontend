import NewShop from '@/components/NewShop/NewShop';
import React from 'react';

/*
  =====================================================
  ORIGINAL SHOP PAGE — Preserved for re-integration
  =====================================================
  import ShopContainer from '@/components/Shop/ShopContainer';
  import Footer from '@/components/Footer/Footer';
  import { Suspense } from 'react';
  import { generateDynamicMetadata, generateViewport } from '@/utils/metadata';
  
  export const metadata = generateDynamicMetadata('shop');
  export const viewport = generateViewport();

  export default function Shop() {
    return (
      <div className="bg-[#fcf8f3]">
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        }>
          <ShopContainer />
        </Suspense>
        <Footer />
      </div>
    );
  }
  =====================================================
*/

export default function ShopPage() {
  return <NewShop />;
}
