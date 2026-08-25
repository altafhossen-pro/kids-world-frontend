import NewProductDetails from '@/components/NewProductDetails/NewProductDetails';
import React from 'react';

/*
  =====================================================
  ORIGINAL PRODUCT PAGE — Preserved for re-integration
  =====================================================
  import Footer from '@/components/Footer/Footer';
  import ProductDetails from '@/components/ProductDetails/ProductDetails';
  import { generateDynamicMetadata, generateViewport } from '@/utils/metadata';

  export async function generateMetadata({ params }) { ... }
  export const viewport = generateViewport();

  const page = async ({ params }) => {
    const { productSlug } = await params;
    // ... server-side fetch for JSON-LD structured data ...
    return (
      <div>
        {jsonLd && <script type="application/ld+json" ... />}
        <ProductDetails productSlug={productSlug} />
        <Footer />
      </div>
    );
  };
  =====================================================
*/

// Static product details page — all routes currently show the same
// fake product. Replace NewProductDetails with the dynamic version later.
export default function ProductPage() {
  return <NewProductDetails />;
}