'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Heart, Linkedin, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { menuAPI, settingsAPI } from '@/services/api';

// Fallback footer data
const fallbackFooterData = {
  about: {
    description: "Kids World BD – Care, Comfort & Happiness for Every Child. We provide safe, stylish & high quality toys for your little ones."
  },
  quickLinks: [
    { name: "Home", href: "/", isActive: true },
    { name: "Shop All Toys", href: "/shop", isActive: true },
    { name: "New Arrivals", href: "/new-arrivals", isActive: true },
    { name: "Best Sellers", href: "/best-sellers", isActive: true },
    { name: "Our Blog", href: "/blogs", isActive: true }
  ],
  utilities: [
    { name: "About Us", href: "/about-us", isActive: true },
    { name: "Contact Us", href: "/contact-us", isActive: true },
    { name: "Privacy Policy", href: "/privacy-policy", isActive: true },
    { name: "Terms & Conditions", href: "/terms-and-conditions", isActive: true },
    { name: "Return Policy", href: "/return-policy", isActive: true }
  ],
  contact: [
    { contactType: 'address', href: 'Jamuna Future Park Level 1 DNCC corner A-1-013 (Near West Court), Gulshan DNCC Market shop number 66', name: 'Jamuna Branch', isActive: true },
    { contactType: 'phone', href: '01633075357', name: 'Phone', isActive: true },
    { contactType: 'phone', href: '01793596476', name: 'Phone 2', isActive: true },
    { contactType: 'email', href: 'kidsworld6476@gmail.com', name: 'Email', isActive: true }
  ],
  socialMedia: [
    { socialPlatform: 'facebook', href: 'https://facebook.com', isActive: true },
    { socialPlatform: 'instagram', href: 'https://instagram.com', isActive: true },
    { socialPlatform: 'twitter', href: 'https://twitter.com', isActive: true }
  ]
};

const NewFooter = () => {
  const [footerData, setFooterData] = useState(fallbackFooterData);
  const [logoUrl, setLogoUrl] = useState("/images/logo.webp");
  const [loading, setLoading] = useState(true);

  // Fetch footer data from API
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setLoading(true);
        const [menuResponse, settingsResponse] = await Promise.all([
          menuAPI.getFooterMenus().catch(() => ({ success: false })),
          settingsAPI.getSiteSettings().catch(() => ({ success: false }))
        ]);

        if (menuResponse?.success && menuResponse?.data) {
          // Transform API data to match component format
          const transformedData = {
            about: footerData.about, // Keep static about section
            quickLinks: menuResponse.data.quickLinks || fallbackFooterData.quickLinks,
            utilities: menuResponse.data.utilities || fallbackFooterData.utilities,
            contact: menuResponse.data.contact || fallbackFooterData.contact,
            socialMedia: menuResponse.data.socialMedia && menuResponse.data.socialMedia.length > 0
              ? menuResponse.data.socialMedia
              : fallbackFooterData.socialMedia
          };

          setFooterData(transformedData);
        } else {
          // Use fallback data if API fails
          setFooterData(fallbackFooterData);
        }

        if (settingsResponse?.success && settingsResponse?.data?.logoUrl) {
          setLogoUrl(settingsResponse.data.logoUrl);
        }
      } catch (error) {
        console.error('Error fetching footer menus:', error);
        setFooterData(fallbackFooterData);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  return (
    <footer className="bg-[#0B1E4A] text-white pt-16 pb-8 border-t-[8px] border-blue-500 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Column 1: About */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <img
                src={logoUrl || "/images/logo.webp"}
                alt="Kids World Logo"
                className="h-14 w-auto bg-white p-2 rounded-xl"
              />
            </Link>
            <p className="text-blue-200 text-sm leading-relaxed mb-6">
              {footerData.about.description}
            </p>
            <div className="flex items-center gap-4">
              {loading ? (
                <div className="flex space-x-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="w-10 h-10 bg-white/20 rounded-full animate-pulse"></div>
                  ))}
                </div>
              ) : (
                footerData.socialMedia.map((social, index) => {
                  const platform = social.socialPlatform || social.name?.toLowerCase();
                  let Icon = Facebook;
                  if (platform === 'twitter') Icon = Twitter;
                  if (platform === 'instagram') Icon = Instagram;
                  if (platform === 'linkedin') Icon = Linkedin;

                  return (
                    <a key={index} href={social.href} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-blue-500 p-2.5 rounded-full transition-colors" aria-label={social.name || social.label}>
                      <Icon className="w-5 h-5 text-white" />
                    </a>
                  );
                })
              )}
            </div>
          </div>

          {/* Columns 2 & 3 Wrapper for Mobile Side-by-Side */}
          <div className="grid grid-cols-2 gap-4 md:gap-10 lg:col-span-2">
            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white border-b border-blue-800 pb-2 inline-block">Quick Links</h3>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="h-4 bg-white/20 rounded animate-pulse w-24"></div>
                  ))}
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {footerData.quickLinks.map((link, index) => (
                    <li key={index}>
                      <Link href={link.href} target={link.target || '_self'} className="text-blue-200 hover:text-blue-400 hover:pl-2 transition-all text-sm">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Column 3: Customer Service */}
            <div className="flex flex-col items-end text-right md:items-start md:text-left">
              <h3 className="text-xl font-bold mb-6 text-white border-b border-blue-800 pb-2 inline-block">Customer Service</h3>
              {loading ? (
                <div className="space-y-3 flex flex-col items-end md:items-start">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="h-4 bg-white/20 rounded animate-pulse w-28"></div>
                  ))}
                </div>
              ) : (
                <ul className="flex flex-col gap-3 items-end md:items-start">
                  {footerData.utilities.map((link, index) => (
                    <li key={index}>
                      <Link href={link.href} target={link.target || '_self'} className="text-blue-200 hover:text-blue-400 hover:pr-2 md:hover:pr-0 md:hover:pl-2 transition-all text-sm">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white border-b border-blue-800 pb-2 inline-block">Contact Info</h3>
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-white/20 rounded-full animate-pulse flex-shrink-0"></div>
                    <div className="h-4 bg-white/20 rounded animate-pulse w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {footerData.contact.map((contact, index) => {
                  let Icon = MessageCircle;
                  if (contact.contactType === 'address') Icon = MapPin;
                  if (contact.contactType === 'phone') Icon = Phone;
                  if (contact.contactType === 'email') Icon = Mail;

                  const typeName = contact.contactType ? contact.contactType.toLowerCase() : '';
                  const hasLabel = contact.name && contact.name.toLowerCase() !== typeName;

                  return (
                    <li key={index} className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 text-blue-500 flex-shrink-0 ${contact.contactType === 'address' ? 'mt-0.5' : ''}`} />
                      {['phone', 'email'].includes(contact.contactType) ? (
                        <div className="text-blue-200 text-sm">
                          {hasLabel && <span className="font-semibold mr-1">{contact.name}:</span>}
                          <a href={contact.contactType === 'phone' ? `tel:${contact.href}` : `mailto:${contact.href}`} className="hover:text-blue-400">
                            {contact.href}
                          </a>
                        </div>
                      ) : contact.contactType === 'address' ? (
                        <div className="text-blue-200 text-sm mt-0.5 leading-relaxed">
                          {hasLabel && <span className="font-semibold mr-1">{contact.name}:</span>}
                          <span>{contact.href}</span>
                        </div>
                      ) : (
                        <div className="text-blue-200 text-sm">
                          {hasLabel && <span className="font-semibold mr-1">{contact.name}:</span>}
                          <span>{contact.href}</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-blue-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-blue-300 text-sm text-center md:text-left flex items-center gap-1 justify-center">
            &copy; {new Date().getFullYear()} Kids World BD. All Rights Reserved. Made with <Heart className="w-4 h-4 text-blue-500 fill-pink-500 mx-1" />
          </p>

          <div className="flex items-center">
            {/* Payment Methods Image */}
            <img
              src="/images/payment.webp"
              alt="Accepted Payment Methods"
              className="h-16 object-contain"
            />
          </div>
        </div>

      </div>
    </footer>
  );
};

export default NewFooter;
