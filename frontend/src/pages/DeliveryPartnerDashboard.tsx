import { useState, useEffect } from 'react';
import { http } from '../api/http';
import { MapPin, Phone, CheckCircle, Clock } from 'lucide-react';

export function DeliveryPartnerDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'available' | 'active' | 'history'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await http.get('/api/delivery/dashboard');
      setStats(res.data.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
    setLoading(false);
  };

  const fetchAvailableOrders = async () => {
    setLoading(true);
    try {
      const res = await http.get('/api/delivery/available-orders');
      setAvailableOrders(res.data.data);
    } catch (error) {
      console.error('Error fetching available orders:', error);
    }
    setLoading(false);
  };

  const fetchMyOrders = async (status?: string) => {
    setLoading(true);
    try {
      const params = status ? { status } : {};
      const res = await http.get('/api/delivery/my-orders', { params });
      setMyOrders(res.data.data);
    } catch (error) {
      console.error('Error fetching my orders:', error);
    }
    setLoading(false);
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await http.post(`/api/delivery/orders/${orderId}/accept`);
      alert('Order accepted successfully!');
      fetchAvailableOrders();
      fetchDashboard();
    } catch (error: any) {
      alert('Error accepting order: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await http.put(`/api/delivery/orders/${orderId}/status`, { status });
      alert('Status updated successfully!');
      fetchMyOrders();
      fetchDashboard();
    } catch (error: any) {
      alert('Error updating status: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  useEffect(() => {
    if (activeTab === 'available') fetchAvailableOrders();
    if (activeTab === 'active') fetchMyOrders('out_for_delivery');
    if (activeTab === 'history') fetchMyOrders('delivered');
  }, [activeTab]);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Delivery Partner Dashboard</h1>
          <p className="text-gray-600">Manage your deliveries</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-8 bg-white rounded-lg p-2 shadow-md">
          {(['dashboard', 'available', 'active', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-red-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab === 'dashboard' && 'Dashboard'}
              {tab === 'available' && 'Available Orders'}
              {tab === 'active' && 'My Active Deliveries'}
              {tab === 'history' && 'Delivery History'}
            </button>
          ))}
        </div>

        {/* Stats */}
        {stats && activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Available Orders" value={stats.availableOrders || 0} color="bg-blue-500" />
            <StatCard title="Active Deliveries" value={stats.myActiveOrders || 0} color="bg-green-500" />
            <StatCard title="Completed" value={stats.myCompletedOrders || 0} color="bg-purple-500" />
            <StatCard title="Total Earnings" value={`₹${(stats.totalEarnings || 0).toFixed(2)}`} color="bg-green-600" />
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === 'dashboard' && <DashboardContent stats={stats} />}
          {activeTab === 'available' && (
            <AvailableOrdersList orders={availableOrders} onAccept={handleAcceptOrder} loading={loading} />
          )}
          {activeTab === 'active' && (
            <ActiveDeliveriesList orders={myOrders} onUpdateStatus={handleUpdateStatus} loading={loading} />
          )}
          {activeTab === 'history' && (
            <DeliveryHistory orders={myOrders} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: any) {
  return (
    <div className={`${color} rounded-lg text-white p-4 shadow-lg`}>
      <p className="text-sm font-medium opacity-90">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function DashboardContent({ stats }: any) {
  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Today's Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Order Status</h3>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span>Available Orders Nearby</span>
              <span className="font-bold text-blue-600">{stats.availableOrders || 0}</span>
            </li>
            <li className="flex justify-between">
              <span>My Active Deliveries</span>
              <span className="font-bold text-green-600">{stats.myActiveOrders || 0}</span>
            </li>
            <li className="flex justify-between">
              <span>Completed Today</span>
              <span className="font-bold text-purple-600">{stats.myCompletedOrders || 0}</span>
            </li>
          </ul>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Earnings</h3>
          <p className="text-4xl font-bold text-green-600">₹{(stats.totalEarnings || 0).toFixed(2)}</p>
          <p className="text-gray-600 mt-2">Total earnings from completed deliveries</p>
        </div>
      </div>
    </div>
  );
}

function AvailableOrdersList({ orders, onAccept, loading }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6" />
        Available Orders Ready for Delivery
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No available orders at the moment</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <OrderCard key={order._id} order={order} onAction={() => onAccept(order._id)} actionLabel="Accept Order" />
          ))}
        </div>
      )}
    </div>
  );
}

function ActiveDeliveriesList({ orders, onUpdateStatus, loading }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MapPin className="w-6 h-6" />
        My Active Deliveries
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading deliveries...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No active deliveries</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order._id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Order #{order._id.slice(-6)}</h3>
                  <p className="text-gray-600">{order.shop?.name}</p>
                </div>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                  Out for Delivery
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{order.user?.name}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {order.user?.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-semibold text-sm">{order.deliveryAddress?.building}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateStatus(order._id, 'delivered')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Delivered
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeliveryHistory({ orders }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CheckCircle className="w-6 h-6" />
        Completed Deliveries
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No completed deliveries yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Shop</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Earning</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order: any) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono">{order._id.slice(-6)}</td>
                  <td className="px-6 py-4 text-sm">{order.user?.name}</td>
                  <td className="px-6 py-4 text-sm">{order.shop?.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold">₹{order.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{order.deliveryFee.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onAction, actionLabel }: any) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg">Order #{order._id.slice(-6)}</h3>
          <p className="text-gray-600">{order.shop?.name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">₹{order.totalPrice}</p>
          <p className="text-sm text-gray-600">Earning: ₹{order.deliveryFee}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Customer</p>
          <p className="font-semibold">{order.user?.name}</p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {order.user?.phone}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Delivery To</p>
          <p className="font-semibold text-sm">{order.deliveryAddress?.building || 'On Campus'}</p>
        </div>
      </div>

      <button
        onClick={onAction}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
      >
        {actionLabel}
      </button>
    </div>
  );
}
