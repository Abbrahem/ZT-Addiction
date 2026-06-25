import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import Swal from 'sweetalert2';
import { getProductPath } from '../utils/productUtils';

const ProductCard = ({ product, onQuickAdd }) => {
  const { addToWishlist, isInWishlist } = useWishlist();

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product._id)) {
      Swal.fire({
        icon: 'info',
        title: 'Already in Wishlist',
        timer: 1000,
        showConfirmButton: false
      });
    } else {
      addToWishlist(product);
      Swal.fire({
        icon: 'success',
        title: 'Added to Wishlist',
        timer: 1000,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="group relative">
      <Link to={getProductPath(product)} className="block">
        <div className="relative overflow-hidden mb-3 bg-gray-50" style={{ paddingBottom: '133%' }}>
          <img
            src={product.images?.[0] ? `/api/images/${product.images[0]}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
          {product.soldOut && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                SOLD OUT
              </span>
            </div>
          )}
        </div>
        <h3 className="font-montserrat text-sm md:text-base mb-1 text-black leading-tight">{product.name}</h3>
        <p className="font-montserrat text-sm md:text-base font-semibold text-black">
          {(() => {
            // For bundle products, calculate price from perfumes
            if (product.isBundle || product.collection === 'Bundles') {
              const p1 = product.bundlePerfume1?.sizesWithPrices?.[0]?.price || 0;
              const p2 = product.bundlePerfume2?.sizesWithPrices?.[0]?.price || 0;
              const p3 = product.bundlePerfume3?.sizesWithPrices?.[0]?.price || 0;
              const p4 = product.bundlePerfume4?.sizesWithPrices?.[0]?.price || 0;
              const p5 = product.bundlePerfume5?.sizesWithPrices?.[0]?.price || 0;
              const totalPrice = p1 + p2 + p3 + p4 + p5;
              
              // Debug log
              if (totalPrice === 0) {
                console.log('Bundle price is 0 for:', product.name, {
                  collection: product.collection,
                  isBundle: product.isBundle,
                  p1, p2, p3, p4, p5,
                  bundlePerfume1: product.bundlePerfume1,
                  bundlePerfume2: product.bundlePerfume2
                });
              }
              
              return totalPrice > 0 ? `${totalPrice} EGP` : '0 EGP';
            }
            // For regular products
            return product.sizesWithPrices && product.sizesWithPrices.length > 0 
              ? `${product.sizesWithPrices[0].price} EGP` 
              : `${product.priceEGP || 0} EGP`;
          })()}
        </p>
      </Link>
      
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
        {/* Quick Add Button (if provided) */}
        {onQuickAdd && !product.soldOut && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickAdd(product);
            }}
            className="bg-white text-black p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
        )}
        
        {/* Wishlist Heart Icon */}
        <button
          onClick={handleWishlistClick}
          className="bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
        >
          <svg 
            className="w-4 h-4" 
            fill={isInWishlist(product._id) ? '#ef4444' : 'none'} 
            stroke={isInWishlist(product._id) ? '#ef4444' : 'currentColor'} 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      
      {/* Badge - Top Left (for Best Selling or Best Reviews) */}
      <div className="absolute top-2 left-2 z-10">
        {product.isBestSeller ? (
          <div className="bg-black text-white px-1.5 py-0.5 rounded-full shadow-lg text-[9px] font-montserrat font-semibold">
            BEST SELLING
          </div>
        ) : product.isBestReview ? (
          <div className="bg-amber-500 text-white px-1.5 py-0.5 rounded-full shadow-lg text-[9px] font-montserrat font-semibold">
            BEST REVIEWS
          </div>
        ) : (
          <Link
            to={`${getProductPath(product)}?scrollToReviews=true`}
            onClick={(e) => e.stopPropagation()}
            className="bg-amber-500 text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 hover:bg-amber-600 flex items-center justify-center"
            title="Rate this product"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
