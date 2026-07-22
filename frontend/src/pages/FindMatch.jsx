import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import axiosClient from '../api/axiosClient';

function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

// Backend stores naive local datetimes (no timezone), so format using local
// components rather than toISOString(), which would convert to UTC.
function toMySqlDatetime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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

export default function FindMatch() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [startingId, setStartingId] = useState(null);
  const [openSessionForId, setOpenSessionForId] = useState(null);
  const [startsAt, setStartsAt] = useState('');
  const [duration, setDuration] = useState('60');
  const [meetingLink, setMeetingLink] = useState('');
  const [proposing, setProposing] = useState(false);
  const [proposeError, setProposeError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient
      .get('/matches')
      .then((r) => setMatches(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const filteredMatches = useMemo(() => {
    if (!query.trim()) return matches;
    const q = query.trim().toLowerCase();
    return matches.filter(
      (m) =>
        m.candidateName?.toLowerCase().includes(q) ||
        m.pairs.some((p) => p.theyTeachName?.toLowerCase().includes(q))
    );
  }, [matches, query]);

  async function handleStartConversation(candidateId) {
    setStartingId(candidateId);
    try {
      const { data } = await axiosClient.post('/messages/conversations', { otherUserId: candidateId });
      navigate(`/messages/${data.data.conversationId}`);
    } finally {
      setStartingId(null);
    }
  }

  function openSessionForm(match) {
    setOpenSessionForId(match.candidateId);
    setProposeError('');
    const inHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    setStartsAt(toLocalInputValue(inHourFromNow));
    setDuration('60');
    setMeetingLink('');
  }

  async function handleProposeSession(match) {
    setProposeError('');
    if (!startsAt) {
      setProposeError('Pick a start time');
      return;
    }
    const pair = match.pairs[0];
    const startsAtDate = new Date(startsAt);
    const endsAtDate = new Date(startsAtDate.getTime() + Number(duration) * 60 * 1000);

    setProposing(true);
    try {
      const { data: exchangeRes } = await axiosClient.post('/exchanges', {
        otherUserId: match.candidateId,
        mySkillId: pair.iTeach,
        theirSkillId: pair.theyTeach,
        score: match.score,
      });
      await axiosClient.post('/sessions', {
        exchangeId: exchangeRes.data.exchangeId,
        startsAt: toMySqlDatetime(startsAtDate),
        endsAt: toMySqlDatetime(endsAtDate),
        meetingLink: meetingLink || null,
      });
      navigate('/sessions');
    } catch (err) {
      setProposeError(err.response?.data?.message || 'Failed to propose session');
    } finally {
      setProposing(false);
    }
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-1">Find a match</h1>
      <p className="text-slate-500 mb-6">Search by skill, category, or name.</p>

      <input
        type="text"
        placeholder="Search by skill, name, or category…"
        className="w-full max-w-md rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent mb-6"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p className="text-slate-500">Looking for skill matches…</p>}
      {!loading && filteredMatches.length === 0 && (
        <p className="text-slate-500">
          {matches.length === 0
            ? 'No matches yet — add more skills to your profile to improve matching.'
            : 'No matches found for that search.'}
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMatches.map((m) => (
          <div key={m.candidateId} className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {initials(m.candidateName)}
                </div>
                <p className="font-medium">{m.candidateName || `Candidate #${m.candidateId}`}</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-1 font-medium shrink-0">
                {Math.min(99, 80 + m.score * 5)}% match
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {[...new Set(m.pairs.map((p) => p.theyTeachName))].map((name) => (
                <span key={name} className="text-xs bg-stone-100 text-slate-600 rounded-full px-2.5 py-1">
                  {name}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleStartConversation(m.candidateId)}
                disabled={startingId === m.candidateId}
                className="text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-full px-3 py-1.5 disabled:opacity-50"
              >
                {startingId === m.candidateId ? 'Starting…' : 'Connect'}
              </button>
              <button
                onClick={() => openSessionForm(m)}
                className="text-sm bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-full px-3 py-1.5"
              >
                Propose a session
              </button>
            </div>

            {openSessionForId === m.candidateId && (
              <div className="mt-4 pt-4 border-t border-stone-200 space-y-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Start time</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Duration</label>
                  <select
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Meeting link (optional)"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
                {proposeError && <p className="text-red-500 text-sm">{proposeError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleProposeSession(m)}
                    disabled={proposing}
                    className="text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-full px-3 py-1.5 disabled:opacity-50"
                  >
                    {proposing ? 'Proposing…' : 'Confirm proposal'}
                  </button>
                  <button
                    onClick={() => setOpenSessionForId(null)}
                    className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
