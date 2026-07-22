import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import axiosClient from '../api/axiosClient';

const STATUS_LABEL = {
  pending: 'Pending confirmation',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No-show',
};

const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-stone-200 text-stone-600',
  cancelled: 'bg-red-100 text-red-600',
  no_show: 'bg-red-100 text-red-600',
};

function formatRange(startsAt, endsAt) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const startStr = start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const endStr = end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${dateStr} · ${startStr}–${endStr}`;
}

function SessionCard({ session, onUpdateStatus }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{session.otherUserName || `User #${session.otherUserId}`}</p>
          <p className="text-sm text-slate-500 mt-0.5">
            You teach {session.iTeach} · They teach {session.theyTeach}
          </p>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
            STATUS_STYLE[session.status] || 'bg-stone-100 text-stone-600'
          }`}
        >
          {STATUS_LABEL[session.status] || session.status}
        </span>
      </div>
      <p className="text-sm text-slate-700 mt-3">{formatRange(session.startsAt, session.endsAt)}</p>
      {session.meetingLink && (
        <a
          href={session.meetingLink}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-brand-600 hover:underline mt-1 inline-block truncate max-w-full"
        >
          {session.meetingLink}
        </a>
      )}

      {session.status === 'pending' && !session.scheduledByMe && (
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onUpdateStatus(session.id, 'confirmed')}
            className="text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-full px-3 py-1.5"
          >
            Confirm
          </button>
          <button
            onClick={() => onUpdateStatus(session.id, 'cancelled')}
            className="text-sm text-slate-500 hover:text-red-500 px-3 py-1.5"
          >
            Decline
          </button>
        </div>
      )}
      {session.status === 'pending' && session.scheduledByMe && (
        <div className="flex items-center gap-2 mt-3">
          <p className="text-sm text-slate-500">Waiting for confirmation…</p>
          <button
            onClick={() => onUpdateStatus(session.id, 'cancelled')}
            className="text-sm text-slate-500 hover:text-red-500 px-3 py-1.5"
          >
            Cancel
          </button>
        </div>
      )}
      {session.status === 'confirmed' && (
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onUpdateStatus(session.id, 'cancelled')}
            className="text-sm text-slate-500 hover:text-red-500 px-3 py-1.5"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadSessions() {
    axiosClient
      .get('/sessions/me')
      .then((r) => setSessions(r.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function handleUpdateStatus(sessionId, status) {
    await axiosClient.patch(`/sessions/${sessionId}/status`, { status });
    loadSessions();
  }

  const now = new Date();
  const upcoming = sessions.filter((s) => new Date(s.endsAt) >= now && s.status !== 'cancelled');
  const past = sessions.filter((s) => new Date(s.endsAt) < now || s.status === 'cancelled');

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">Scheduled Sessions</h1>
      {loading && <p className="text-slate-500">Loading sessions…</p>}

      {!loading && (
        <>
          <h2 className="font-semibold text-brand-600 mb-3">Upcoming</h2>
          {upcoming.length === 0 && (
            <p className="text-slate-500 text-sm mb-6">
              No upcoming sessions — propose one from a match on the Find a Match page.
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {upcoming.map((s) => (
              <SessionCard key={s.id} session={s} onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>

          <h2 className="font-semibold text-brand-600 mb-3">Past</h2>
          {past.length === 0 && <p className="text-slate-500 text-sm">No past sessions yet.</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            {past.map((s) => (
              <SessionCard key={s.id} session={s} onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}
