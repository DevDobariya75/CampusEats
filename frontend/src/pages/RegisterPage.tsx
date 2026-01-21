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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.register({ name, email, password });
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
      <div className="card p-6">
        <h1 className="text-2xl font-black text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Join CampusEats and start ordering instantly. (Shopkeepers and delivery partners are created by admin.)
        </p>
      </div>

      <form className="card space-y-4 p-6" onSubmit={submit}>
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
            placeholder="At least 6 chars (Upper, lower, number)"
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
          {loading ? 'Creating…' : 'Create account'}
        </button>

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

