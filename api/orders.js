const { ObjectId } = require('mongodb');
const clientPromise = require('./lib/mongodb');
const { requireAuth } = require('./lib/auth');

// Firebase Admin SDK للإشعارات (مدمج هنا عشان نوفر ملف)
const admin = require('firebase-admin');
let firebaseAdmin = null;

function getFirebaseAdmin() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }
  try {
    console.log('🔧 Initializing Firebase Admin...');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    
    console.log('📋 Service Account Project ID:', serviceAccount.project_id);
    
    if (!serviceAccount.project_id) {
      console.warn('⚠️ Firebase Admin SDK not configured - FIREBASE_SERVICE_ACCOUNT missing');
      return null;
    }
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    console.error('❌ Error stack:', error.stack);
    return null;
  }
}

async function sendNotificationToToken(token, title, body, data = {}) {
  console.log('📤 Attempting to send notification...');
  console.log('📋 Token:', token.substring(0, 30) + '...');
  console.log('📋 Title:', title);
  console.log('📋 Body:', body);
  
  const app = getFirebaseAdmin();
  if (!app) {
    console.error('❌ Firebase Admin not available - cannot send notification');
    return { success: false, error: 'Firebase not configured' };
  }
  
  try {
    const message = {
      notification: { title, body },
      data: { title, body, timestamp: Date.now().toString(), ...data },
      token,
      webpush: { fcmOptions: { link: data.url || '/' } }
    };
    
    console.log('📦 Sending message:', JSON.stringify(message, null, 2));
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully! Message ID:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error stack:', error.stack);
    return { success: false, error: error.message };
  }
}

async function sendNotificationToAdmins(title, body, data = {}) {
  const app = getFirebaseAdmin();
  if (!app) return { success: false, error: 'Firebase not configured' };
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    const adminTokens = await db.collection('fcmTokens')
      .find({ userType: 'admin', token: { $exists: true, $ne: null } })
      .sort({ lastUsed: -1 })
      .toArray();
    console.log(`📤 Sending to ${adminTokens.length} admin(s)`);
    const results = [];
    for (const tokenDoc of adminTokens) {
      const result = await sendNotificationToToken(tokenDoc.token, title, body, data);
      results.push(result);
    }
    return { success: true, results };
  } catch (error) {
    console.error('❌ Error sending to admins:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('danger-sneakers');

  console.log('Orders API:', req.method, req.url);

  // Handle promo endpoints FIRST
  if (req.url.includes('promo')) {
    console.log('Promo endpoint detected - Method:', req.method);
    
    // GET /api/orders/promo - Get all promo codes
    if (req.method === 'GET') {
      console.log('GET promo endpoint hit');
      try {
        const token = req.cookies?.token;
        if (!token) {
          return res.status(401).json({ message: 'Access denied' });
        }
        
        const jwt = require('jsonwebtoken');
        jwt.verify(token, process.env.JWT_SECRET);
        
        const promoCodes = await db.collection('promoCodes').find({}).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(promoCodes);
      } catch (error) {
        console.error('GET promo error:', error);
        return res.status(500).json({ message: 'Server error' });
      }
    }
    
    // POST /api/orders/promo - Create promo code
    if (req.method === 'POST') {
      console.log('POST promo endpoint hit!');
      console.log('POST promo - Request body:', req.body);
      console.log('POST promo - Request headers:', req.headers);
      
      try {
        const token = req.cookies?.token;
        console.log('POST promo - Token exists:', !!token);
        
        if (!token) {
          console.log('POST promo - No token');
          return res.status(401).json({ message: 'Access denied' });
        }
        
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('POST promo - Token verified for user:', decoded.email);
        
        const { discount, maxUses, expiryDays } = req.body;
        console.log('POST promo - Extracted data:', { discount, maxUses, expiryDays });
        console.log('POST promo - Data types:', { 
          discount: typeof discount, 
          maxUses: typeof maxUses, 
          expiryDays: typeof expiryDays 
        });
        
        if (!discount || !maxUses || !expiryDays) {
          console.log('POST promo - Missing fields');
          return res.status(400).json({ message: 'All fields required', received: { discount, maxUses, expiryDays } });
        }
        
        const code = 'ZT' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));
        
        const promoCode = {
          code,
          discount: parseInt(discount),
          maxUses: parseInt(maxUses),
          currentUses: 0,
          expiryDate,
          active: true,
          createdAt: new Date()
        };
        
        await db.collection('promoCodes').insertOne(promoCode);
        return res.status(201).json({ message: 'Success', promoCode });
      } catch (error) {
        console.error('POST promo error:', error);
        return res.status(500).json({ message: 'Server error' });
      }
    }
    
    // PATCH /api/orders/promo - Validate promo code
    if (req.method === 'PATCH') {
      try {
        const { code } = req.body;
        if (!code) {
          return res.status(400).json({ message: 'Code required' });
        }
        
        const promoCode = await db.collection('promoCodes').findOne({ code: code.toUpperCase() });
        if (!promoCode) {
          return res.status(404).json({ message: 'Invalid code' });
        }
        
        if (!promoCode.active || new Date() > new Date(promoCode.expiryDate) || promoCode.currentUses >= promoCode.maxUses) {
          return res.status(400).json({ message: 'Code expired or used up' });
        }
        
        return res.status(200).json({ valid: true, discount: promoCode.discount, code: promoCode.code });
      } catch (error) {
        console.error('PATCH promo error:', error);
        return res.status(500).json({ message: 'Server error' });
      }
    }
    
    // DELETE /api/orders/promo - Delete promo code
    if (req.method === 'DELETE') {
      try {
        const token = req.cookies?.token;
        if (!token) {
          return res.status(401).json({ message: 'Access denied' });
        }
        
        const jwt = require('jsonwebtoken');
        jwt.verify(token, process.env.JWT_SECRET);
        
        const { code } = req.body;
        if (!code) {
          return res.status(400).json({ message: 'Code required' });
        }
        
        const result = await db.collection('promoCodes').deleteOne({ code: code.toUpperCase() });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Code not found' });
        }
        
        return res.status(200).json({ message: 'Deleted' });
      } catch (error) {
        console.error('DELETE promo error:', error);
        return res.status(500).json({ message: 'Server error' });
      }
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Regular orders handling
  const isOrderIdEndpoint = req.params?.id;

  try {
    // POST /api/orders/save-fcm-token - Save FCM token (CHECK THIS FIRST!)
    if (req.method === 'POST' && req.url.includes('save-fcm-token')) {
      try {
        console.log('📥 Save FCM token request received');
        console.log('Request body:', req.body);
        console.log('Request body type:', typeof req.body);
        
        const { token, userType } = req.body || {};
        
        if (!token) {
          console.log('❌ No token in request body');
          return res.status(400).json({ message: 'Token required', receivedBody: req.body });
        }
        
        console.log('✅ Token received:', token.substring(0, 20) + '...');
        
        // Check if token exists
        const existing = await db.collection('fcmTokens').findOne({ token });
        
        if (existing) {
          console.log('📝 Updating existing token');
          // Update lastUsed
          await db.collection('fcmTokens').updateOne(
            { token },
            { $set: { lastUsed: new Date() } }
          );
        } else {
          console.log('➕ Inserting new token');
          // Insert new token
          await db.collection('fcmTokens').insertOne({
            token,
            userType: userType || 'user',
            createdAt: new Date(),
            lastUsed: new Date()
          });
        }
        
        console.log('✅ Token saved successfully');
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('❌ Error saving FCM token:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
      }
    }
    
    // GET /api/orders - Get all orders (admin only) OR search by orderId (public)
    if (req.method === 'GET' && !isOrderIdEndpoint) {
      // Check if there's an orderId query parameter (for public order tracking)
      const urlParams = new URLSearchParams(req.url.split('?')[1]);
      const searchOrderId = urlParams.get('orderId');
      
      if (searchOrderId) {
        // Public order tracking - no auth required
        let order;
        try {
          order = await db.collection('orders').findOne({ _id: new ObjectId(searchOrderId) });
        } catch (error) {
          order = await db.collection('orders').findOne({ _id: searchOrderId });
        }

        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json([order]);
      }
      
      // Admin: Get all orders
      return requireAuth(req, res, async () => {
        const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(orders);
      });
    }

    // GET /api/orders/[id] - Get single order
    if (req.method === 'GET' && isOrderIdEndpoint) {
      return requireAuth(req, res, async () => {
        const orderId = req.params.id;
        let order;
        try {
          order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
        } catch (error) {
          order = await db.collection('orders').findOne({ _id: orderId });
        }

        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json(order);
      });
    }

    // POST /api/orders - Create new order
    if (req.method === 'POST' && !isOrderIdEndpoint) {
      const { customer, items, total, shippingFee, promoCode, discount, payment, customerToken } = req.body;
      
      console.log('Creating order with payment:', payment);

      if (!customer || !items || !total) {
        return res.status(400).json({ message: 'Customer, items, and total are required' });
      }

      if (!customer.name || !customer.address || !customer.phone1) {
        return res.status(400).json({ message: 'Customer name, address, and phone1 are required' });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items must be a non-empty array' });
      }

      const order = {
        customer,
        items,
        total: parseFloat(total),
        shippingFee: parseFloat(shippingFee) || 0,
        status: 'pending',
        customerToken: customerToken || null, // Save customer FCM token
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add promo code info if provided
      if (promoCode) {
        order.promoCode = promoCode;
        order.discount = discount;

        // Increment promo code usage
        await db.collection('promoCodes').updateOne(
          { code: promoCode.toUpperCase() },
          { $inc: { currentUses: 1 } }
        );
      }

      // Add payment info if provided
      if (payment) {
        order.payment = {
          method: payment.method,
          methodName: payment.methodName,
          amount: payment.amount,
          senderPhone: payment.senderPhone,
          screenshot: payment.screenshot
        };
      }

      const result = await db.collection('orders').insertOne(order);
      
      console.log('📦 Order created with ID:', result.insertedId);
      console.log('🔔 Attempting to send notifications...');
      
      // Get the complete order with ID for Telegram
      const completeOrder = { ...order, _id: result.insertedId };
      
      // إرسال إشعار Telegram (أولوية أولى - الأضمن)
      try {
        const { sendNewOrderNotification } = require('./utils/telegram');
        const telegramResult = await sendNewOrderNotification(completeOrder);
        if (telegramResult.success) {
          console.log('✅ Telegram notification sent successfully');
        }
      } catch (error) {
        console.error('⚠️ Telegram notification failed (but order created):', error.message);
      }
      
      // إرسال إشعار Firebase Admin (احتياطي)
      sendNotificationToAdmins(
        '🛍️ طلب جديد!',
        `طلب من ${customer.name} - ${total} جنيه`,
        {
          type: 'new_order',
          orderId: result.insertedId.toString(),
          url: `/admin/dashboard`
        }
      )
      .then(result => {
        console.log('✅ Firebase notification sent successfully:', result);
      })
      .catch(err => {
        console.error('⚠️ Firebase notification failed:', err.message);
      });
      
      return res.status(201).json({
        message: 'Order created successfully',
        orderId: result.insertedId
      });
    }

    // PATCH /api/orders - Update order status (with orderId in body)
    if (req.method === 'PATCH') {
      return requireAuth(req, res, async () => {
        const { orderId: bodyOrderId, status } = req.body;
        const targetOrderId = bodyOrderId || req.params?.id;

        if (!targetOrderId) {
          return res.status(400).json({ message: 'Order ID is required' });
        }

        if (!status) {
          return res.status(400).json({ message: 'Status is required' });
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: 'Invalid status' });
        }

        let result;
        try {
          result = await db.collection('orders').updateOne(
            { _id: new ObjectId(targetOrderId) },
            { $set: { status, updatedAt: new Date() } }
          );
        } catch (error) {
          result = await db.collection('orders').updateOne(
            { _id: targetOrderId },
            { $set: { status, updatedAt: new Date() } }
          );
        }

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Order not found' });
        }

        // جلب الطلب عشان نشوف لو في customerToken
        let order;
        try {
          order = await db.collection('orders').findOne({ _id: new ObjectId(targetOrderId) });
        } catch (error) {
          order = await db.collection('orders').findOne({ _id: targetOrderId });
        }

        // إرسال إشعار للعميل لو عنده token
        if (order && order.customerToken) {
          const statusMessages = {
            pending: '⏳ طلبك قيد المراجعة',
            confirmed: '✅ تم تأكيد طلبك',
            processing: '📦 جاري تجهيز طلبك',
            shipped: '🚚 طلبك في الطريق إليك',
            delivered: '🎉 تم توصيل طلبك بنجاح',
            cancelled: '❌ تم إلغاء طلبك'
          };

          sendNotificationToToken(
            order.customerToken,
            'تحديث حالة الطلب',
            statusMessages[status] || `حالة طلبك: ${status}`,
            {
              type: 'order_update',
              orderId: targetOrderId.toString(),
              status: status,
              url: `/order-tracking?orderId=${targetOrderId}`
            }
          ).catch(err => console.error('Customer notification failed:', err));
        }

        return res.status(200).json({
          message: 'Order status updated successfully',
          status
        });
      });
    }

    // DELETE /api/orders - Delete order (admin only, with orderId in body)
    if (req.method === 'DELETE') {
      return requireAuth(req, res, async () => {
        const { orderId: bodyOrderId } = req.body;
        const targetOrderId = bodyOrderId || req.params?.id;

        if (!targetOrderId) {
          return res.status(400).json({ message: 'Order ID is required' });
        }

        let result;
        try {
          result = await db.collection('orders').deleteOne({ _id: new ObjectId(targetOrderId) });
        } catch (error) {
          result = await db.collection('orders').deleteOne({ _id: targetOrderId });
        }

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({ message: 'Order deleted successfully' });
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
