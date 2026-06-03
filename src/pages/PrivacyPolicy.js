import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-playfair mb-8 text-black">Privacy Policy</h1>
        
        <div className="space-y-6 font-montserrat text-gray-800 leading-relaxed">
          <p className="text-sm text-gray-600">Last Updated: January 2025</p>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Information We Collect</h2>
            <p className="mb-2">When you make a purchase or create an account, we collect:</p>
            <ul className="space-y-1 ml-4">
              <li>• Personal information (name, email, phone number)</li>
              <li>• Delivery address</li>
              <li>• Order history and preferences</li>
              <li>• Payment information (processed securely through third-party providers)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">How We Use Your Information</h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="space-y-1 ml-4">
              <li>• Process and fulfill your orders</li>
              <li>• Send order confirmations and updates</li>
              <li>• Improve our products and services</li>
              <li>• Communicate with you about promotions and offers (with your consent)</li>
              <li>• Prevent fraud and ensure security</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Information Sharing</h2>
            <p className="mb-2">We do not sell your personal information. We may share your information with:</p>
            <ul className="space-y-1 ml-4">
              <li>• Delivery partners to fulfill your orders</li>
              <li>• Payment processors for secure transactions</li>
              <li>• Legal authorities when required by law</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. 
              However, no method of transmission over the internet is 100% secure, and we cannot 
              guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="space-y-1 ml-4">
              <li>• Access your personal information</li>
              <li>• Request correction of inaccurate data</li>
              <li>• Request deletion of your data</li>
              <li>• Opt-out of marketing communications</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Cookies</h2>
            <p>
              We use cookies to enhance your browsing experience, analyze site traffic, and 
              personalize content. You can control cookie preferences through your browser settings.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Contact Us</h2>
            <p className="mb-2">If you have any questions about this Privacy Policy, please contact us:</p>
            <p>Email: <a href="mailto:abrahemelgazaly2@gmail.com" className="text-black hover:underline">abrahemelgazaly2@gmail.com</a></p>
            <p>Phone: <a href="tel:+201272558833" className="text-black hover:underline">+20 12 72558833</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
