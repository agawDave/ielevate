import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3" />

        <span className="font-bold text-lg relative">iElevate</span>

        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight mb-1">Learn by doing.</h1>
          <h1 className="text-4xl font-bold leading-tight text-brand-200 mb-4">Grow by sharing.</h1>
          <p className="text-brand-100 max-w-sm mb-6">
            Connect with specialists, exchange skills, and earn blockchain credentials.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Bidirectional matching', 'Blockchain creds', 'Real-time chat', 'Portfolio builder'].map((t) => (
              <span key={t} className="text-xs bg-white/15 rounded-full px-3 py-1.5">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-8 relative text-sm">
          <div>
            <p className="text-2xl font-bold">2,400+</p>
            <p className="text-brand-200">Active students</p>
          </div>
          <div>
            <p className="text-2xl font-bold">180+</p>
            <p className="text-brand-200">Skill categories</p>
          </div>
          <div>
            <p className="text-2xl font-bold">98%</p>
            <p className="text-brand-200">Satisfaction</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to your iElevate account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-stone-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="text-sm font-medium">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs text-brand-600 hover:underline"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full rounded-lg border border-stone-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-brand-600 hover:bg-brand-700 transition py-2.5 font-medium text-white disabled:opacity-50"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-8 text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 font-medium hover:underline">
              Create your free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
