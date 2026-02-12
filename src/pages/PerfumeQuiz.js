import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import Swal from 'sweetalert2';
import { useCart } from '../context/CartContext';

const PerfumeQuiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quickAddPrice, setQuickAddPrice] = useState(0);
  const { addToCart } = useCart();

  const questions = [
    {
      id: 1,
      question: 'ما هي المناسبة التي تبحث عنها؟',
      options: [
        { value: 'daily', label: 'استخدام يومي', icon: '☀️' },
        { value: 'special', label: 'مناسبات خاصة', icon: '✨' },
        { value: 'work', label: 'العمل والاجتماعات', icon: '💼' },
        { value: 'sport', label: 'رياضة ونشاط', icon: '⚡' }
      ]
    },
    {
      id: 2,
      question: 'ما قوة العطر المفضلة لديك؟',
      options: [
        { value: 'light', label: 'خفيف ومنعش', icon: '🌸' },
        { value: 'medium', label: 'متوسط ومتوازن', icon: '🌺' },
        { value: 'strong', label: 'قوي وثابت', icon: '🥀' },
        { value: 'intense', label: 'مكثف وفاخر', icon: '💎' }
      ]
    },
    {
      id: 3,
      question: 'ما الموسم المفضل لديك؟',
      options: [
        { value: 'summer', label: 'الصيف', icon: '🌞' },
        { value: 'winter', label: 'الشتاء', icon: '❄️' },
        { value: 'spring', label: 'الربيع', icon: '🌷' },
        { value: 'all', label: 'كل المواسم', icon: '🌍' }
      ]
    },
    {
      id: 4,
      question: 'ما هي ميزانيتك؟',
      options: [
        { value: 'budget', label: 'أقل من 1000 جنيه', icon: '💰' },
        { value: 'medium', label: 'من 1000 إلى 3000 جنيه', icon: '💵' },
        { value: 'premium', label: 'من 3000 إلى 7000 جنيه', icon: '💸' },
        { value: 'luxury', label: 'أكثر من 7000 جنيه', icon: '👑' }
      ]
    },
    {
      id: 5,
      question: 'ما النوتات المفضلة لديك؟',
      options: [
        { value: 'fruity', label: 'فواكه منعشة', icon: '🍊' },
        { value: 'floral', label: 'زهور رومانسية', icon: '🌹' },
        { value: 'woody', label: 'خشبي دافئ', icon: '🌲' },
        { value: 'spicy', label: 'توابل شرقية', icon: '🔥' }
      ]
    },
    {
      id: 6,
      question: 'ما الوقت المفضل للاستخدام؟',
      options: [
        { value: 'morning', label: 'الصباح', icon: '🌅' },
        { value: 'afternoon', label: 'بعد الظهر', icon: '☀️' },
        { value: 'evening', label: 'المساء', icon: '🌆' },
        { value: 'night', label: 'الليل', icon: '🌙' }
      ]
    }
  ];

  const handleOptionSelect = (value) => {
    setSelectedOption(value);
  };

  const handleNext = () => {
    if (!selectedOption) {
      Swal.fire({
        icon: 'warning',
        title: 'اختر إجابة',
        text: 'من فضلك اختر إجابة قبل المتابعة',
        confirmButtonColor: '#000'
      });
      return;
    }

    setAnswers({ ...answers, [questions[currentQuestion].id]: selectedOption });
    setSelectedOption(null);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Finished all questions
      analyzeAnswers({ ...answers, [questions[currentQuestion].id]: selectedOption });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[questions[currentQuestion - 1].id] || null);
    }
  };

  const analyzeAnswers = async (finalAnswers) => {
    setLoading(true);
    
    try {
      const response = await axios.get('/api/products');
      let products = response.data;

      console.log('Total products:', products.length);
      console.log('Answers:', finalAnswers);

      // Filter out sold out products first
      products = products.filter(p => !p.soldOut);
      console.log('After removing sold out:', products.length);

      // Filter based on budget (most important filter)
      if (finalAnswers[4] === 'budget') {
        products = products.filter(p => {
          const price = p.sizesWithPrices?.[0]?.price || p.priceEGP || 0;
          return price < 1000;
        });
      } else if (finalAnswers[4] === 'medium') {
        products = products.filter(p => {
          const price = p.sizesWithPrices?.[0]?.price || p.priceEGP || 0;
          return price >= 1000 && price <= 3000;
        });
      } else if (finalAnswers[4] === 'premium') {
        products = products.filter(p => {
          const price = p.sizesWithPrices?.[0]?.price || p.priceEGP || 0;
          return price > 3000 && price <= 7000;
        });
      } else if (finalAnswers[4] === 'luxury') {
        products = products.filter(p => {
          const price = p.sizesWithPrices?.[0]?.price || p.priceEGP || 0;
          return price > 7000;
        });
      }

      console.log('After budget filter:', products.length);

      // Try to filter by season, but if results are too few, skip this filter
      let seasonFiltered = [...products];
      if (finalAnswers[3] === 'summer') {
        seasonFiltered = products.filter(p => 
          p.collection?.toLowerCase().includes('summer') || 
          p.name?.toLowerCase().includes('summer')
        );
      } else if (finalAnswers[3] === 'winter') {
        seasonFiltered = products.filter(p => 
          p.collection?.toLowerCase().includes('winter') || 
          p.name?.toLowerCase().includes('winter')
        );
      }

      // Use season filter only if we have enough products
      if (seasonFiltered.length >= 4) {
        products = seasonFiltered;
      }

      console.log('Final products count:', products.length);

      // Shuffle and get top 4
      const shuffled = products.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 4);
      
      console.log('Selected products:', selected.length);
      
      setRecommendedProducts(selected);
      setShowResults(true);
      
      // Notification request is now handled in App.js globally
      // No need to request here anymore
    } catch (error) {
      console.error('Error fetching products:', error);
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'حدث خطأ في تحليل إجاباتك. حاول مرة أخرى.',
        confirmButtonColor: '#000'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (product) => {
    setQuickAddProduct(product);
    if (product.sizesWithPrices && product.sizesWithPrices.length > 0) {
      const availableSize = product.sizesWithPrices.find(s => !s.soldOut);
      if (availableSize) {
        setSelectedSize(availableSize.size);
        setQuickAddPrice(availableSize.price);
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: 'اختر المقاس',
        text: 'من فضلك اختر مقاس العطر',
        confirmButtonColor: '#000'
      });
      return;
    }

    addToCart(quickAddProduct, selectedSize, 'Default', 1, quickAddPrice);
    Swal.fire({
      icon: 'success',
      title: 'تمت الإضافة',
      text: `تم إضافة ${quickAddProduct.name} إلى السلة`,
      timer: 1500,
      showConfirmButton: false
    });
    setQuickAddProduct(null);
    setSelectedSize('');
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-white to-beige-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black mx-auto mb-4"></div>
          <p className="font-playfair text-2xl text-black">جاري تحليل إجاباتك...</p>
          <p className="font-montserrat text-gray-600 mt-2">نبحث عن أفضل العطور المناسبة لك</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-white to-beige-100 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-4xl">✨</span>
              </div>
            </div>
            <h1 className="text-5xl font-playfair mb-4 text-black">عطورك المثالية</h1>
            <p className="text-xl font-montserrat text-gray-600 max-w-2xl mx-auto">
              بناءً على إجاباتك، اخترنا لك أفضل العطور التي تناسب ذوقك وشخصيتك
            </p>
          </div>

          {/* Products Grid */}
          {recommendedProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-12">
              {recommendedProducts.map((product) => (
                <ProductCard key={product._id} product={product} onQuickAdd={handleQuickAdd} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-2xl font-playfair text-gray-600 mb-6">
                عذراً، لم نجد عطور مناسبة لإجاباتك حالياً
              </p>
              <button
                onClick={() => navigate('/products')}
                className="btn-primary"
              >
                تصفح جميع العطور
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setSelectedOption(null);
                setShowResults(false);
              }}
              className="btn-secondary px-8 py-3"
            >
              🔄 إعادة الاختبار
            </button>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary px-8 py-3"
            >
              🛍️ تصفح جميع العطور
            </button>
          </div>
        </div>

        {/* Quick Add Modal */}
        {quickAddProduct && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setQuickAddProduct(null)}
            />
            <div className="fixed bottom-0 left-0 right-0 bg-white z-50 p-6 transform transition-transform duration-300 max-w-2xl mx-auto rounded-t-2xl">
              <button 
                onClick={() => setQuickAddProduct(null)}
                className="absolute top-4 right-4 text-black hover:opacity-70"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="font-playfair text-xl mb-2 pr-8">{quickAddProduct.name}</h3>
              <p className="font-montserrat text-lg font-semibold mb-4">{quickAddPrice} EGP</p>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 font-montserrat">اختر المقاس</label>
                <div className="grid grid-cols-2 gap-2">
                  {quickAddProduct.sizesWithPrices?.map((sizeData) => (
                    <button
                      key={sizeData.size}
                      onClick={() => {
                        if (!sizeData.soldOut) {
                          setSelectedSize(sizeData.size);
                          setQuickAddPrice(sizeData.price);
                        }
                      }}
                      disabled={sizeData.soldOut}
                      className={`px-3 py-2 font-montserrat transition-all text-sm ${
                        sizeData.soldOut
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : selectedSize === sizeData.size
                            ? 'bg-black text-white'
                            : 'bg-white text-black border border-gray-300 hover:bg-beige-100'
                      }`}
                    >
                      <div>{sizeData.size}</div>
                      <div className="text-xs">{sizeData.price} EGP</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-primary w-full"
              >
                إضافة إلى السلة
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-white to-beige-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair mb-4 text-black">اكتشف عطرك المثالي</h1>
          <p className="text-lg font-montserrat text-gray-600">أجب على بعض الأسئلة لنساعدك في اختيار العطر المناسب</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="font-montserrat text-sm text-gray-600">
              السؤال {currentQuestion + 1} من {questions.length}
            </span>
            <span className="font-montserrat text-sm font-semibold text-black">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-8 transform transition-all duration-500">
          <h2 className="text-2xl md:text-3xl font-playfair mb-8 text-center text-black">
            {questions[currentQuestion].question}
          </h2>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {questions[currentQuestion].options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedOption === option.value
                    ? 'border-black bg-black text-white shadow-xl'
                    : 'border-gray-200 bg-white text-black hover:border-gray-400 hover:shadow-lg'
                }`}
              >
                <div className="text-4xl mb-3">{option.icon}</div>
                <div className="font-montserrat font-medium text-lg">{option.label}</div>
                
                {/* Checkmark */}
                {selectedOption === option.value && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentQuestion > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-200 text-black px-6 py-4 rounded-xl font-montserrat font-medium hover:bg-gray-300 transition-all"
              >
                ← السابق
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-4 rounded-xl font-montserrat font-bold hover:from-yellow-500 hover:to-yellow-700 transition-all shadow-lg ${
                currentQuestion === 0 ? 'w-full' : ''
              }`}
            >
              {currentQuestion === questions.length - 1 ? 'عرض النتائج ✨' : 'التالي →'}
            </button>
          </div>
        </div>

        {/* Skip Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="font-montserrat text-gray-600 hover:text-black transition-colors underline"
          >
            تخطي الاختبار
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerfumeQuiz;
