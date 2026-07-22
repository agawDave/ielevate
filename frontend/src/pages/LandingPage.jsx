import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    title: 'Bidirectional matching',
    desc: 'Our algorithm pairs you with the right specialist based on skill gaps and goals.',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M6 3a1 1 0 011 1v8.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L5 12.586V4a1 1 0 011-1zm8 14a1 1 0 01-1-1V7.414l-1.293 1.293a1 1 0 11-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 11-1.414 1.414L15 7.414V16a1 1 0 01-1 1z" />
      </svg>
    ),
  },
  {
    title: 'Real-time messaging',
    desc: 'Communicate directly with your match. Schedule sessions and share resources.',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path
          fillRule="evenodd"
          d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H8l-4 3v-3H4a2 2 0 01-2-2V5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    title: 'Blockchain credentials',
    desc: 'Every skill you complete is recorded and verifiable on the blockchain.',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M10 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 14.27l-4.77 2.44.91-5.32L2.27 7.62l5.34-.78L10 2z" />
      </svg>
    ),
  },
  {
    title: 'Portfolio builder',
    desc: 'Showcase your work samples, endorsements, and credentials in one shareable profile.',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
      </svg>
    ),
  },
  {
    title: 'Progress dashboard',
    desc: 'Track sessions completed, skills earned, and goals hit over time.',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path
          fillRule="evenodd"
          d="M3 17a1 1 0 001 1h12a1 1 0 100-2H5v-1a1 1 0 10-2 0v2zm3-3a1 1 0 001-1V9a1 1 0 10-2 0v4a1 1 0 001 1zm4 0a1 1 0 001-1V6a1 1 0 10-2 0v7a1 1 0 001 1zm4 0a1 1 0 001-1v-2a1 1 0 10-2 0v2a1 1 0 001 1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    title: 'Session scheduling',
    desc: 'Book skill sessions that fit your schedule. Reminders handled automatically.',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path
          fillRule="evenodd"
          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-brand-600 text-lg">iElevate</span>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">
              How it works
            </a>
            <a href="#features" className="hover:text-slate-900">
              For specialists
            </a>
            <a href="#features" className="hover:text-slate-900">
              For learners
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-stone-100">
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <span className="inline-block text-xs font-medium bg-brand-50 text-brand-700 rounded-full px-3 py-1.5 mb-6">
          ✦ Skill exchange for Filipino students
        </span>
        <h1 className="text-5xl font-bold leading-tight mb-1">Learn by doing.</h1>
        <h1 className="text-5xl font-bold leading-tight text-brand-600 mb-5">Grow by sharing.</h1>
        <p className="text-slate-500 max-w-xl mx-auto mb-8">
          Connect with specialists, exchange skills, and earn verified blockchain credentials — built for
          college students.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/signup"
            className="rounded-full bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 text-sm font-medium"
          >
            Start learning free
          </Link>
          <a
            href="#features"
            className="rounded-full border border-stone-300 hover:bg-stone-50 px-6 py-3 text-sm font-medium"
          >
            See how it works
          </a>
        </div>
      </section>

      <section className="border-y border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-3 divide-x divide-stone-200 text-center">
          <div>
            <p className="text-2xl font-bold">2,400+</p>
            <p className="text-sm text-slate-500">Active students</p>
          </div>
          <div>
            <p className="text-2xl font-bold">180+</p>
            <p className="text-sm text-slate-500">Skill categories</p>
          </div>
          <div>
            <p className="text-2xl font-bold">98%</p>
            <p className="text-sm text-slate-500">Match satisfaction</p>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">Features</p>
        <h2 className="text-2xl font-bold mb-8">Everything you need to grow</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-stone-50 rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <p className="font-medium mb-1">{f.title}</p>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
