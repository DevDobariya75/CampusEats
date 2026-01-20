import { useState, useEffect } from 'react';
import { useShopkeeperStore } from '../store/shopkeeperStore';
import { Plus, Edit2, Trash2, BarChart3, Utensils } from 'lucide-react';

export function ShopkeeperDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'orders' | 'sales'>('overview');
  const { dashboard, loading, fetchDashboard } = useShopkeeperStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {dashboard?.shop.name} - Shopkeeper Dashboard
          </h1>
          <p className="text-gray-600">Manage your shop and orders</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-lg p-2 shadow-md">
          {(['overview', 'menu', 'orders', 'sales'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Menu Items" value={dashboard.stats.totalMenuItems} color="bg-blue-500" />
            <StatCard title="Total Orders" value={dashboard.stats.totalOrders} color="bg-purple-500" />
            <StatCard title="Pending Orders" value={dashboard.stats.pendingOrders} color="bg-orange-500" />
            <StatCard title="Preparing" value={dashboard.stats.preparingOrders} color="bg-yellow-500" />
          </div>
        )}

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === 'overview' && <OverviewSection />}
          {activeTab === 'menu' && <MenuSection />}
          {activeTab === 'orders' && <OrdersSection />}
          {activeTab === 'sales' && <SalesSection />}
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

function OverviewSection() {
  const { dashboard } = useShopkeeperStore();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Shop Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Shop Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`text-lg font-semibold ${dashboard?.shop.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {dashboard?.shop.isActive ? '✓ Active' : '✗ Inactive'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Currently Open</p>
              <p className={`text-lg font-semibold ${dashboard?.shop.isOpen ? 'text-green-600' : 'text-orange-600'}`}>
                {dashboard?.shop.isOpen ? 'Open' : 'Closed'}
              </p>
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg mb-3 transition-colors">
            Edit Shop Details
          </button>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors">
            Update Opening Hours
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuSection() {
  const { menuItems, loading, fetchMenuItems, deleteMenuItem } = useShopkeeperStore();
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(id);
        fetchMenuItems();
      } catch (error) {
        alert('Error deleting item');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {showAddForm && (
        <AddMenuItemForm onClose={() => setShowAddForm(false)} onSuccess={fetchMenuItems} />
      )}

      {loading ? (
        <p className="text-gray-600">Loading menu items...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item: any) => (
            <div key={item._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gray-100 h-40 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <Utensils className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-green-600">₹{item.price}</span>
                  <span className={`text-xs px-2 py-1 rounded ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(item._id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersSection() {
  const { orders, loading, fetchOrders, updateOrderStatus } = useShopkeeperStore();
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders(statusFilter || undefined);
  }, [statusFilter]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders(statusFilter || undefined);
    } catch (error) {
      alert('Error updating order status');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 bg-white"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No orders found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Items</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order: any) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">{order._id.slice(-6)}</td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-semibold">{order.user?.name}</p>
                      <p className="text-gray-600 text-xs">{order.user?.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{order.orderItems?.length} items</td>
                  <td className="px-6 py-4 text-sm font-semibold">₹{order.totalPrice}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {order.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <select
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                      defaultValue=""
                    >
                      <option value="">Update Status</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SalesSection() {
  const { sales, loading, fetchSales } = useShopkeeperStore();

  useEffect(() => {
    fetchSales();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading sales data...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        Sales Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-blue-50">
          <p className="text-gray-600 text-sm font-semibold">Today's Sales</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">₹{sales?.today.total.toFixed(2)}</p>
          <p className="text-gray-600 text-sm mt-2">{sales?.today.orders} orders</p>
        </div>
        <div className="border rounded-lg p-6 bg-green-50">
          <p className="text-gray-600 text-sm font-semibold">Last 7 Days</p>
          <p className="text-3xl font-bold text-green-600 mt-2">₹{sales?.lastWeek.total.toFixed(2)}</p>
          <p className="text-gray-600 text-sm mt-2">{sales?.lastWeek.orders} orders</p>
        </div>
        <div className="border rounded-lg p-6 bg-purple-50">
          <p className="text-gray-600 text-sm font-semibold">Last 30 Days</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">₹{sales?.lastMonth.total.toFixed(2)}</p>
          <p className="text-gray-600 text-sm mt-2">{sales?.lastMonth.orders} orders</p>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">Daily Sales (Last 7 Days)</h3>
        <div className="space-y-3">
          {sales?.dailySalesData.map((day: any) => (
            <div key={day.date} className="flex items-center justify-between">
              <span className="text-gray-700">{day.date}</span>
              <div className="flex-1 mx-4 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full"
                  style={{
                    width: `${Math.min((day.sales / Math.max(...sales.dailySalesData.map((d: any) => d.sales))) * 100, 100)}%`
                  }}
                ></div>
              </div>
              <span className="text-gray-900 font-semibold min-w-fit ml-4">₹{day.sales.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddMenuItemForm({ onClose, onSuccess }: any) {
  const { addMenuItem, fetchMenuItems } = useShopkeeperStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'main_course',
    description: '',
    image: '',
    isVegetarian: false,
    isVegan: false,
    isSpicy: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addMenuItem({
        ...formData,
        price: parseFloat(formData.price)
      });
      fetchMenuItems();
      onSuccess();
      onClose();
    } catch (error: any) {
      alert('Error adding item: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Add Menu Item</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Item Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="col-span-2 border rounded-lg px-4 py-2"
            required
          />
          <input
            type="number"
            placeholder="Price"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="border rounded-lg px-4 py-2"
            required
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="border rounded-lg px-4 py-2"
          >
            <option value="appetizer">Appetizer</option>
            <option value="main_course">Main Course</option>
            <option value="dessert">Dessert</option>
            <option value="beverage">Beverage</option>
            <option value="combo">Combo</option>
          </select>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="col-span-2 border rounded-lg px-4 py-2 h-20"
          />
          <div className="col-span-2 flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isVegetarian}
                onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
              />
              Vegetarian
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isVegan}
                onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
              />
              Vegan
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isSpicy}
                onChange={(e) => setFormData({ ...formData, isSpicy: e.target.checked })}
              />
              Spicy
            </label>
          </div>
          <div className="col-span-2 flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
