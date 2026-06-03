import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-playfair mb-8 text-black">Delivery & Shipping Policy</h1>
        
        <div className="space-y-6 font-montserrat text-gray-800 leading-relaxed">
          <p className="text-sm text-gray-600">Last Updated: January 2025</p>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Delivery Coverage</h2>
            <p>
              We currently deliver to all governorates across Egypt. Our delivery service ensures 
              your fragrances reach you safely and quickly.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Delivery Timeframes</h2>
            <p>Cairo & Giza: 2 days</p>
            <p>Other Governorates: 3-5 days</p>
            <p className="text-sm text-gray-600 mt-2">*Delivery times are estimates and may vary during peak seasons or holidays.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Shipping Fees</h2>
            <p className="text-lg font-semibold">Flat Rate: 110 EGP</p>
            <p className="mt-2">Shipping fee applies to all orders across Egypt, regardless of order value or location.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Order Processing</h2>
            <ul className="space-y-1 ml-4">
              <li>• Orders are processed within 24 hours on business days</li>
              <li>• Orders placed on Friday or public holidays will be processed the next business day</li>
              <li>• You will receive an order confirmation email immediately after placing your order</li>
              <li>• A tracking notification will be sent once your order is shipped</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Order Tracking</h2>
            <p className="mb-2">Once your order is shipped, you will receive:</p>
            <ul className="space-y-1 ml-4">
              <li>• SMS notification with order status</li>
              <li>• Email updates on delivery progress</li>
              <li>• Courier company contact information</li>
              <li>• Estimated delivery date</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Delivery Process</h2>
            <ol className="space-y-1 ml-4 list-decimal">
              <li>Our courier will contact you before delivery</li>
              <li>Ensure someone is available to receive the package</li>
              <li>Valid ID may be required upon delivery</li>
              <li>Inspect the package before accepting (check for damage)</li>
              <li>Sign the delivery receipt after inspection</li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Delivery Issues</h2>
            <p className="font-semibold mb-2">Failed Delivery Attempts:</p>
            <ul className="space-y-1 ml-4 mb-4">
              <li>• If delivery fails, the courier will attempt contact again</li>
              <li>• Please ensure your phone number is correct and reachable</li>
              <li>• After 2 failed attempts, the order will be returned</li>
            </ul>

            <p className="font-semibold mb-2">Damaged Package:</p>
            <ul className="space-y-1 ml-4">
              <li>• Do not accept damaged packages</li>
              <li>• Take photos of the damage immediately</li>
              <li>• Contact us within 24 hours</li>
              <li>• We will arrange a replacement or refund</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Address Accuracy</h2>
            <p className="mb-2">Please ensure your delivery address is complete and accurate. Include:</p>
            <ul className="space-y-1 ml-4">
              <li>• Full street address and building number</li>
              <li>• Floor and apartment number</li>
              <li>• Nearest landmark</li>
              <li>• City and governorate</li>
              <li>• Working phone number with WhatsApp if possible</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              *Any delivery delays or returns due to incorrect address information will be the customer's responsibility.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Cash on Delivery (COD)</h2>
            <p>
              We accept cash payment upon delivery. Please have the exact amount ready when 
              the courier arrives. For COD orders, please ensure your phone has WhatsApp 
              for order confirmation.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Contact Us</h2>
            <p className="mb-2">For shipping inquiries or issues:</p>
            <p>Email: <a href="mailto:abrahemelgazaly2@gmail.com" className="text-black hover:underline">abrahemelgazaly2@gmail.com</a></p>
            <p>Phone: <a href="tel:+201272558833" className="text-black hover:underline">+20 12 72558833</a></p>
            <p>WhatsApp: <a href="https://wa.me/201272558833" target="_blank" rel="noopener noreferrer" className="text-black hover:underline">+20 12 72558833</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
