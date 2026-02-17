import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminProfile = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalPromoCodes: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch products
      const productsRes = await axios.get('/api/products');
      const products = productsRes.data;

      // Fetch orders
      const ordersRes = await axios.get('/api/orders', { withCredentials: true });
      const orders = ordersRes.data;

      // Fetch promo codes
      const promoRes = await axios.get('/api/orders/promo', { withCredentials: true });
      const promoCodes = promoRes.data;

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        totalPromoCodes: promoCodes.length,
        pendingOrders,
        deliveredOrders
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      teal: 'bg-teal-50 text-teal-600 border-teal-200'
    };

    return (
      <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-4xl">{icon}</div>
          <div className="text-right">
            <div className="text-3xl font-bold">{value}</div>
            {subtitle && (
              <div className="text-sm opacity-75 mt-1">{subtitle}</div>
            )}
          </div>
        </div>
        <div className="font-semibold text-lg">{title}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Profile & Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon="📦"
          title="Total Products"
          value={stats.totalProducts}
          color="blue"
        />

        <StatCard
          icon="🛍️"
          title="Total Orders"
          value={stats.totalOrders}
          subtitle={`${stats.pendingOrders} pending`}
          color="green"
        />

        <StatCard
          icon="💰"
          title="Total Revenue"
          value={`${stats.totalRevenue.toLocaleString()} EGP`}
          color="purple"
        />

        <StatCard
          icon="🎟️"
          title="Promo Codes"
          value={stats.totalPromoCodes}
          color="orange"
        />

        <StatCard
          icon="⏳"
          title="Pending Orders"
          value={stats.pendingOrders}
          color="red"
        />

        <StatCard
          icon="✅"
          title="Delivered Orders"
          value={stats.deliveredOrders}
          color="teal"
        />
      </div>

      {/* Admin Info */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Admin Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Email:</span>
            <span className="font-semibold">{process.env.REACT_APP_ADMIN_EMAIL || 'zt@gmail.com'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Role:</span>
            <span className="font-semibold">Administrator</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Last Login:</span>
            <span className="font-semibold">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
            <div className="text-sm opacity-90">Products</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <div className="text-sm opacity-90">Orders</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.pendingOrders}</div>
            <div className="text-sm opacity-90">Pending</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.totalPromoCodes}</div>
            <div className="text-sm opacity-90">Promos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
