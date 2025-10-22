import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { mockProducts } from '../data/mockData';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [otherProducts, setOtherProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
    fetchOtherProducts();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      const productData = Array.isArray(response.data) ? response.data[0] : response.data;
      setProduct(productData);
      if (productData.sizes?.length > 0) {
        setSelectedSize(productData.sizes[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      const mockProduct = mockProducts.find(p => p._id === id);
      if (mockProduct) {
        setProduct(mockProduct);
        if (mockProduct.sizes?.length > 0) {
          setSelectedSize(mockProduct.sizes[0]);
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Product Not Found',
          text: 'The product you are looking for does not exist.'
        }).then(() => {
          navigate('/products');
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherProducts = async () => {
    try {
      const response = await axios.get(`/api/products?limit=4&random=true&exclude=${id}`);
      setOtherProducts(response.data);
    } catch (error) {
      // Shuffle mock products randomly and exclude current product
      const shuffled = [...mockProducts]
        .filter(p => p._id !== id)
        .sort(() => Math.random() - 0.5);
      setOtherProducts(shuffled.slice(0, 4));
    }
  };

  const handleAddToCart = () => {
    if (product.soldOut) {
      Swal.fire({
        icon: 'error',
        title: 'Sold Out',
        text: 'This product is currently sold out.'
      });
      return;
    }

    if (!selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Selection',
        text: 'Please select a bottle size before adding to cart.'
      });
      return;
    }

    addToCart(product, selectedSize, 'Default', quantity);
    Swal.fire({
      icon: 'success',
      title: 'Added to Cart',
      text: `${product.name} has been added to your cart.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleBuyNow = () => {
    if (product.soldOut) {
      Swal.fire({
        icon: 'error',
        title: 'Sold Out',
        text: 'This product is currently sold out.'
      });
      return;
    }

    if (!selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Selection',
        text: 'Please select a bottle size before proceeding.'
      });
      return;
    }

    addToCart(product, selectedSize, 'Default', quantity);
    navigate('/checkout');
  };

  const updateQuantity = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50">
        <div className="text-xl font-montserrat">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50">
        <div className="text-xl font-montserrat">Product not found</div>
      </div>
    );
  }

  const ProductCard = ({ product }) => (
    <div className="group relative">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative overflow-hidden mb-3" style={{ paddingBottom: '75%' }}>
          <img
            src={product.images?.[0] ? `/api/images/${product.images[0]}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
        <p className="font-montserrat text-sm md:text-base font-semibold text-black">{product.priceEGP} EGP</p>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-beige-50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Image Carousel */}
        <div className="mb-8">
          <div className="relative overflow-x-auto scrollbar-hide" style={{ height: '60vh' }}>
            <div className="flex space-x-4 h-full">
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <div key={index} className="flex-shrink-0 h-full" style={{ width: '80vw', maxWidth: '600px' }}>
                    <img
                      src={`/api/images/${image}`}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="flex-shrink-0 h-full bg-gray-200" style={{ width: '80vw', maxWidth: '600px' }}>
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-playfair text-black">{product.name}</h1>
          <p className="text-2xl font-montserrat font-semibold text-black">{product.priceEGP} EGP</p>

          <hr className="border-beige-300" />

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              {product.sizes.length === 1 ? (
                <div className="w-full bg-black text-white px-6 py-4 text-center font-montserrat">
                  {product.sizes[0]}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-4 font-montserrat transition-all ${
                        selectedSize === size
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-beige-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <hr className="border-beige-300" />

          {/* Size Guide Dropdown */}
          <div>
            <button
              onClick={() => setSizeGuideOpen(!sizeGuideOpen)}
              className="w-full flex justify-between items-center py-4 font-montserrat text-black"
            >
              <span>Size Guide</span>
              <svg className={`w-5 h-5 transition-transform ${sizeGuideOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {sizeGuideOpen && (
              <div className="pb-4">
                <img src="/shart.jpg" alt="Size Guide" className="w-full max-w-md" />
              </div>
            )}
          </div>

          <hr className="border-beige-300" />

          {/* Add to Cart & Quantity */}
          {product.soldOut ? (
            <button
              disabled
              className="w-full bg-gray-400 text-white px-6 py-4 font-montserrat cursor-not-allowed text-lg font-semibold"
            >
              SOLD OUT
            </button>
          ) : (
            <>
              <div className="flex gap-2 sm:gap-4">
                <button
                  onClick={handleAddToCart}
                  style={{ width: '70%' }}
                  className="bg-black text-white px-4 sm:px-6 py-4 font-montserrat hover:bg-gray-800 transition-all text-sm sm:text-base"
                >
                  Add to Cart
                </button>
                <div className="flex items-center bg-white border border-gray-300" style={{ width: '30%' }}>
                  <button
                    onClick={() => updateQuantity(-1)}
                    disabled={quantity <= 1}
                    className="flex-1 py-4 hover:bg-beige-100 disabled:opacity-50 font-montserrat text-lg"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-montserrat">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(1)}
                    disabled={quantity >= 10}
                    className="flex-1 py-4 hover:bg-beige-100 disabled:opacity-50 font-montserrat text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-black text-white px-6 py-4 font-montserrat hover:bg-gray-800 transition-all"
              >
                Buy it now
              </button>
            </>
          )}

          <hr className="border-beige-300" />

          {/* Description Dropdown */}
          <div>
            <button
              onClick={() => setDescriptionOpen(!descriptionOpen)}
              className="w-full flex justify-between items-center py-4 font-montserrat text-black"
            >
              <span>Description</span>
              <svg className={`w-5 h-5 transition-transform ${descriptionOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {descriptionOpen && (
              <div className="pb-4 font-montserrat text-gray-700">
                {product.description || 'No description available.'}
              </div>
            )}
          </div>
        </div>

        {/* Other Products */}
        <section className="mt-20">
          <h2 className="text-3xl font-playfair text-center mb-12 text-black">Others Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {otherProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
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

export default ProductDetail;
