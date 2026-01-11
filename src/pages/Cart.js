import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const shippingFee = 100;
  const subtotal = getCartTotal();
  const total = subtotal + (items.length > 0 ? shippingFee : 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-24 bg-beige-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-playfair mb-12 text-black">Your Cart</h1>
          <div className="py-16">
            <p className="text-xl font-montserrat text-gray-600 mb-8">Your cart is empty</p>
            <Link to="/products" className="btn-primary inline-block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 bg-beige-50">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-playfair mb-12 text-black text-center">Your Cart</h1>

        <div className="space-y-6 mb-8">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}-${item.color}`} className="bg-white p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-32 h-32 flex-shrink-0">
                  <img
                    src={item.image ? `/api/images/${item.image}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-montserrat font-semibold text-black">{item.name}</h3>
                  {item.isBundle && item.bundleDetails ? (
                    <div className="space-y-2 mt-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">Perfume 1</p>
                          <p className="font-medium text-gray-900 text-sm">{item.bundleDetails.perfume1Name}</p>
                          <span className="inline-block mt-1 bg-black text-white text-xs px-2 py-0.5 rounded">
                            {item.bundleDetails.size1}
                          </span>
                        </div>
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">Perfume 2</p>
                          <p className="font-medium text-gray-900 text-sm">{item.bundleDetails.perfume2Name}</p>
                          <span className="inline-block mt-1 bg-black text-white text-xs px-2 py-0.5 rounded">
                            {item.bundleDetails.size2}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="font-montserrat text-sm text-gray-600">Size: {item.size}</p>
                  )}
                  <p className="font-montserrat text-sm text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-lg font-montserrat font-bold text-black">{item.price} EGP</p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <div className="text-right">
                    <p className="text-xl font-montserrat font-bold text-black">
                      {(item.price * item.quantity).toLocaleString()} EGP
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id, item.size, item.color)}
                    className="text-sm font-montserrat text-gray-600 hover:text-black transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between font-montserrat">
              <span>Subtotal:</span>
              <span>{subtotal.toLocaleString()} EGP</span>
            </div>

            <div className="flex justify-between font-montserrat">
              <span>Delivery:</span>
              <span>{shippingFee} EGP</span>
            </div>

            <hr className="border-beige-300" />

            <div className="flex justify-between text-xl font-montserrat font-bold">
              <span>Total:</span>
              <span>{total.toLocaleString()} EGP</span>
            </div>
          </div>

          <div className="space-y-4">
            <Link to="/checkout" className="btn-primary w-full text-center block">
              Buy it now
            </Link>

            <Link to="/products" className="btn-secondary w-full text-center block">
              Remove
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 text-center mt-20">
        <h2 className="text-2xl font-playfair mb-2 text-black">ZT ADDICTION</h2>
        <p className="text-sm font-montserrat text-black mb-1">© 2025</p>
        <p className="text-sm font-montserrat text-black mb-6">Privacy Policy & Terms</p>
        
        <div className="flex justify-center gap-6">
          <a href="https://wa.me/201272558833" target="_blank" rel="noopener noreferrer" className="text-black hover:opacity-70 transition-opacity">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.05.547 4.063 1.587 5.814L0 24l6.352-1.529C8.937 23.453 10.938 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.701 0-3.361-.423-4.858-1.223l-.348-.2-3.613.87.886-3.532-.23-.365C2.163 15.714 1.818 13.9 1.818 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.521-7.5c-.301-.15-1.784-.882-2.063-.982-.279-.1-.482-.15-.682.15-.2.3-.776.982-.951 1.182-.175.2-.351.225-.652.075-.3-.15-1.263-.466-2.406-1.485-.889-.794-1.488-1.775-1.663-2.075-.175-.3-.019-.461.131-.61.134-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.682-1.625-.935-2.225-.245-.585-.491-.506-.682-.515-.176-.008-.376-.01-.576-.01-.2 0-.525.075-.8.375-.275.3-1.051 1.025-1.051 2.5 0 1.475 1.075 2.9 1.225 3.1.15.2 2.113 3.231 5.125 4.531.716.306 1.275.489 1.71.625.72.23 1.375.198 1.892.12.577-.092 1.776-.726 2.026-1.427.25-.701.25-1.3.175-1.427-.075-.127-.276-.2-.576-.35z"/>
            </svg>
          </a>
          <a href="https://www.tiktok.com/@zt.adicction?_r=1&_t=ZS-91QoCydFGgZ" target="_blank" rel="noopener noreferrer" className="text-black hover:opacity-70 transition-opacity">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 2.31-4.64 2.86 2.86 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.54-.05z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Cart;
