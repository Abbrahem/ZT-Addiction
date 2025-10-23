const { ObjectId } = require('mongodb');
const clientPromise = require('./lib/mongodb');
const { requireAuth } = require('./lib/auth');

module.exports = async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('danger-sneakers');

  // Parse URL to determine if this is for a specific order
  const urlParts = req.url.split('/');
  const orderId = req.params?.id || urlParts[urlParts.length - 1].split('?')[0];
  const isOrderIdEndpoint = orderId && orderId !== 'orders' && !req.url.endsWith('/orders');

  try {
    // GET /api/orders - Get all orders (admin only)
    if (req.method === 'GET' && !isOrderIdEndpoint) {
      return requireAuth(req, res, async () => {
        const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(orders);
      });
    }

    // GET /api/orders/[id] - Get single order
    if (req.method === 'GET' && isOrderIdEndpoint) {
      return requireAuth(req, res, async () => {
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
      const { customer, items, total, shippingFee } = req.body;

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
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('orders').insertOne(order);
      return res.status(201).json({
        message: 'Order created successfully',
        orderId: result.insertedId
      });
    }

    // PATCH /api/orders - Update order status (with orderId in body)
    if (req.method === 'PATCH') {
      return requireAuth(req, res, async () => {
        const { orderId: bodyOrderId, status } = req.body;
        const targetOrderId = bodyOrderId || orderId;

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
        const targetOrderId = bodyOrderId || orderId;

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
