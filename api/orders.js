const { ObjectId } = require('mongodb');
const clientPromise = require('./lib/mongodb');
const { requireAuth } = require('./lib/auth');

// Firebase Admin SDK for sending notifications
let admin;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    admin = require('firebase-admin');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    console.log('✅ Firebase Admin initialized');
  }
} catch (error) {
  console.log('⚠️ Firebase Admin not initialized:', error.message);
}

// Helper function to send notification
async function sendNotification(token, title, body, data = {}) {
  if (!admin) {
    console.log('⚠️ Firebase Admin not available, skipping notification');
    return;
  }
  
  try {
    // Convert all data values to strings (Firebase requirement)
    const stringData = {};
    Object.keys(data).forEach(key => {
      stringData[key] = String(data[key]);
    });
    
    const message = {
      notification: { 
        title, 
        body
      },
      data: stringData,
      token
    };
    
    console.log('📤 Sending notification with data:', stringData);
    
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
    throw error;
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
      
      // Send notification to admin about new order
      try {
        // Get admin FCM token from database
        const adminTokenDoc = await db.collection('fcmTokens').findOne({ 
          userType: 'admin' 
        }, { 
          sort: { lastUsed: -1 } // Get most recent token
        });
        
        if (adminTokenDoc && adminTokenDoc.token) {
          console.log('📤 Sending notification to admin...');
          await sendNotification(
            adminTokenDoc.token,
            '🎉 طلب جديد!',
            `طلب جديد بقيمة ${total} جنيه`,
            {
              type: 'new_order',
              orderId: result.insertedId.toString(),
              url: '/admin/dashboard'
            }
          );
        } else {
          console.log('⚠️ No admin token found in database');
        }
      } catch (notifError) {
        console.error('❌ Could not send notification:', notifError.message);
        // If token is invalid, remove it from database
        if (notifError.message.includes('NotRegistered') || notifError.message.includes('InvalidRegistration')) {
          try {
            await db.collection('fcmTokens').deleteOne({ userType: 'admin' });
            console.log('🗑️ Removed invalid admin token');
          } catch (e) {}
        }
      }
      
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

        // Send notification to customer about status change
        try {
          // Get order details to find customer token
          let order;
          try {
            order = await db.collection('orders').findOne({ _id: new ObjectId(targetOrderId) });
          } catch (error) {
            order = await db.collection('orders').findOne({ _id: targetOrderId });
          }
          
          // Get customer FCM token if saved with order
          if (order && order.customerToken) {
            console.log('📤 Sending status update notification to customer...');
            
            const statusMessages = {
              pending: 'طلبك قيد المراجعة',
              processing: 'جاري تجهيز طلبك',
              shipped: 'تم شحن طلبك',
              delivered: 'تم توصيل طلبك',
              cancelled: 'تم إلغاء طلبك'
            };
            
            const statusTitle = statusMessages[status] || 'تم تحديث حالة طلبك';
            const messageBody = `رقم الطلب: ${targetOrderId.toString()}`;
            
            await sendNotification(
              order.customerToken,
              `📦 ${statusTitle}`,
              messageBody,
              {
                type: 'order_update',
                orderId: targetOrderId.toString(),
                status: status,
                url: '/order-tracking'
              }
            );
          } else {
            console.log('⚠️ No customer token found for this order');
          }
        } catch (notifError) {
          console.error('❌ Could not send status notification:', notifError.message);
          // If token is invalid, remove it from order
          if (notifError.message.includes('NotRegistered') || notifError.message.includes('InvalidRegistration')) {
            try {
              await db.collection('orders').updateOne(
                { _id: new ObjectId(targetOrderId) },
                { $unset: { customerToken: "" } }
              );
              console.log('🗑️ Removed invalid customer token from order');
            } catch (e) {}
          }
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

    // POST /api/orders/save-fcm-token - Save FCM token
    if (req.method === 'POST' && req.url.includes('save-fcm-token')) {
      try {
        const { token, userType } = req.body;
        
        if (!token) {
          return res.status(400).json({ message: 'Token required' });
        }
        
        // Check if token exists
        const existing = await db.collection('fcmTokens').findOne({ token });
        
        if (existing) {
          // Update lastUsed
          await db.collection('fcmTokens').updateOne(
            { token },
            { $set: { lastUsed: new Date() } }
          );
        } else {
          // Insert new token
          await db.collection('fcmTokens').insertOne({
            token,
            userType: userType || 'user',
            createdAt: new Date(),
            lastUsed: new Date()
          });
        }
        
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error saving FCM token:', error);
        return res.status(500).json({ message: 'Server error' });
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
