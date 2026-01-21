import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin' | 'shopkeeper' | 'delivery_partner'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleCards: Array<{
    key: typeof selectedRole;
    label: string;
    description: string;
    icon: string;
    color: string;
    canSelfRegister: boolean;
  }> = [
    {
      key: 'customer',
      label: 'Customer',
      description: 'Browse and order food',
      icon: '🍽️',
      color: 'border-blue-500 bg-blue-50 text-blue-800',
      canSelfRegister: true
    },
    {
      key: 'shopkeeper',
      label: 'Shopkeeper',
      description: 'Manage shop & menu',
      icon: '🏪',
      color: 'border-green-500 bg-green-50 text-green-800',
      canSelfRegister: true
    },
    {
      key: 'delivery_partner',
      label: 'Delivery Partner',
      description: 'Deliver orders',
      icon: '🚴',
      color: 'border-orange-500 bg-orange-50 text-orange-800',
      canSelfRegister: true
    },
    {
      key: 'admin',
      label: 'Admin',
      description: 'System management',
      icon: '👑',
      color: 'border-purple-500 bg-purple-50 text-purple-800',
      canSelfRegister: true
    }
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.register({ name, email, password, role: selectedRole });
      setSession(res.token, {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.response?.data?.error || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="card p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Create Account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Choose your account type to get started
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {roleCards.map((role) => (
            <button
              key={role.key}
              type="button"
              onClick={() => setSelectedRole(role.key)}
              disabled={!role.canSelfRegister && selectedRole !== role.key}
              className={`rounded-2xl border-2 px-4 py-4 text-left transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                selectedRole === role.key
                  ? role.color + ' shadow-lg border-2'
                  : role.canSelfRegister
                  ? 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                  : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{role.icon}</span>
                <div className="text-sm font-bold">{role.label}</div>
              </div>
              <div className="text-xs opacity-80">{role.description}</div>
              {!role.canSelfRegister && (
                <div className="mt-2 text-xs font-semibold text-red-600">
                  ⚠️ Admin only
                </div>
              )}
            </button>
          ))}
        </div>
        {(() => {
          const sel = roleCards.find(r => r.key === selectedRole)!;
          if (!sel.canSelfRegister) {
            return (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                <strong>⚠️ Restricted Role:</strong> {sel.label} accounts can only be created by the admin. Please contact the admin to get credentials or{' '}
                <Link to="/login" className="underline font-semibold">login here</Link> if you already have an account.
              </div>
            );
          }
          return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
              <strong>✅ {sel.label} Registration:</strong> You can create a {sel.label.toLowerCase()} account instantly.
            </div>
          );
        })()}
      </div>

      <form className="card space-y-4 p-6" onSubmit={submit}>
        {(() => {
          const sel = roleCards.find(r => r.key === selectedRole)!;
          if (!sel.canSelfRegister) {
            return (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">{sel.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{sel.label} Registration</h3>
                <p className="text-sm text-slate-600 mb-4">This role can only be created by the system administrator.</p>
                <div className="bg-slate-100 rounded-lg p-4 text-sm text-slate-700">
                  <p className="font-semibold mb-2">To get {sel.label} access:</p>
                  <ol className="text-left space-y-1 text-xs">
                    <li>1. Contact the CampusEats administrator</li>
                    <li>2. Request {sel.label} account creation</li>
                    <li>3. Admin will provide your login credentials</li>
                    <li>4. Use those credentials to <Link to="/login" className="text-brand-600 underline font-semibold">login here</Link></li>
                  </ol>
                </div>
              </div>
            );
          }

          return (
            <>
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
                  <span className="text-lg">{sel.icon}</span>
                  <span className="text-sm font-semibold text-slate-700">
                    Creating {sel.label} Account
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-bold text-slate-500">NAME</div>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <div className="mb-2 text-xs font-bold text-slate-500">EMAIL</div>
                <input
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
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
                  placeholder="At least 6 characters"
                  type="password"
                  required
                  minLength={6}
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading ? 'Creating Account…' : `Create ${sel.label} Account`}
              </button>
            </>
          );
        })()}

        <div className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="text-brand-600 underline" to="/login">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}

