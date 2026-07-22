import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const icons = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
    </svg>
  ),
  match: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M6 3a1 1 0 011 1v8.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L5 12.586V4a1 1 0 011-1zm8 14a1 1 0 01-1-1V7.414l-1.293 1.293a1 1 0 11-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 11-1.414 1.414L15 7.414V16a1 1 0 01-1 1z" />
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path
        fillRule="evenodd"
        d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H8l-4 3v-3H4a2 2 0 01-2-2V5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  sessions: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path
        fillRule="evenodd"
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z"
        clipRule="evenodd"
      />
    </svg>
  ),
  credentials: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M10 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 14.27l-4.77 2.44.91-5.32L2.27 7.62l5.34-.78L10 2z" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-6 8a6 6 0 0112 0H4z" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path
        fillRule="evenodd"
        d="M10 1l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V4l7-3zm0 4a2 2 0 100 4 2 2 0 000-4zm0 6c-1.7 0-3.2.6-4.2 1.6a5.9 5.9 0 008.4 0C13.2 11.6 11.7 11 10 11z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/find-match', label: 'Find a Match', icon: 'match' },
  { to: '/messages', label: 'Messages', icon: 'messages' },
  { to: '/sessions', label: 'Sessions', icon: 'sessions' },
  { to: '/credentials', label: 'Credentials', icon: 'credentials' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
];

const USER_TYPE_LABEL = {
  specialist: 'Specialist',
  beneficiary: 'Beneficiary',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.fullName
    ?.split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-stone-200 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5">
        <span className="font-bold text-brand-600 text-lg">iElevate</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-slate-500 hover:bg-stone-100 hover:text-slate-800'
              }`
            }
          >
            {icons[l.icon]}
            {l.label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-slate-500 hover:bg-stone-100 hover:text-slate-800'
              }`
            }
          >
            {icons.admin}
            Admin
          </NavLink>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-stone-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{user?.fullName}</p>
          <p className="text-xs text-slate-500">{USER_TYPE_LABEL[user?.userType] || 'Member'}</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          title="Log out"
          className="text-slate-400 hover:text-red-500 shrink-0"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 011-1h6a1 1 0 110 2H5v12h5a1 1 0 110 2H4a1 1 0 01-1-1V3zm10.293 3.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}
