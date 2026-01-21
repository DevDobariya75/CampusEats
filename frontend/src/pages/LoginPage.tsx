import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<
    'admin' | 'shopkeeper' | 'shop_owner' | 'delivery_partner' | 'delivery_person' | 'customer'
  >('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = location?.state?.from || '/';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.login({ email, password });
      setSession(res.token, {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role
      });
      const roleTarget: Record<string, string> = {
        admin: '/admin/dashboard',
        shopkeeper: '/shopkeeper/dashboard',
        shop_owner: '/shopkeeper/dashboard',
        delivery_partner: '/delivery/dashboard',
        delivery_person: '/delivery/dashboard',
        customer: '/'
      };

      const preferred = roleTarget[res.user.role] || '/';
      const target = from && from !== '/login' ? from : preferred;
      navigate(target, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.response?.data?.error || 'Login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const roleCards: Array<{
    key: typeof selectedRole;
    label: string;
    description: string;
    icon: string;
    color: string;
  }> = [
    {
      key: 'admin',
      label: 'Admin',
      description: 'Manage system, shops, and users',
      icon: '👑',
      color: 'border-purple-500 bg-purple-50 text-purple-800'
    },
    {
      key: 'shopkeeper',
      label: 'Shopkeeper',
      description: 'Manage menu, orders, and inventory',
      icon: '🏪',
      color: 'border-green-500 bg-green-50 text-green-800'
    },
    {
      key: 'delivery_partner',
      label: 'Delivery Partner',
      description: 'Accept and deliver orders',
      icon: '🚴',
      color: 'border-orange-500 bg-orange-50 text-orange-800'
    },
    {
      key: 'customer',
      label: 'Customer',
      description: 'Browse shops and order food',
      icon: '🍽️',
      color: 'border-blue-500 bg-blue-50 text-blue-800'
    }
  ];

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="card p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Sign In to CampusEats</h1>
          <p className="mt-2 text-sm text-slate-600">
            Select your account type below, then enter your credentials
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {roleCards.map((role) => (
            <button
              key={role.key}
              type="button"
              onClick={() => setSelectedRole(role.key)}
              className={`rounded-2xl border-2 px-4 py-4 text-left transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                selectedRole === role.key
                  ? role.color + ' shadow-lg border-2'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{role.icon}</span>
                <div className="text-sm font-bold">{role.label}</div>
              </div>
              <div className="text-xs opacity-80">{role.description}</div>
            </button>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
          <strong>Note:</strong> Your role is determined by your account credentials. 
          {selectedRole === 'customer' && ' Customers can create accounts below.'}
          {selectedRole === 'admin' && ' Admin credentials are secure and restricted.'}
          {(selectedRole === 'shopkeeper' || selectedRole === 'shop_owner') && ' Shopkeeper accounts are created by admin.'}
          {(selectedRole === 'delivery_partner' || selectedRole === 'delivery_person') && ' Delivery partner accounts are created by admin.'}
        </div>
      </div>

      <form className="card space-y-4 p-6" onSubmit={submit}>
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
            <span className="text-lg">{roleCards.find(r => r.key === selectedRole)?.icon}</span>
            <span className="text-sm font-semibold text-slate-700">
              Signing in as {roleCards.find(r => r.key === selectedRole)?.label}
            </span>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-bold text-slate-500">EMAIL</div>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={
              selectedRole === 'customer' ? 'you@college.edu' :
              selectedRole === 'admin' ? 'admin@campuseats.com' :
              'your-email@domain.com'
            }
            type="email"
            required
          />
        </div>
        <div>
          <div className="mb-2 text-xs font-bold text-slate-500">PASSWORD</div>
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            required
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : `Sign In as ${roleCards.find(r => r.key === selectedRole)?.label}`}
        </button>

        {selectedRole === 'customer' ? (
          <div className="text-center text-sm text-slate-600">
            New customer?{' '}
            <Link className="text-brand-600 font-semibold underline" to="/register">
              Create an account
            </Link>
          </div>
        ) : (
          <div className="text-center text-sm text-slate-600">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              {selectedRole === 'admin' && '🔒 Admin accounts are secure. Only authorized personnel can access.'}
              {(selectedRole === 'shopkeeper' || selectedRole === 'shop_owner') && '👤 Shopkeeper accounts are created by admin. Contact admin to get credentials.'}
              {(selectedRole === 'delivery_partner' || selectedRole === 'delivery_person') && '👤 Delivery partner accounts are created by admin. Contact admin to get credentials.'}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

