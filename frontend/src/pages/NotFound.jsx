import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-slate-900">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-slate-500 mb-4">This page doesn't exist.</p>
      <Link to="/dashboard" className="text-brand-600 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
