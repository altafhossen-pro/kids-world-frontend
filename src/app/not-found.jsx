import Link from 'next/link';
import { Home, Search, ArrowLeft, ShoppingBag, Heart } from 'lucide-react';

export const metadata = {
  title: 'Page Not Found | Kids World BD',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 404 Content */}
        <div className="text-center">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold text-blue-500 mb-4">404</h1>
            <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Homepage
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Link>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-600 mb-6">
              Try searching for products or browse our categories
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Popular Categories
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Toys", icon: "🧸", href: "/shop" },
                { name: "Baby Care", icon: "🍼", href: "/shop" },
                { name: "Clothing", icon: "👕", href: "/shop" },
                { name: "Accessories", icon: "🎒", href: "/shop" }
              ].map((category, index) => (
                <Link
                  key={index}
                  href={category.href}
                  className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-center"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-600">
                    {category.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Helpful Links */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Need Help?
            </h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/privacy-policy"
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/contact-us"
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
