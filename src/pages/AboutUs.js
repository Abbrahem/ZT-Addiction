import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-playfair mb-8 text-black">About Us</h1>
        
        <div className="space-y-6 font-montserrat text-gray-800 leading-relaxed">
          <p>
            Welcome to <strong>ZT ADDICTION</strong>, your premier destination for luxury fragrances and exceptional perfumes.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Who We Are</h2>
            <p>
              At ZT ADDICTION, we believe that a fragrance is more than just a scent—it's a statement, 
              a memory, and an expression of your unique personality. We carefully curate a collection 
              of the finest perfumes from around the world to bring you an unforgettable olfactory experience.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Our Mission</h2>
            <p>
              Our mission is to make luxury fragrances accessible to everyone. We strive to provide 
              authentic, high-quality perfumes at competitive prices, delivered right to your doorstep 
              with exceptional customer service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-3">Why Choose Us?</h2>
            <ul className="space-y-2">
              <li>• Authentic luxury fragrances</li>
              <li>• Competitive pricing</li>
              <li>• Fast and reliable delivery across Egypt</li>
              <li>• Excellent customer service</li>
              <li>• Easy returns within 3 days</li>
              <li>• Secure payment options</li>
            </ul>
          </div>

          <p>
            Thank you for choosing ZT ADDICTION. We look forward to helping you discover your signature scent.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
