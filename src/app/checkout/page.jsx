import NewCheckout from '@/components/NewCheckout/NewCheckout';
import React from 'react';

/*
  =====================================================
  ORIGINAL CHECKOUT PAGE — Preserved for re-integration
  =====================================================
  import CheckoutContainer from '@/components/Checkout/CheckoutContainer';
  import Footer from '@/components/Footer/Footer';
  import { Suspense } from 'react';
  import { generateDynamicMetadata, generateViewport } from '@/utils/metadata';
  
  export const metadata = generateDynamicMetadata('checkout');
  export const viewport = generateViewport();

  export default function Checkout() {
    return (
      <div className="bg-[#fcf8f3]">
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        }>
          <CheckoutContainer />
        </Suspense>
        <Footer />
      </div>
    );
  }
  =====================================================
*/

export default function CheckoutPage() {
  return <NewCheckout />;
}