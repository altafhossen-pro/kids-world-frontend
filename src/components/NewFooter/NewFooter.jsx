import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Heart } from 'lucide-react';
import Link from 'next/link';

const NewFooter = () => {
  return (
    <footer className="bg-[#0B1E4A] text-white pt-16 pb-8 border-t-[8px] border-blue-500 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Column 1: About */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <img
                src="/images/logo.webp"
                alt="Kids World Logo"
                className="h-14 w-auto bg-white p-2 rounded-xl"
              />
            </Link>
            <p className="text-blue-200 text-sm leading-relaxed mb-6">
              Kids World BD – Care, Comfort & Happiness for Every Child. We provide safe, stylish & high quality toys for your little ones.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-blue-500 p-2.5 rounded-full transition-colors">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-blue-500 p-2.5 rounded-full transition-colors">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-blue-500 p-2.5 rounded-full transition-colors">
                <Twitter className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white border-b border-blue-800 pb-2 inline-block">Quick Links</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/" className="text-blue-200 hover:text-blue-400 hover:pl-2 transition-all text-sm">Home</Link></li>
              <li><Link href="/shop" className="text-blue-200 hover:text-blue-400 hover:pl-2 transition-all text-sm">Shop All Toys</Link></li>
              <li><Link href="/new-arrivals" className="text-blue-200 hover:text-blue-400 hover:pl-2 transition-all text-sm">New Arrivals</Link></li>
              <li><Link href="/best-sellers" className="text-blue-200 hover:text-blue-400 hover:pl-2 transition-all text-sm">Best Sellers</Link></li>
              <li><Link href="/blogs" className="text-blue-200 hover:text-blue-400 hover:pl-2 transition-all text-sm">Our Blog</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white border-b border-blue-800 pb-2 inline-block">Customer Service</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/about-us" className="text-blue-200 hover:text-blue-400 hover:pl-2 transition-all text-sm">About Us</Link></li>
              <li><Link href="/contact-us" className="text-blue-200 hover:text-blue-400 hover:pl-2 transition-all text-sm">Contact Us</Link></li>
              <li><Link href="/privacy-policy" className="text-blue-200 hover:text-blue-400 hover:pl-2 transition-all text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="text-blue-200 hover:text-blue-400 hover:pl-2 transition-all text-sm">Terms & Conditions</Link></li>
              <li><Link href="/return-policy" className="text-blue-200 hover:text-blue-400 hover:pl-2 transition-all text-sm">Return Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white border-b border-blue-800 pb-2 inline-block">Contact Info</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-blue-200 text-sm">Jamuna Future Park Level 1 DNCC corner A-1-013 (Near West Court), Gulshan DNCC Market shop number 66</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:01633075357" className="text-blue-200 text-sm hover:text-blue-400">01633075357</a>
                  <a href="tel:01793596476" className="text-blue-200 text-sm hover:text-blue-400">01793596476</a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <a href="mailto:kidsworld6476@gmail.com" className="text-blue-200 text-sm hover:text-blue-400">kidsworld6476@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-blue-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-blue-300 text-sm text-center md:text-left flex items-center gap-1 justify-center">
            &copy; {new Date().getFullYear()} Kids World BD. All Rights Reserved. Made with <Heart className="w-4 h-4 text-blue-500 fill-pink-500 mx-1" />
          </p>

          <div className="flex items-center gap-2">
            {/* Payment Method Placeholders */}
            <div className="bg-white px-3 py-1 rounded text-xs font-bold text-gray-800">bKash</div>
            <div className="bg-white px-3 py-1 rounded text-xs font-bold text-gray-800">Nagad</div>
            <div className="bg-white px-3 py-1 rounded text-xs font-bold text-gray-800">Visa</div>
            <div className="bg-white px-3 py-1 rounded text-xs font-bold text-gray-800">MasterCard</div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default NewFooter;
