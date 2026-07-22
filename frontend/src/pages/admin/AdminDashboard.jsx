import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import axiosClient from '../../api/axiosClient';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axiosClient.get('/admin/stats').then((r) => setStats(r.data.data));
  }, []);

  const cards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers },
        { label: 'Total Exchanges', value: stats.totalExchanges },
        { label: 'Active Exchanges', value: stats.activeExchanges },
        { label: 'Credentials Issued', value: stats.credentialsIssued },
        { label: 'Open Disputes', value: stats.openDisputes },
      ]
    : [];

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-slate-500 text-xs">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
