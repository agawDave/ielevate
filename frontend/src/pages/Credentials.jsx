import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import axiosClient from '../api/axiosClient';

const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-700',
  minted: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-600',
};

export default function Credentials() {
  const [credentials, setCredentials] = useState([]);

  useEffect(() => {
    axiosClient.get('/credentials/me').then((r) => setCredentials(r.data.data));
  }, []);

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-1">Credentials</h1>
      <p className="text-slate-500 mb-6">Verified blockchain records of your completed skill sessions.</p>

      {credentials.length === 0 && (
        <p className="text-slate-500">No credentials issued yet — complete a skill exchange to earn one.</p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {credentials.map((c) => (
          <div key={c.id} className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <p className="font-medium">{c.skill_name}</p>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                  STATUS_STYLE[c.status] || 'bg-stone-100 text-stone-600'
                }`}
              >
                {c.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Taught by {c.issuer_name}</p>
            {c.tx_hash && <p className="text-xs text-slate-400 mt-2 truncate">Tx: {c.tx_hash}</p>}
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
