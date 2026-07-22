import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const steps = [
  { title: 'Create your profile', desc: 'Choose your role and set up your skills' },
  { title: 'Get matched', desc: 'Our algorithm finds your best skill partner' },
  { title: 'Schedule a session', desc: 'Book and connect with your match' },
  { title: 'Earn credentials', desc: 'Receive verified blockchain certificates' },
];

const ROLES = [
  { value: 'specialist', label: 'Specialist', desc: 'Share skills · Build reputation' },
  { value: 'beneficiary', label: 'Beneficiary', desc: 'Find specialists · Level up your skills' },
];

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    schoolOrOrg: '',
    userType: 'specialist',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <p className="text-xs uppercase tracking-wide text-brand-200 mb-4">How it works</p>
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-brand-200 text-xs">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-1">Create your account</h2>
          <p className="text-slate-500 text-sm mb-6">Join iElevate and start your skill journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">I want to join as a</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, userType: r.value })}
                    className={`text-left rounded-lg border p-3 transition ${
                      form.userType === r.value
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-stone-300 hover:border-stone-400'
                    }`}
                  >
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-slate-500">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Full name"
              className="w-full rounded-lg border border-stone-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="School / Organization (optional)"
              className="w-full rounded-lg border border-stone-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={form.schoolOrOrg}
              onChange={(e) => setForm({ ...form, schoolOrOrg: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-lg border border-stone-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              className="w-full rounded-lg border border-stone-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-brand-600 hover:bg-brand-700 transition py-2.5 font-medium text-white disabled:opacity-50"
            >
              {submitting ? 'Creating account…' : 'Create my account'}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
