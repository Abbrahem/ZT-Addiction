import React from 'react';

const Address = () => {
  return (
    <div className="min-h-screen py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-playfair mb-8 text-black">Our Address</h1>
        
        <div className="space-y-8 font-montserrat text-gray-800">
          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Store Location</h2>
            <p className="text-lg font-semibold text-black mb-2">Cairo, Egypt</p>
            <p>Fifth Settlement - التجمع الخامس</p>
            <p>Group 3 - مجموعة 3</p>
            <p>مفيدة</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Contact</h2>
            <p className="mb-2">
              Phone: <a href="tel:+201272558833" className="text-black hover:underline">+20 12 72558833</a>
            </p>
            <p className="mb-2">
              Email: <a href="mailto:abrahemelgazaly2@gmail.com" className="text-black hover:underline break-all">abrahemelgazaly2@gmail.com</a>
            </p>
            <p>
              WhatsApp: <a href="https://wa.me/201272558833" target="_blank" rel="noopener noreferrer" className="text-black hover:underline">+20 12 72558833</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Business Hours</h2>
            <p>Saturday - Thursday: 10:00 AM - 10:00 PM</p>
            <p>Friday: Closed</p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-center">
              📍 For exact directions or pickup, please contact us via WhatsApp or phone
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;
