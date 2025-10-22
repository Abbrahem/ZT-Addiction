import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const shippingFee = 120;
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
                  <p className="font-montserrat text-sm text-gray-600">Size: {item.size}</p>
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
        <p className="text-sm font-montserrat text-black">Privacy Policy & Terms</p>
      </footer>
    </div>
  );
};

export default Cart;
