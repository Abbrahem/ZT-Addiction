import React from 'react';

const ContactUs = () => {
  return (
    <div className="min-h-screen py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-playfair mb-8 text-black">Contact Us</h1>
        
        <div className="space-y-8 font-montserrat text-gray-800">
          <p className="text-lg">
            We'd love to hear from you! Get in touch with us through any of the following channels:
          </p>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Phone</h2>
            <a href="tel:+201272558833" className="text-gray-800 hover:text-black">
              +20 12 72558833
            </a>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Email</h2>
            <a href="mailto:abrahemelgazaly2@gmail.com" className="text-gray-800 hover:text-black break-all">
              abrahemelgazaly2@gmail.com
            </a>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">WhatsApp</h2>
            <a href="https://wa.me/201272558833" target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-black">
              +20 12 72558833
            </a>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Location</h2>
            <p>Cairo, Egypt</p>
            <p>Fifth Settlement - التجمع الخامس</p>
            <p>Group 3 - مجموعة 3</p>
            <p>مفيدة</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Business Hours</h2>
            <p>Saturday - Thursday: 10:00 AM - 10:00 PM</p>
            <p>Friday: Closed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
