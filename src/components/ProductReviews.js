import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/products/${productId}/reviews`);
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.averageRating || 0);
      setReviewCount(response.data.reviewCount || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'يرجى كتابة تعليق',
        confirmButtonColor: '#000'
      });
      return;
    }

    try {
      await axios.post(`/api/products/${productId}/review`, {
        rating,
        comment: comment.trim(),
        userName: userName.trim() || userEmail.split('@')[0] || 'مستخدم',
        userEmail: userEmail.trim() || 'anonymous@example.com'
      });

      Swal.fire({
        icon: 'success',
        title: 'شكراً لك!',
        text: 'تم إضافة تقييمك بنجاح',
        confirmButtonColor: '#000',
        timer: 2000
      });

      // Reset form
      setComment('');
      setUserName('');
      setUserEmail('');
      setRating(5);

      // Refresh reviews
      fetchReviews();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'حدث خطأ أثناء إضافة التقييم',
        confirmButtonColor: '#000'
      });
    }
  };

  const renderStars = (rating, interactive = false, onHover = null, onClick = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''}`}
            fill={star <= (interactive ? (hoveredRating || rating) : rating) ? '#fbbf24' : '#e5e7eb'}
            viewBox="0 0 20 20"
            onMouseEnter={() => interactive && onHover && onHover(star)}
            onMouseLeave={() => interactive && onHover && onHover(0)}
            onClick={() => interactive && onClick && onClick(star)}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 4);

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="mt-12 border-t pt-8">
      {/* Average Rating Summary */}
      {reviewCount > 0 && (
        <div className="mb-8 flex items-center gap-4 bg-gray-50 p-6 rounded-lg">
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-500">{averageRating.toFixed(1)}</div>
            <div className="mt-2">{renderStars(Math.round(averageRating))}</div>
            <div className="text-sm text-gray-600 mt-1">{reviewCount} تقييم</div>
          </div>
        </div>
      )}

      {/* Add Review Form */}
      <div className="mb-8 bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-bold mb-4">أضف تقييمك</h3>
        <form onSubmit={handleSubmitReview}>
          {/* Rating Stars */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">التقييم</label>
            {renderStars(rating, true, setHoveredRating, setRating)}
          </div>

          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">الاسم (اختياري)</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="اسمك"
            />
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني (اختياري)</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>

          {/* Comment Textarea */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">التعليق *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              placeholder="شاركنا رأيك في المنتج..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            إرسال التقييم
          </button>
        </form>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div>
          <h3 className="text-xl font-bold mb-4">التقييمات ({reviewCount})</h3>
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <div key={review._id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium">{review.userName}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>

          {/* Show More Button */}
          {reviews.length > 4 && !showAllReviews && (
            <button
              onClick={() => setShowAllReviews(true)}
              className="mt-4 w-full py-3 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors font-medium"
            >
              عرض المزيد ({reviews.length - 4} تقييم)
            </button>
          )}

          {/* Show All Reviews Modal */}
          {showAllReviews && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between">
                  <h3 className="text-2xl font-bold">جميع التقييمات ({reviewCount})</h3>
                  <button
                    onClick={() => setShowAllReviews(false)}
                    className="text-gray-500 hover:text-black transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{review.userName}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                            </div>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t">
                  <button
                    onClick={() => setShowAllReviews(false)}
                    className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!</p>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
