import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.register({ name, email, password, role });
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
        <h1 className="text-2xl font-black text-white">Create account</h1>
        <p className="mt-2 text-sm text-slate-300">
          Join CampusEats and start ordering instantly.
        </p>
      </div>

      <form className="card space-y-4 p-6" onSubmit={submit}>
        <div>
          <div className="mb-2 text-xs font-bold text-slate-400">NAME</div>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <div className="mb-2 text-xs font-bold text-slate-400">EMAIL</div>
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
          <div className="mb-2 text-xs font-bold text-slate-400">PASSWORD</div>
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 chars (Upper, lower, number)"
            type="password"
            required
          />
        </div>
        <div>
          <div className="mb-2 text-xs font-bold text-slate-400">ROLE</div>
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="student">Student</option>
            <option value="shop_owner">Shop Owner</option>
          </select>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>

        <div className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link className="text-brand-200 underline" to="/login">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}

