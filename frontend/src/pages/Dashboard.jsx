import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function initials(name) {
  return (
    name
      ?.split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-stone-200 text-stone-600',
  cancelled: 'bg-red-100 text-red-600',
  no_show: 'bg-red-100 text-red-600',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [matches, setMatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [startingId, setStartingId] = useState(null);

  useEffect(() => {
    axiosClient.get('/dashboard/summary').then((r) => setSummary(r.data.data));
    axiosClient.get('/matches').then((r) => setMatches(r.data.data.slice(0, 3)));
    axiosClient.get('/sessions/me').then((r) => {
      const upcoming = r.data.data
        .filter((s) => new Date(s.endsAt) >= new Date() && s.status !== 'cancelled')
        .slice(0, 3);
      setSessions(upcoming);
    });
  }, []);

  async function handleConnect(candidateId) {
    setStartingId(candidateId);
    try {
      const { data } = await axiosClient.post('/messages/conversations', { otherUserId: candidateId });
      navigate(`/messages/${data.data.conversationId}`);
    } finally {
      setStartingId(null);
    }
  }

  const tiles = [
    { label: 'Active Exchanges', value: summary?.activeExchanges },
    { label: 'Pending Matches', value: summary?.pendingMatches },
    { label: 'Credentials Earned', value: summary?.credentialsEarned },
  ];

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            {greeting()}, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500">Here's what's happening with your learning journey.</p>
        </div>
        <Link
          to="/find-match"
          className="rounded-full bg-brand-600 hover:bg-brand-700 transition px-5 py-2.5 text-sm font-medium text-white whitespace-nowrap"
        >
          + Find a match
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {tiles.map(({ label, value }) => (
          <div key={label} className="bg-white border border-stone-200 rounded-xl p-5">
            <p className="text-slate-500 text-sm">{label}</p>
            <p className="text-3xl font-bold mt-1">{value ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Top matches for you</h2>
            <Link to="/find-match" className="text-sm text-brand-600 hover:underline">
              See all →
            </Link>
          </div>
          {matches.length === 0 && <p className="text-slate-500 text-sm">No matches yet.</p>}
          <div className="space-y-3">
            {matches.map((m) => (
              <div key={m.candidateId} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {initials(m.candidateName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{m.candidateName || `Candidate #${m.candidateId}`}</p>
                  <p className="text-xs text-slate-500">Overlap score: {m.score}</p>
                </div>
                <button
                  onClick={() => handleConnect(m.candidateId)}
                  disabled={startingId === m.candidateId}
                  className="text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-full px-3 py-1.5 font-medium disabled:opacity-50 shrink-0"
                >
                  {startingId === m.candidateId ? 'Starting…' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Upcoming sessions</h2>
            <Link to="/sessions" className="text-sm text-brand-600 hover:underline">
              View all →
            </Link>
          </div>
          {sessions.length === 0 && <p className="text-slate-500 text-sm">No upcoming sessions.</p>}
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {s.iTeach} w/ {s.otherUserName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(s.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ·{' '}
                    {new Date(s.startsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    STATUS_STYLE[s.status] || 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
