import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "@/context/AppContext";
import { generateStaticMetadata, generateViewport } from "@/utils/metadata";
import ConditionalHeader from "@/components/Common/ConditionalHeader";
import ConditionalFooter from "@/components/Common/ConditionalFooter";
import MobileBottomNavigation from "@/components/Common/MobileBottomNavigation";
import { Suspense } from "react";
import AffiliateTracker from "@/components/Common/AffiliateTracker";
import Script from "next/script";
import VisitorTracker from "@/components/VisitorTracker/VisitorTracker";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const viewport = generateViewport();

export async function generateMetadata() {
  const siteSettings = await getSiteSettings();
  const ogImage = siteSettings?.ogImage || '';

  return generateStaticMetadata('home', { image: ogImage });
}

async function getSiteSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/settings/site-settings`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
}

export default async function RootLayout({ children }) {
  const siteSettings = await getSiteSettings();
  const logoUrl = siteSettings?.logoUrl || '';

  return (
    <html lang="en">
      <head>
        {/* Structured Data (JSON-LD) for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Kids World BD",
              "url": "https://kidsworldbd.com",
              "logo": logoUrl || "https://kidsworldbd.com/images/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "01633075357",
                "contactType": "customer service",
                "email": "kidsworld6476@gmail.com",
                "availableLanguage": ["English", "Bengali"]
              },
              "sameAs": [
                "https://www.facebook.com/kidsworldbd"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Kids World BD",
              "url": "https://kidsworldbd.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://kidsworldbd.com/shop?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geist.variable} font-sans antialiased`}
      >
        <AppProvider>
          <VisitorTracker />
          <Suspense fallback={null}>
            <AffiliateTracker />
          </Suspense>
          <ConditionalHeader logoUrl={logoUrl} />
          {children}
          <ConditionalFooter />
          <MobileBottomNavigation />
          <Toaster />
        </AppProvider>

      </body>
    </html>
  );
}
