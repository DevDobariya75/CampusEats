import { useState, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { Users, Store, Truck, ShoppingCart, Plus } from 'lucide-react';

export function AdminDashboard() {
  const { stats, loading, fetchStats } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'shops' | 'orders'>('dashboard');
  const [showCreateShopkeeper, setShowCreateShopkeeper] = useState(false);
  const [showCreateDelivery, setShowCreateDelivery] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Campus food delivery management system</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-lg p-2 shadow-md">
          {(['dashboard', 'users', 'shops', 'orders'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard Stats */}
        {activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="bg-blue-500"
            />
            <StatCard
              title="Active Shops"
              value={stats.totalShops}
              icon={Store}
              color="bg-green-500"
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={ShoppingCart}
              color="bg-purple-500"
            />
            <StatCard
              title="Today's Orders"
              value={stats.todayOrders}
              icon={Truck}
              color="bg-orange-500"
            />
          </div>
        )}

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === 'dashboard' && stats && (
            <DashboardContent stats={stats} />
          )}

          {activeTab === 'users' && (
            <UsersManagement
              onCreateShopkeeper={() => setShowCreateShopkeeper(true)}
              onCreateDelivery={() => setShowCreateDelivery(true)}
            />
          )}

          {activeTab === 'shops' && (
            <ShopsManagement />
          )}

          {activeTab === 'orders' && (
            <OrdersManagement />
          )}
        </div>

        {/* Create Shopkeeper Modal */}
        {showCreateShopkeeper && (
          <CreateShopkeeperModal
            onClose={() => setShowCreateShopkeeper(false)}
            onSuccess={() => {
              setShowCreateShopkeeper(false);
              fetchStats();
            }}
          />
        )}

        {/* Create Delivery Partner Modal */}
        {showCreateDelivery && (
          <CreateDeliveryPartnerModal
            onClose={() => setShowCreateDelivery(false)}
            onSuccess={() => {
              setShowCreateDelivery(false);
              fetchStats();
            }}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className={`${color} rounded-lg text-white p-6 shadow-lg`}>
      <Icon className="w-8 h-8 mb-2 opacity-80" />
      <p className="text-sm font-medium opacity-90">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function DashboardContent({ stats }: { stats: any }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-lg mb-4">Users by Role</h3>
          <ul className="space-y-3">
            {Object.entries(stats.usersByRole).map(([role, count]: any) => (
              <li key={role} className="flex justify-between items-center">
                <span className="text-gray-700 capitalize">{role.replace(/_/g, ' ')}</span>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-4">Revenue</h3>
          <p className="text-4xl font-bold text-green-600">
            ₹{stats.totalRevenue.toFixed(2)}
          </p>
          <p className="text-gray-600 mt-2">Total revenue from all orders</p>
        </div>
      </div>
    </div>
  );
}

function UsersManagement({ onCreateShopkeeper, onCreateDelivery }: any) {
  const { getUsers } = useAdminStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex gap-2">
          <button
            onClick={onCreateShopkeeper}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Shopkeeper
          </button>
          <button
            onClick={onCreateDelivery}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Delivery Partner
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user: any) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded capitalize">
                      {user.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
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

function ShopsManagement() {
  const { getShops, toggleShopStatus } = useAdminStore();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const data = await getShops();
      setShops(data.data);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (shopId: string) => {
    try {
      await toggleShopStatus(shopId);
      fetchShops();
    } catch (error) {
      console.error('Error toggling shop status:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Shop Management</h2>

      {loading ? (
        <p className="text-gray-600">Loading shops...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shops.map((shop: any) => (
            <div key={shop._id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-lg mb-2">{shop.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{shop.description}</p>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  shop.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {shop.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => handleToggleStatus(shop._id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Toggle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersManagement() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders Management</h2>
      <p className="text-gray-600">Order management interface coming soon...</p>
    </div>
  );
}

function CreateShopkeeperModal({ onClose, onSuccess }: any) {
  const { createShopkeeper } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shopName: '',
    address: { campus: 'Main Campus' }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createShopkeeper(formData);
      alert(`Shopkeeper created!\nTemporary Password: ${result.data.user.temporaryPassword}`);
      onSuccess();
    } catch (error: any) {
      alert('Error creating shopkeeper: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Create Shopkeeper Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <input
            type="text"
            placeholder="Shop Name"
            value={formData.shopName}
            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <div className="flex gap-2 pt-4">
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
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateDeliveryPartnerModal({ onClose, onSuccess }: any) {
  const { createDeliveryPartner } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: { campus: 'Main Campus' }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createDeliveryPartner(formData);
      alert(`Delivery Partner created!\nTemporary Password: ${result.data.temporaryPassword}`);
      onSuccess();
    } catch (error: any) {
      alert('Error creating delivery partner: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Create Delivery Partner Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <div className="flex gap-2 pt-4">
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
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
