import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-12 text-center mt-20 border-t border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-playfair mb-2 text-black">ZT ADDICTION</h2>
        <p className="text-sm font-montserrat text-gray-600 mb-6">© 2025 All Rights Reserved</p>
        
        {/* Policy Links */}
        <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm font-montserrat">
          <Link to="/about" className="text-gray-700 hover:text-black transition-colors">
            About Us
          </Link>
          <span className="text-gray-300">|</span>
          <Link to="/contact" className="text-gray-700 hover:text-black transition-colors">
            Contact Us
          </Link>
          <span className="text-gray-300">|</span>
          <Link to="/address" className="text-gray-700 hover:text-black transition-colors">
            Address
          </Link>
          <span className="text-gray-300">|</span>
          <Link to="/privacy-policy" className="text-gray-700 hover:text-black transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-300">|</span>
          <Link to="/refund-policy" className="text-gray-700 hover:text-black transition-colors">
            Refund Policy
          </Link>
          <span className="text-gray-300">|</span>
          <Link to="/shipping-policy" className="text-gray-700 hover:text-black transition-colors">
            Shipping Policy
          </Link>
        </div>
        
        {/* Contact Info */}
        <div className="mb-6 text-sm font-montserrat text-gray-600">
          <p className="mb-1">
            <a href="tel:+201272558833" className="hover:text-black transition-colors">
              +20 12 72558833
            </a>
          </p>
          <p>
            <a href="mailto:abrahemelgazaly2@gmail.com" className="hover:text-black transition-colors">
              abrahemelgazaly2@gmail.com
            </a>
          </p>
        </div>
        
        {/* Social Media */}
        <div className="flex justify-center gap-6">
          <a
            href="https://wa.me/201272558833"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:opacity-70 transition-opacity"
            aria-label="WhatsApp"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.05.547 4.063 1.587 5.814L0 24l6.352-1.529C8.937 23.453 10.938 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.701 0-3.361-.423-4.858-1.223l-.348-.2-3.613.87.886-3.532-.23-.365C2.163 15.714 1.818 13.9 1.818 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.521-7.5c-.301-.15-1.784-.882-2.063-.982-.279-.1-.482-.15-.682.15-.2.3-.776.982-.951 1.182-.175.2-.351.225-.652.075-.3-.15-1.263-.466-2.406-1.485-.889-.794-1.488-1.775-1.663-2.075-.175-.3-.019-.461.131-.61.134-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.682-1.625-.935-2.225-.245-.585-.491-.506-.682-.515-.176-.008-.376-.01-.576-.01-.2 0-.525.075-.8.375-.275.3-1.051 1.025-1.051 2.5 0 1.475 1.075 2.9 1.225 3.1.15.2 2.113 3.231 5.125 4.531.716.306 1.275.489 1.71.625.72.23 1.375.198 1.892.12.577-.092 1.776-.726 2.026-1.427.25-.701.25-1.3.175-1.427-.075-.127-.276-.2-.576-.35z"/>
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@zt.adicction?_r=1&_t=ZS-91QoCydFGgZ"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:opacity-70 transition-opacity"
            aria-label="TikTok"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 2.31-4.64 2.86 2.86 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.54-.05z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
