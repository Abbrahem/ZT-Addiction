// Telegram notification helper
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Send notification to Telegram
 */
async function sendTelegramNotification(title, message, data = {}) {
  // Check if Telegram is configured
  console.log('🔍 Telegram config check:', {
    hasToken: !!TELEGRAM_BOT_TOKEN,
    hasChatId: !!TELEGRAM_CHAT_ID,
    tokenLength: TELEGRAM_BOT_TOKEN?.length,
    chatId: TELEGRAM_CHAT_ID
  });
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('⚠️ Telegram not configured - skipping notification');
    console.log('⚠️ TELEGRAM_BOT_TOKEN:', TELEGRAM_BOT_TOKEN ? 'exists' : 'missing');
    console.log('⚠️ TELEGRAM_CHAT_ID:', TELEGRAM_CHAT_ID ? 'exists' : 'missing');
    return { success: false, error: 'Not configured' };
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

    if (response.data.ok) {
      console.log('✅ Telegram notification sent successfully');
      return { success: true, messageId: response.data.result.message_id };
    } else {
      console.error('❌ Telegram API error:', response.data);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.error('❌ Error sending Telegram notification:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send new order notification to Telegram
 */
async function sendNewOrderNotification(order) {
  const { customer, items, total, shippingFee, _id } = order;
  
  // Format items list
  const itemsList = items.map((item, index) => {
    return `   ${index + 1}. ${item.name} - ${item.size || ''} (${item.quantity}x)`;
  }).join('\n');
  
  // Build message
  const message = `
🛍️ <b>طلب جديد!</b>

📋 <b>رقم الطلب:</b> <code>${_id}</code>

👤 <b>بيانات العميل:</b>
   الاسم: ${customer.name}
   📱 التليفون 1: ${customer.phone1}
   ${customer.phone2 ? `📱 التليفون 2: ${customer.phone2}` : ''}
   📍 العنوان: ${customer.address}
   ${customer.governorate ? `🏙️ المحافظة: ${customer.governorate}` : ''}

📦 <b>المنتجات:</b>
${itemsList}

💰 <b>المبلغ:</b>
   المنتجات: ${total - shippingFee} جنيه
   الشحن: ${shippingFee} جنيه
   <b>الإجمالي: ${total} جنيه</b>

🕐 <b>الوقت:</b> ${new Date().toLocaleString('ar-EG')}

🔗 <b>رابط الموقع:</b>
${process.env.SITE_URL || 'http://localhost:3000'}
  `.trim();

  return await sendTelegramNotification('طلب جديد', message, { orderId: _id });
}

module.exports = {
  sendTelegramNotification,
  sendNewOrderNotification
};
