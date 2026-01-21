import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import Swal from 'sweetalert2';

const Wishlist = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();

  const handleRemove = (id) => {
    Swal.fire({
      title: 'Remove from Wishlist?',
      text: 'Are you sure you want to remove this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it'
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromWishlist(id);
        Swal.fire({
          icon: 'success',
          title: 'Removed',
          timer: 1000,
          showConfirmButton: false
        });
      }
    });
  };

  const handleClearAll = () => {
    Swal.fire({
      title: 'Clear Wishlist?',
      text: 'Are you sure you want to remove all items?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear all'
    }).then((result) => {
      if (result.isConfirmed) {
        clearWishlist();
        Swal.fire({
          icon: 'success',
          title: 'Wishlist Cleared',
          timer: 1000,
          showConfirmButton: false
        });
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-beige-50 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h1 className="text-3xl font-playfair mb-4 text-black">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-8 font-montserrat">
            Start adding products you love to your wishlist
          </p>
          <Link
            to="/products"
            className="inline-block px-8 py-3 bg-black text-white font-montserrat hover:bg-gray-800 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-playfair text-black">My Wishlist</h1>
          <button
            onClick={handleClearAll}
            className="text-red-600 hover:text-red-700 font-montserrat text-sm"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md group relative">
              <Link to={`/products/${item.id}`}>
                <div className="relative overflow-hidden" style={{ paddingBottom: '100%' }}>
                  <img
                    src={item.image ? `/api/images/${item.image}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </Link>
              
              <div className="p-4">
                <Link to={`/products/${item.id}`}>
                  <h3 className="font-montserrat text-sm mb-2 text-black hover:opacity-70 transition-opacity line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="font-montserrat text-sm font-semibold text-black mb-4">
                    {item.price} EGP
                  </p>
                </Link>
                
                <div className="flex flex-col gap-2">
                  <Link
                    to={`/products/${item.id}`}
                    className="w-full px-3 py-2.5 bg-black text-white text-xs font-montserrat hover:bg-gray-800 transition-colors text-center"
                  >
                    View Product
                  </Link>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="w-full px-3 py-2.5 border border-red-500 text-red-500 text-xs font-montserrat hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
