import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { getPoints, calculateDiscount, deductPoints, generatePromoCode } from '../utils/points';

const PointsSection = () => {
  const [points, setPoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInsufficientMessage, setShowInsufficientMessage] = useState(false);

  useEffect(() => {
    loadPoints();
    
    // Listen for points updates
    const handlePointsUpdate = () => {
      loadPoints();
    };
    
    window.addEventListener('pointsUpdated', handlePointsUpdate);
    return () => window.removeEventListener('pointsUpdated', handlePointsUpdate);
  }, []);

  const loadPoints = () => {
    const userPoints = getPoints();
    setPoints(userPoints);
  };

  const handlePointsChange = (e) => {
    const value = e.target.value;
    setPointsToUse(value);
    setShowInsufficientMessage(false);
    
    if (value && !isNaN(value)) {
      const pointsNum = parseInt(value);
      
      // ✅ Max 400 points (40% discount)
      if (pointsNum > 400) {
        setPointsToUse('400');
        const calculatedDiscount = calculateDiscount(400);
        setDiscount(calculatedDiscount);
        return;
      }
      
      if (pointsNum > points) {
        setDiscount(0);
        setShowInsufficientMessage(true);
        return;
      }
      const calculatedDiscount = calculateDiscount(pointsNum);
      setDiscount(calculatedDiscount);
    } else {
      setDiscount(0);
    }
  };

  const handleRedeem = async () => {
    const pointsNum = parseInt(pointsToUse);
    
    // Validation
    if (!pointsNum || pointsNum < 10) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Minimum 10 points required',
        confirmButtonColor: '#000'
      });
      return;
    }
    
    if (pointsNum > points) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Insufficient points',
        confirmButtonColor: '#000'
      });
      return;
    }
    
    if (pointsNum % 10 !== 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Points must be multiples of 10',
        confirmButtonColor: '#000'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const code = generatePromoCode();
      
      const response = await axios.post('/api/orders/promo', {
        discount: discount,
        maxUses: 1,
        expiryDays: 30,
        code: code,
        fromPoints: true,
        pointsUsed: pointsNum
      });
      
      if (response.data.promoCode) {
        deductPoints(pointsNum);
        setPromoCode(response.data.promoCode.code);
        setPoints(points - pointsNum);
        setPointsToUse('');
        setDiscount(0);
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          html: `
            <p style="margin-bottom: 15px;">Your discount code:</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="font-size: 24px; font-weight: bold; color: #000; margin: 0;">${response.data.promoCode.code}</p>
            </div>
            <p style="color: #ef4444; font-weight: bold;">⚠️ One-time use only</p>
            <p>${discount}% OFF - Valid for 30 days</p>
          `,
          confirmButtonText: 'Copy Code',
          confirmButtonColor: '#000'
        }).then((result) => {
          if (result.isConfirmed) {
            navigator.clipboard.writeText(response.data.promoCode.code);
            Swal.fire({
              icon: 'success',
              title: 'Copied!',
              text: 'Use at checkout',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    } catch (error) {
      console.error('Error creating promo code:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please try again',
        confirmButtonColor: '#000'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPromoCode = () => {
    if (promoCode) {
      navigator.clipboard.writeText(promoCode);
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Use at checkout',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-playfair mb-3 text-black whitespace-nowrap">Catch a Discount</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="text-gray-600 font-montserrat">Your Points:</span>
          <span className="text-3xl font-bold text-black">{points}</span>
        </div>
      </div>

      {/* Inputs */}
      <div className="max-w-md mx-auto space-y-4 mb-4">
        {/* Points Input */}
        <div>
          <label className="block text-sm text-gray-700 mb-2 font-montserrat">Use Points</label>
          <input
            type="number"
            value={pointsToUse}
            onChange={handlePointsChange}
            placeholder="10, 20, 30..."
            min="0"
            max="400"
            step="10"
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors font-montserrat"
          />
          {showInsufficientMessage && (
            <p className="text-red-600 text-sm mt-1 font-montserrat">Don't have enough points</p>
          )}
        </div>

        {/* Discount Display */}
        <div>
          <label className="block text-sm text-gray-700 mb-2 font-montserrat">Discount</label>
          <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg text-center">
            <span className="text-3xl font-bold text-black">{discount}%</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600 text-center font-montserrat">
        Every 10 points = 1% discount
      </div>

      {/* Redeem Button */}
      <button
        onClick={handleRedeem}
        disabled={loading || !pointsToUse || points < 10}
        className="w-full max-w-md mx-auto block bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-black font-montserrat"
      >
        {loading ? 'Creating...' : 'Redeem Now'}
      </button>

      {/* Promo Code Display */}
      {promoCode && (
        <div className="mt-6 max-w-md mx-auto animate-fadeIn">
          <p className="text-sm text-gray-600 mb-2 text-center font-montserrat">Your Code:</p>
          <div 
            onClick={copyPromoCode}
            className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-black transition-colors"
          >
            <p className="text-2xl font-bold text-black tracking-wider font-montserrat">{promoCode}</p>
          </div>
          <p className="text-sm text-red-600 font-bold text-center mt-2 font-montserrat">
            One-time use only
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PointsSection;
