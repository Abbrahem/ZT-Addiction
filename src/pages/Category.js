import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { mockProducts } from '../data/mockData';

const Category = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quickAddPrice, setQuickAddPrice] = useState(0);
  const [selectedBundleSize1, setSelectedBundleSize1] = useState('');
  const [selectedBundleSize2, setSelectedBundleSize2] = useState('');
  const [selectedBundleSize3, setSelectedBundleSize3] = useState('');
  const [selectedBundleSize4, setSelectedBundleSize4] = useState('');
  const [activePerfume, setActivePerfume] = useState(1);
  const { addToCart } = useCart();

  // Helper functions for sold out handling
  const hasAvailableSizes = (perfume) => {
    if (!perfume?.sizesWithPrices || perfume.sizesWithPrices.length === 0) return false;
    return perfume.sizesWithPrices.some(s => !s.soldOut);
  };

  const getFirstAvailableSize = (perfume) => {
    if (!perfume?.sizesWithPrices) return null;
    return perfume.sizesWithPrices.find(s => !s.soldOut);
  };

  const isPerfumeFullySoldOut = (perfume) => {
    if (!perfume?.name || !perfume?.sizesWithPrices || perfume.sizesWithPrices.length === 0) return true;
    return perfume.sizesWithPrices.every(s => s.soldOut);
  };

  const categoryTitles = {
    'winter-samples': 'Winter Samples',
    'summer-samples': 'Summer Samples',
    'bundles': 'Bundles',
    'bottles': 'Bottles',
    'quantities-with-bottle': 'Quantities With Bottle'
  };

  useEffect(() => {
    fetchProducts();
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      const categoryCollection = categoryTitles[category];
      const filtered = response.data.filter(p => p.collection === categoryCollection);
      setProducts(filtered);
      setFilteredProducts(filtered);
    } catch (error) {
      console.log('Using mock data for development');
      const categoryCollection = categoryTitles[category];
      const filtered = mockProducts.filter(p => p.collection === categoryCollection);
      setProducts(filtered);
      setFilteredProducts(filtered);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.collection?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  };

  const handleQuickAdd = (product) => {
    if (product.soldOut) {
      Swal.fire({ icon: 'error', title: 'Sold Out', text: 'This product is currently sold out.' });
      return;
    }
    setQuickAddProduct(product);
    setActivePerfume(1);
    
    if (product.isBundle) {
      let totalPrice = 0;
      
      const availableSize1 = getFirstAvailableSize(product.bundlePerfume1);
      if (availableSize1) { setSelectedBundleSize1(availableSize1.size); totalPrice += availableSize1.price; }
      else { setSelectedBundleSize1(''); }
      
      const availableSize2 = getFirstAvailableSize(product.bundlePerfume2);
      if (availableSize2) { setSelectedBundleSize2(availableSize2.size); totalPrice += availableSize2.price; }
      else { setSelectedBundleSize2(''); }
      
      const availableSize3 = getFirstAvailableSize(product.bundlePerfume3);
      if (availableSize3) { setSelectedBundleSize3(availableSize3.size); totalPrice += availableSize3.price; }
      else { setSelectedBundleSize3(''); }
      
      const availableSize4 = getFirstAvailableSize(product.bundlePerfume4);
      if (availableSize4) { setSelectedBundleSize4(availableSize4.size); totalPrice += availableSize4.price; }
      else { setSelectedBundleSize4(''); }
      
      setQuickAddPrice(totalPrice);
    } else {
      if (product.sizesWithPrices && product.sizesWithPrices.length > 0) {
        const availableSize = product.sizesWithPrices.find(s => !s.soldOut);
        if (availableSize) {
          setSelectedSize(availableSize.size);
          setQuickAddPrice(availableSize.price);
        }
      } else if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
        setQuickAddPrice(product.priceEGP || 0);
      }
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    if (quickAddProduct.sizesWithPrices) {
      const sizeData = quickAddProduct.sizesWithPrices.find(item => item.size === size);
      if (sizeData) { setQuickAddPrice(sizeData.price); }
    }
  };

  const handleAddToCart = () => {
    if (quickAddProduct.isBundle) {
      const perfume1Available = hasAvailableSizes(quickAddProduct.bundlePerfume1);
      const perfume2Available = hasAvailableSizes(quickAddProduct.bundlePerfume2);
      const perfume3Exists = quickAddProduct.bundlePerfume3?.name;
      const perfume4Exists = quickAddProduct.bundlePerfume4?.name;
      const perfume3Available = perfume3Exists && hasAvailableSizes(quickAddProduct.bundlePerfume3);
      const perfume4Available = perfume4Exists && hasAvailableSizes(quickAddProduct.bundlePerfume4);
      
      if (perfume1Available && !selectedBundleSize1) {
        Swal.fire({ icon: 'warning', title: 'Select Size', text: 'Please select size for Perfume 1' });
        return;
      }
      if (perfume2Available && !selectedBundleSize2) {
        Swal.fire({ icon: 'warning', title: 'Select Size', text: 'Please select size for Perfume 2' });
        return;
      }
      if (perfume3Available && !selectedBundleSize3) {
        Swal.fire({ icon: 'warning', title: 'Select Size', text: 'Please select size for Perfume 3' });
        return;
      }
      if (perfume4Available && !selectedBundleSize4) {
        Swal.fire({ icon: 'warning', title: 'Select Size', text: 'Please select size for Perfume 4' });
        return;
      }
      
      let bundleSizeParts = [];
      if (selectedBundleSize1) bundleSizeParts.push(selectedBundleSize1);
      if (selectedBundleSize2) bundleSizeParts.push(selectedBundleSize2);
      if (selectedBundleSize3) bundleSizeParts.push(selectedBundleSize3);
      if (selectedBundleSize4) bundleSizeParts.push(selectedBundleSize4);
      const bundleSize = bundleSizeParts.join(' + ');
      
      const bundleDetails = {
        perfume1Name: selectedBundleSize1 ? quickAddProduct.bundlePerfume1.name : null,
        perfume2Name: selectedBundleSize2 ? quickAddProduct.bundlePerfume2.name : null,
        size1: selectedBundleSize1 || null,
        size2: selectedBundleSize2 || null,
        perfume3Name: selectedBundleSize3 ? quickAddProduct.bundlePerfume3?.name : null,
        size3: selectedBundleSize3 || null,
        perfume4Name: selectedBundleSize4 ? quickAddProduct.bundlePerfume4?.name : null,
        size4: selectedBundleSize4 || null
      };
      
      addToCart(quickAddProduct, bundleSize, 'Default', 1, quickAddPrice, bundleDetails);
    } else {
      if (!selectedSize) {
        Swal.fire({ icon: 'warning', title: 'Select Size', text: 'Please select a bottle size' });
        return;
      }
      addToCart(quickAddProduct, selectedSize, 'Default', 1, quickAddPrice);
    }

    Swal.fire({ icon: 'success', title: 'Added to Cart', text: `${quickAddProduct.name} has been added to your cart.`, timer: 1500, showConfirmButton: false });
    setQuickAddProduct(null);
    setSelectedSize('');
    setSelectedBundleSize1('');
    setSelectedBundleSize2('');
    setSelectedBundleSize3('');
    setSelectedBundleSize4('');
    setActivePerfume(1);
  };

  const ProductCard = ({ product }) => (
    <div className="group relative">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative overflow-hidden mb-4" style={{ paddingBottom: '120%' }}>
          <img
            src={product.images?.[0] ? `/api/images/${product.images[0]}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.soldOut && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-2 rounded text-sm font-medium">
                SOLD OUT
              </span>
            </div>
          )}
        </div>
        <h3 className="font-montserrat text-base md:text-lg mb-2 text-black leading-tight">{product.name}</h3>
        <p className="font-montserrat text-base md:text-lg font-semibold text-black">
          {product.isBundle 
            ? (product.priceEGP || ((product.bundlePerfume1?.sizesWithPrices?.[0]?.price || 0) + (product.bundlePerfume2?.sizesWithPrices?.[0]?.price || 0)))
            : (product.sizesWithPrices?.[0]?.price || product.priceEGP || 0)
          } EGP
        </p>
      </Link>
      
      {!product.soldOut && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleQuickAdd(product);
          }}
          className="absolute top-3 right-3 bg-white text-black p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-beige-50 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-playfair text-center mb-12 text-black">
          {categoryTitles[category] || 'Products'}
        </h1>

        {/* Search Bar */}
        <div className="mb-12 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Search for perfumes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 bg-white text-black border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none font-montserrat"
          />
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-600 font-montserrat">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:gap-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Modal */}
      {quickAddProduct && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => {
              setQuickAddProduct(null);
              setSelectedBundleSize1('');
              setSelectedBundleSize2('');
              setSelectedBundleSize3('');
              setSelectedBundleSize4('');
              setActivePerfume(1);
            }}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white z-50 p-4 sm:p-6 md:p-8 transform transition-transform duration-300 max-w-2xl mx-auto rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => {
                setQuickAddProduct(null);
                setSelectedBundleSize1('');
                setSelectedBundleSize2('');
                setSelectedBundleSize3('');
                setSelectedBundleSize4('');
                setActivePerfume(1);
              }}
              className="absolute top-4 right-4 text-black hover:opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-playfair text-lg sm:text-xl mb-2 pr-8">{quickAddProduct.name}</h3>
            <p className="font-montserrat text-base sm:text-lg font-semibold mb-4">{quickAddPrice} EGP</p>

            {quickAddProduct.isBundle ? (
              // Bundle Size Selectors with Circles
              <div className="space-y-4 mb-4">
                <div className="flex justify-center gap-3 flex-wrap mb-4">
                  {[1, 2, 3, 4].map((num) => {
                    const perfume = num === 1 ? quickAddProduct.bundlePerfume1 : num === 2 ? quickAddProduct.bundlePerfume2 : num === 3 ? quickAddProduct.bundlePerfume3 : quickAddProduct.bundlePerfume4;
                    const selectedSize = num === 1 ? selectedBundleSize1 : num === 2 ? selectedBundleSize2 : num === 3 ? selectedBundleSize3 : selectedBundleSize4;
                    if (!perfume?.name) return null;
                    
                    const isFullySoldOut = isPerfumeFullySoldOut(perfume);
                    
                    return (
                      <div key={num} onClick={() => !isFullySoldOut && setActivePerfume(num)} className={`transition-all ${isFullySoldOut ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${activePerfume === num && !isFullySoldOut ? 'scale-105' : 'opacity-70'}`}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-3 ${
                          isFullySoldOut ? 'border-red-300 bg-red-100 text-red-400' :
                          activePerfume === num ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-black'
                        }`}>
                          <span className={`text-lg font-bold ${isFullySoldOut ? 'line-through' : ''}`}>{num}</span>
                        </div>
                        <p className={`text-center mt-1 text-xs max-w-14 leading-tight truncate ${isFullySoldOut ? 'line-through text-red-400' : ''}`}>{perfume?.name}</p>
                        {isFullySoldOut ? (
                          <p className="text-center text-xs text-red-500">Sold Out</p>
                        ) : selectedSize ? (
                          <p className="text-center text-xs text-green-600">{selectedSize}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2 font-montserrat text-center">
                    {activePerfume === 1 && quickAddProduct.bundlePerfume1?.name}
                    {activePerfume === 2 && quickAddProduct.bundlePerfume2?.name}
                    {activePerfume === 3 && quickAddProduct.bundlePerfume3?.name}
                    {activePerfume === 4 && quickAddProduct.bundlePerfume4?.name}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(() => {
                      const perfume = activePerfume === 1 ? quickAddProduct.bundlePerfume1 : activePerfume === 2 ? quickAddProduct.bundlePerfume2 : activePerfume === 3 ? quickAddProduct.bundlePerfume3 : quickAddProduct.bundlePerfume4;
                      const currentSelectedSize = activePerfume === 1 ? selectedBundleSize1 : activePerfume === 2 ? selectedBundleSize2 : activePerfume === 3 ? selectedBundleSize3 : selectedBundleSize4;
                      
                      const allSoldOut = perfume?.sizesWithPrices?.every(s => s.soldOut);
                      if (allSoldOut) {
                        return (
                          <div className="col-span-2 text-center py-4 text-red-500">
                            All sizes are sold out for this perfume
                          </div>
                        );
                      }
                      
                      return perfume?.sizesWithPrices?.map((sizeData) => (
                        <button
                          key={sizeData.size}
                          onClick={() => {
                            if (!sizeData.soldOut) {
                              if (activePerfume === 1) setSelectedBundleSize1(sizeData.size);
                              else if (activePerfume === 2) setSelectedBundleSize2(sizeData.size);
                              else if (activePerfume === 3) setSelectedBundleSize3(sizeData.size);
                              else setSelectedBundleSize4(sizeData.size);
                              const p1 = activePerfume === 1 ? sizeData.price : (quickAddProduct.bundlePerfume1?.sizesWithPrices?.find(s => s.size === selectedBundleSize1)?.price || 0);
                              const p2 = activePerfume === 2 ? sizeData.price : (quickAddProduct.bundlePerfume2?.sizesWithPrices?.find(s => s.size === selectedBundleSize2)?.price || 0);
                              const p3 = activePerfume === 3 ? sizeData.price : (quickAddProduct.bundlePerfume3?.sizesWithPrices?.find(s => s.size === selectedBundleSize3)?.price || 0);
                              const p4 = activePerfume === 4 ? sizeData.price : (quickAddProduct.bundlePerfume4?.sizesWithPrices?.find(s => s.size === selectedBundleSize4)?.price || 0);
                              setQuickAddPrice(p1 + p2 + p3 + p4);
                            }
                          }}
                          disabled={sizeData.soldOut}
                          className={`px-3 py-2 font-montserrat transition-all text-sm relative ${sizeData.soldOut ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60' : currentSelectedSize === sizeData.size ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:bg-beige-100'}`}
                        >
                          <div className={sizeData.soldOut ? 'line-through' : ''}>{sizeData.size}</div>
                          <div className={`text-xs ${sizeData.soldOut ? 'line-through' : ''}`}>{sizeData.price} EGP</div>
                          {sizeData.soldOut && <div className="text-xs mt-0.5">Sold Out</div>}
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              // Regular Product Size Selector
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 font-montserrat">Select Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {quickAddProduct.sizesWithPrices ? 
                    quickAddProduct.sizesWithPrices.map((sizeData) => (
                      <button
                        key={sizeData.size}
                        onClick={() => {
                          if (!sizeData.soldOut) {
                            handleSizeChange(sizeData.size);
                          }
                        }}
                        disabled={sizeData.soldOut}
                        className={`px-3 py-2 font-montserrat transition-all text-sm relative ${
                          sizeData.soldOut
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                            : selectedSize === sizeData.size
                              ? 'bg-black text-white'
                              : 'bg-white text-black border border-gray-300 hover:bg-beige-100'
                        }`}
                      >
                        <div className={sizeData.soldOut ? 'line-through' : ''}>{sizeData.size}</div>
                        <div className={`text-xs ${sizeData.soldOut ? 'line-through' : ''}`}>{sizeData.price} EGP</div>
                        {sizeData.soldOut && (
                          <div className="text-xs mt-0.5" style={{ textDecoration: 'none' }}>Sold Out</div>
                        )}
                      </button>
                    )) :
                    quickAddProduct.sizes?.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`px-3 py-2 font-montserrat transition-all text-sm ${
                          selectedSize === size
                            ? 'bg-black text-white'
                            : 'bg-white text-black border border-gray-300 hover:bg-beige-100'
                        }`}
                      >
                        {size}
                      </button>
                    ))
                  }
                </div>
              </div>
            )}

            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={handleAddToCart}
                style={{ width: '70%' }}
                className="bg-black text-white px-4 sm:px-6 py-3 font-medium hover:bg-gray-800 transition-all font-montserrat text-sm sm:text-base"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  setQuickAddProduct(null);
                  setSelectedBundleSize1('');
                  setSelectedBundleSize2('');
                }}
                style={{ width: '30%' }}
                className="bg-white text-black border border-black px-4 sm:px-6 py-3 font-medium hover:bg-beige-100 transition-all font-montserrat text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

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

export default Category;
