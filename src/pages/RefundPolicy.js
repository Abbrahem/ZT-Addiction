import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-playfair mb-8 text-black">Refund & Cancellation Policy</h1>
        
        <div className="space-y-6 font-montserrat text-gray-800 leading-relaxed">
          <p className="text-sm text-gray-600">Last Updated: January 2025</p>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Return Policy</h2>
            <p>
              At ZT ADDICTION, we want you to be completely satisfied with your purchase. 
              We offer a <strong>3-day return policy</strong> from the date of delivery.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Eligibility for Returns</h2>
            <p className="mb-2">To be eligible for a return, items must meet the following conditions:</p>
            <ul className="space-y-1 ml-4">
              <li>• Product must be unused and in original condition</li>
              <li>• Original packaging must be intact</li>
              <li>• Seal/wrapper must be unbroken</li>
              <li>• Return request must be made within 3 days of delivery</li>
              <li>• Proof of purchase (order confirmation) required</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Non-Returnable Items</h2>
            <p className="mb-2">The following items cannot be returned:</p>
            <ul className="space-y-1 ml-4">
              <li>• Opened or used fragrances (due to hygiene reasons)</li>
              <li>• Products with broken seals</li>
              <li>• Damaged items due to customer misuse</li>
              <li>• Sale or promotional items (unless defective)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">How to Initiate a Return</h2>
            <ol className="space-y-1 ml-4 list-decimal">
              <li>Contact us within 3 days of receiving your order</li>
              <li>Email: abrahemelgazaly2@gmail.com or WhatsApp: +20 12 72558833</li>
              <li>Provide your order number and reason for return</li>
              <li>Wait for return authorization from our team</li>
              <li>Pack the item securely in its original packaging</li>
              <li>Our courier will collect the item from your address</li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Refund Process</h2>
            <p className="mb-2">Once we receive and inspect your returned item:</p>
            <ul className="space-y-1 ml-4">
              <li>• Inspection will be completed within 2-3 business days</li>
              <li>• If approved, refund will be processed to your original payment method</li>
              <li>• Refunds typically take 5-10 business days to appear in your account</li>
              <li>• Shipping fees are non-refundable (except in case of damaged/defective items)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Order Cancellation</h2>
            <p className="font-semibold mb-2">Before Shipment:</p>
            <ul className="space-y-1 ml-4 mb-4">
              <li>• Orders can be cancelled free of charge before shipment</li>
              <li>• Contact us immediately via phone or WhatsApp</li>
              <li>• Full refund will be processed</li>
            </ul>
            
            <p className="font-semibold mb-2">After Shipment:</p>
            <ul className="space-y-1 ml-4">
              <li>• Once shipped, orders cannot be cancelled</li>
              <li>• You must receive the product and follow the return policy</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Damaged or Defective Items</h2>
            <p className="mb-2">If you receive a damaged or defective product:</p>
            <ul className="space-y-1 ml-4">
              <li>• Contact us immediately with photos of the damage</li>
              <li>• We will arrange a free return pickup</li>
              <li>• Full refund or replacement will be provided</li>
              <li>• Shipping costs will be covered by us</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Contact Us</h2>
            <p className="mb-2">For any questions about returns or refunds:</p>
            <p>Email: <a href="mailto:abrahemelgazaly2@gmail.com" className="text-black hover:underline">abrahemelgazaly2@gmail.com</a></p>
            <p>Phone: <a href="tel:+201272558833" className="text-black hover:underline">+20 12 72558833</a></p>
            <p>WhatsApp: <a href="https://wa.me/201272558833" target="_blank" rel="noopener noreferrer" className="text-black hover:underline">+20 12 72558833</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
