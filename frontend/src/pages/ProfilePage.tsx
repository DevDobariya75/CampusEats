import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-black text-white">Profile</h1>
        <p className="mt-2 text-sm text-slate-300">
          Your account info from the login session.
        </p>
      </div>

      <div className="card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs font-bold text-slate-400">NAME</div>
            <div className="mt-1 text-base font-extrabold text-white">{user?.name}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">EMAIL</div>
            <div className="mt-1 text-base font-extrabold text-white">{user?.email}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">ROLE</div>
            <div className="mt-1 text-base font-extrabold text-white">{user?.role}</div>
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-500">
          Next: we can add “Update Details” + “Update Password” screens to call your backend
          endpoints.
        </div>
      </div>
    </div>
  );
}

