// Site Configuration
export const siteConfig = {
  // Basic Site Info
  name: "Kids World BD",
  shortName: "Kids World BD",
  description: "Kids World BD – Care, Comfort & Happiness for Every Child",
  url: "https://kidsworldbd.com",

  // SEO Meta Tags
  seo: {
    title: "Kids World BD - Care, Comfort & Happiness for Every Child",
    description: "Discover our exclusive collection of kids items. Care, Comfort & Happiness for Every Child.",
    keywords: "kids, baby, toys, clothing, baby care, kids world bd",
    author: "Kids World BD Team",
    robots: "index, follow",
    language: "en",
    charset: "utf-8",
    viewport: "width=device-width, initial-scale=1",
  },

  // Social Media Meta Tags
  social: {
    twitter: {
      card: "summary_large_image",
      site: "@kidsworldbd",
      creator: "@kidsworldbd",
    },
    facebook: {
      appId: "your-facebook-app-id",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "Kids World BD",
    },
  },

  // Contact Information
  contact: {
    email: "kidsworld6476@gmail.com",
    phone: "01633075357, 01793596476",
    address: "Jamuna Future Park Level 1 Dncc corner A-1-013 (Near West Court), Gulshan DNCC Market shop number 66",
    hours: "Mon-Sun: 9AM-8PM",
  },

  // Navigation
  navigation: {
    main: [
      { name: "Home", href: "/" },
      { name: "Shop", href: "/shop" },
      { name: "Categories", href: "/categories" },
      { name: "Offers", href: "/offers" },
      { name: "Contact", href: "/contact-us" },
    ],
    footer: [
      { name: "About Us", href: "/about" },
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms & Conditions", href: "/terms-and-conditions" },
      { name: "FAQ", href: "/faq" },
    ],
  },

  // Page-specific titles and descriptions
  pages: {
    home: {
      title: "Kids World BD - Care, Comfort & Happiness for Every Child",
      description: "Discover our exclusive collection of kids items. Care, Comfort & Happiness for Every Child.",
    },
    shop: {
      title: "Shop Kids Items - Kids World BD",
      description: "Browse our complete collection of kids items.",
    },
    search: {
      title: "Search - Kids World BD",
      description: "Search and find the perfect items for your kids.",
    },
    categories: {
      title: "Categories - Kids World BD",
      description: "Explore our items by category.",
    },
    product: {
      title: "{{productName}}",
      description: "{{productDescription}} - Premium kids items from Kids World BD.",
    },
    checkout: {
      title: "Checkout - Kids World BD",
      description: "Complete your purchase securely with Kids World BD.",
    },
    login: {
      title: "Login - Kids World BD",
      description: "Sign in to your Kids World BD account.",
    },
    register: {
      title: "Register - Kids World BD",
      description: "Create your Kids World BD account.",
    },
    dashboard: {
      title: "My Dashboard - Kids World BD",
      description: "Manage your account, orders, and preferences.",
    },
    admin: {
      title: "Admin Dashboard - Kids World BD",
      description: "Manage your Kids World BD store.",
    },
    contact: {
      title: "Contact Us - Kids World BD",
      description: "Get in touch with Kids World BD for any questions or support.",
    },
    faq: {
      title: "FAQ - Kids World BD",
      description: "Frequently asked questions about Kids World BD.",
    },
    offers: {
      title: "Special Offers - Kids World BD",
      description: "Discover exclusive offers and discounts.",
    },
    privacy: {
      title: "Privacy Policy - Kids World BD",
      description: "Learn about how Kids World BD protects your privacy and data.",
    },
    terms: {
      title: "Terms & Conditions - Kids World BD",
      description: "Read the terms and conditions for using Kids World BD services.",
    },
  },

  // Default values for dynamic content
  defaults: {
    image: "/images/logo.png",
    favicon: "/favicon.ico",
    themeColor: "#4CAF50",
    backgroundColor: "#FFFFFF",
  },
};

// Helper function to get page metadata
export const getPageMetadata = (pageKey, dynamicData = {}) => {
  const pageConfig = siteConfig.pages[pageKey] || siteConfig.pages.home;

  let title = pageConfig.title;
  let description = pageConfig.description;

  // Replace dynamic placeholders
  if (dynamicData.productName) {
    title = title.replace('{{productName}}', dynamicData.productName);
  }
  if (dynamicData.productDescription) {
    description = description.replace('{{productDescription}}', dynamicData.productDescription);
  }

  return {
    ...pageConfig,
    title,
    description,
  };
};

// Helper function to get full page title with site name
export const getFullPageTitle = (pageTitle) => {
  return `${pageTitle} | ${siteConfig.name}`;
};

// Helper function to get SEO meta tags
export const getSEOMetaTags = (pageKey, dynamicData = {}) => {
  const pageMeta = getPageMetadata(pageKey, dynamicData);
  const fullTitle = getFullPageTitle(pageMeta.title);

  return {
    title: fullTitle,
    description: pageMeta.description,
    keywords: siteConfig.seo.keywords,
    author: siteConfig.seo.author,
    robots: siteConfig.seo.robots,
    language: siteConfig.seo.language,
    charset: siteConfig.seo.charset,
    viewport: siteConfig.seo.viewport,
    'og:title': fullTitle,
    'og:description': pageMeta.description,
    'og:type': siteConfig.social.openGraph.type,
    'og:url': `${siteConfig.url}${dynamicData.path || ''}`,
    'og:site_name': siteConfig.social.openGraph.siteName,
    'og:locale': siteConfig.social.openGraph.locale,
    'og:image': dynamicData.image || siteConfig.defaults.image,
    'twitter:card': siteConfig.social.twitter.card,
    'twitter:site': siteConfig.social.twitter.site,
    'twitter:creator': siteConfig.social.twitter.creator,
    'twitter:title': fullTitle,
    'twitter:description': pageMeta.description,
    'twitter:image': dynamicData.image || siteConfig.defaults.image,
  };
};
