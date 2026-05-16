// Brevo Email Service
const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * إرسال إيميل باستخدام Brevo API
 */
async function sendEmail({ to, subject, htmlContent, textContent }) {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.warn('⚠️ BREVO_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const emailData = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'ZT Addiction',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@ztaddiction.com'
      },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent: textContent || subject
    };

    console.log('📧 Sending email to:', to);
    console.log('📋 Subject:', subject);

    const response = await axios.post(BREVO_API_URL, emailData, {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      }
    });

    console.log('✅ Email sent successfully! Message ID:', response.data.messageId);
    return { success: true, messageId: response.data.messageId };

  } catch (error) {
    console.error('❌ Error sending email:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

/**
 * إرسال إيميل تأكيد الطلب
 */
async function sendOrderConfirmationEmail(order) {
  const { customer, items, total, _id } = order;
  
  const itemsList = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.size}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price} EGP</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد الطلب</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
        <h1 style="color: #000; text-align: center; margin-bottom: 30px;">🎉 تم تأكيد طلبك!</h1>
        
        <p style="font-size: 16px; color: #333;">مرحباً <strong>${customer.name}</strong>،</p>
        <p style="font-size: 16px; color: #333;">شكراً لطلبك من ZT Addiction! تم استلام طلبك بنجاح.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>رقم الطلب:</strong> ${_id}</p>
          <p style="margin: 5px 0;"><strong>الإجمالي:</strong> ${total} جنيه</p>
        </div>

        <h2 style="color: #000; margin-top: 30px;">تفاصيل الطلب:</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #000; color: white;">
              <th style="padding: 10px; text-align: right;">المنتج</th>
              <th style="padding: 10px; text-align: right;">المقاس</th>
              <th style="padding: 10px; text-align: right;">الكمية</th>
              <th style="padding: 10px; text-align: right;">السعر</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>

        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📦 معلومات التوصيل:</h3>
          <p style="margin: 5px 0;">• القاهرة والجيزة: يومين</p>
          <p style="margin: 5px 0;">• باقي المحافظات: 3-5 أيام</p>
          <p style="margin: 5px 0;">• سياسة الاسترجاع: 3 أيام</p>
        </div>

        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
          سنرسل لك تحديثات عن حالة طلبك على هذا الإيميل
        </p>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #000; font-weight: bold;">ZT ADDICTION</p>
          <p style="color: #666; font-size: 14px;">للتواصل: 01272558833</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customer.email,
    subject: `تأكيد طلبك #${_id} - ZT Addiction`,
    htmlContent,
    textContent: `تم تأكيد طلبك رقم ${_id}. الإجمالي: ${total} جنيه`
  });
}

/**
 * إرسال إيميل تحديث حالة الطلب
 */
async function sendOrderStatusEmail(order, newStatus) {
  const { customer, _id, total } = order;
  
  const statusMessages = {
    processing: { title: '📦 جاري تجهيز طلبك', message: 'نقوم الآن بتجهيز طلبك للشحن' },
    shipped: { title: '🚚 طلبك في الطريق', message: 'تم شحن طلبك وسيصلك قريباً' },
    delivered: { title: '🎉 تم التوصيل', message: 'تم توصيل طلبك بنجاح! نتمنى أن تنال إعجابك' }
  };

  const statusInfo = statusMessages[newStatus] || { 
    title: 'تحديث حالة الطلب', 
    message: `حالة طلبك: ${newStatus}` 
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تحديث حالة الطلب</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
        <h1 style="color: #000; text-align: center; margin-bottom: 30px;">${statusInfo.title}</h1>
        
        <p style="font-size: 16px; color: #333;">مرحباً <strong>${customer.name}</strong>،</p>
        <p style="font-size: 18px; color: #333; font-weight: bold;">${statusInfo.message}</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>رقم الطلب:</strong> ${_id}</p>
          <p style="margin: 5px 0;"><strong>الإجمالي:</strong> ${total} جنيه</p>
          <p style="margin: 5px 0;"><strong>الحالة الحالية:</strong> ${statusInfo.title}</p>
        </div>

        ${newStatus === 'delivered' ? `
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <p style="font-size: 16px; margin: 0;">⭐ نرجو تقييم منتجاتنا!</p>
          <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">رأيك يهمنا</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #000; font-weight: bold;">ZT ADDICTION</p>
          <p style="color: #666; font-size: 14px;">للتواصل: 01272558833</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customer.email,
    subject: `${statusInfo.title} - طلب #${_id}`,
    htmlContent,
    textContent: `${statusInfo.message} - طلب رقم ${_id}`
  });
}

/**
 * إرسال إيميل للعملاء عن منتج جديد
 */
async function sendNewProductEmail(customerEmail, product) {
  const productImage = product.images && product.images.length > 0 ? product.images[0] : '';
  const productPrice = product.sizesWithPrices?.[0]?.price || product.priceEGP || 0;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>منتج جديد</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
        <h1 style="color: #000; text-align: center; margin-bottom: 30px;">🎉 منتج جديد وصل!</h1>
        
        ${productImage ? `
        <div style="text-align: center; margin: 20px 0;">
          <img src="${productImage}" alt="${product.name}" style="max-width: 300px; border-radius: 10px;">
        </div>
        ` : ''}

        <h2 style="color: #000; text-align: center;">${product.name}</h2>
        <p style="font-size: 18px; color: #f59e0b; text-align: center; font-weight: bold;">${productPrice} جنيه</p>
        
        <p style="font-size: 16px; color: #333; text-align: center;">${product.description || 'منتج جديد من ZT Addiction'}</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.WEBSITE_URL || 'https://ztaddiction.com'}/products/${product._id}" 
             style="background-color: #000; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            اطلب الآن
          </a>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #000; font-weight: bold;">ZT ADDICTION</p>
          <p style="color: #666; font-size: 14px;">للتواصل: 01272558833</p>
          <p style="color: #999; font-size: 12px; margin-top: 10px;">
            لا تريد استلام هذه الرسائل؟ يمكنك إلغاء الاشتراك من إعدادات حسابك
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `🎉 منتج جديد: ${product.name} - ZT Addiction`,
    htmlContent,
    textContent: `منتج جديد: ${product.name} - ${productPrice} جنيه`
  });
}

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendNewProductEmail
};
