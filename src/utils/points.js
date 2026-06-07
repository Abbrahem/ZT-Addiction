/**
 * Points System Utilities
 * كل 50 نقطة = 8% خصم
 */

const POINTS_PER_ORDER = 5; // نقاط لكل أوردر shipped
const POINTS_TO_DISCOUNT_RATIO = 10; // كل 10 نقاط (تم التغيير من 50)
const DISCOUNT_PER_RATIO = 1; // يساوي 1% خصم (تم التغيير من 8%)

/**
 * حساب الخصم من النقاط
 * @param {number} points - عدد النقاط
 * @returns {number} - نسبة الخصم
 */
export const calculateDiscount = (points) => {
  if (!points || points < POINTS_TO_DISCOUNT_RATIO) return 0;
  const ratio = Math.floor(points / POINTS_TO_DISCOUNT_RATIO);
  const discount = ratio * DISCOUNT_PER_RATIO;
  // ✅ Maximum 40% discount
  return Math.min(discount, 40);
};

/**
 * الحصول على النقاط من localStorage
 * @returns {number}
 */
export const getPoints = () => {
  try {
    const points = localStorage.getItem('userPoints');
    return points ? parseInt(points) : 0;
  } catch (error) {
    console.error('Error getting points:', error);
    return 0;
  }
};

/**
 * حفظ النقاط في localStorage
 * @param {number} points
 */
export const savePoints = (points) => {
  try {
    localStorage.setItem('userPoints', points.toString());
    // Trigger event للتحديث
    window.dispatchEvent(new Event('pointsUpdated'));
  } catch (error) {
    console.error('Error saving points:', error);
  }
};

/**
 * إضافة نقاط
 * @param {number} pointsToAdd
 */
export const addPoints = (pointsToAdd) => {
  const currentPoints = getPoints();
  const newPoints = currentPoints + pointsToAdd;
  savePoints(newPoints);
  return newPoints;
};

/**
 * خصم نقاط
 * @param {number} pointsToDeduct
 */
export const deductPoints = (pointsToDeduct) => {
  const currentPoints = getPoints();
  if (currentPoints < pointsToDeduct) {
    throw new Error('Not enough points');
  }
  const newPoints = currentPoints - pointsToDeduct;
  savePoints(newPoints);
  return newPoints;
};

/**
 * إضافة نقاط عند shipped order
 * @param {string} orderId
 */
export const addPointsForOrder = (orderId) => {
  try {
    // التأكد إن الأوردر ده ما اتضافش نقاط ليه قبل كده
    const processedOrders = JSON.parse(localStorage.getItem('pointsProcessedOrders') || '[]');
    
    if (processedOrders.includes(orderId)) {
      console.log('Points already added for this order');
      return false;
    }
    
    // إضافة النقاط
    const newPoints = addPoints(POINTS_PER_ORDER);
    
    // حفظ الأوردر كـ processed
    processedOrders.push(orderId);
    localStorage.setItem('pointsProcessedOrders', JSON.stringify(processedOrders));
    
    console.log(`✅ Added ${POINTS_PER_ORDER} points for order ${orderId}. Total: ${newPoints}`);
    return true;
  } catch (error) {
    console.error('Error adding points for order:', error);
    return false;
  }
};

/**
 * توليد كود بروموكشن عشوائي
 * @returns {string}
 */
export const generatePromoCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'ZT-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const pointsUtils = {
  calculateDiscount,
  getPoints,
  savePoints,
  addPoints,
  deductPoints,
  addPointsForOrder,
  generatePromoCode,
  POINTS_PER_ORDER
};

export default pointsUtils;
