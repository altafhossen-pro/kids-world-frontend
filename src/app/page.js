// OLD IMPORTS
// import CategorySlider from "@/components/Homepage/CategorySlider/CategorySlider";
// import HeroSection from "@/components/Homepage/HeroSection/HeroSection";
// import HeroOffers from "@/components/Homepage/HeroOffers/HeroOffers";
// import FeaturedProducts from "@/components/Homepage/FeaturedProducts/FeaturedProducts";
// import BestSellingProducts from "@/components/Homepage/BestSellingProducts/BestSellingProducts";
// import NewArrivalProducts from "@/components/Homepage/NewArrivalProducts/NewArrivalProducts";
// import OfferBanner from "@/components/Homepage/OfferBanner/OfferBanner";
// import JustForYou from "@/components/Homepage/JustForYou/JustForYou";
// import ProductForYou from "@/components/Homepage/ProductForYou/ProductForYou";
// import FactsSection from "@/components/Homepage/FactsSection/FactsSection";
// import CustomerTestimonial from "@/components/Homepage/CustomerTestimonial/CustomerTestimonial";
// import Footer from "@/components/Footer/Footer";
// import HeroBanner from "@/components/Homepage/HeroBanner/HeroBanner";
// import StoreFeatures from "@/components/Homepage/StoreFeatures/StoreFeatures";
// import FloatingContact from "@/components/Common/FloatingContact";

// NEW IMPORTS
import NewHeroBanner from "@/components/NewHomepage/HeroBanner/HeroBanner";
import FeaturesRow from "@/components/NewHomepage/FeaturesRow/FeaturesRow";
import ShopByCategory from "@/components/NewHomepage/ShopByCategory/ShopByCategory";
import PromoBanners from "@/components/NewHomepage/PromoBanners/PromoBanners";
import TrendingProducts from "@/components/NewHomepage/Products/TrendingProducts";
import BestSellers from "@/components/NewHomepage/Products/BestSellers";
import CategoryProducts from "@/components/NewHomepage/Products/CategoryProducts";
import NewArrivals from "@/components/NewHomepage/Products/NewArrivals";
import DealOfTheDay from "@/components/NewHomepage/DealOfTheDay/DealOfTheDay";
import TopBrands from "@/components/NewHomepage/TopBrands/TopBrands";
import Testimonials from "@/components/NewHomepage/Testimonials/Testimonials";
import Newsletter from "@/components/NewHomepage/Newsletter/Newsletter";
import JustForYou from "@/components/NewHomepage/Products/JustForYou";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">

      {/* NEW STATIC DESIGN COMPONENTS */}
      <NewHeroBanner />
      <FeaturesRow />
      <ShopByCategory />
      <TrendingProducts />
      <BestSellers />
      <DealOfTheDay />
      <CategoryProducts />
      <NewArrivals />
      <PromoBanners />
      <Testimonials />
      <TopBrands />
      <Newsletter />
      <JustForYou />

      {/* OLD COMMENTED COMPONENTS */}
      {/* 
      <HeroBanner />
      <StoreFeatures />
      <HeroOffers />
      <CategorySlider />
      <ProductForYou />
      <CustomerTestimonial />
      <Footer />
      <FloatingContact />
      */}
    </div>
  );
}
