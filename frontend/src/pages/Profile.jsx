import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import AddSkillForm from '../components/AddSkillForm';
import axiosClient from '../api/axiosClient';

const USER_TYPE_LABEL = {
  specialist: 'Specialist',
  beneficiary: 'Beneficiary',
};

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

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [walletInput, setWalletInput] = useState('');
  const [walletSaving, setWalletSaving] = useState(false);
  const [walletMessage, setWalletMessage] = useState('');

  function loadProfile() {
    axiosClient.get('/users/me').then((r) => {
      setProfile(r.data.data);
      setWalletInput(r.data.data.wallet_address || '');
    });
  }

  function loadSkills() {
    axiosClient.get('/skills/me').then((r) => setSkills(r.data.data));
  }

  useEffect(() => {
    loadProfile();
    loadSkills();
  }, []);

  async function handleRemoveSkill(id) {
    await axiosClient.delete(`/skills/me/${id}`);
    loadSkills();
  }

  async function handleSaveWallet(e) {
    e.preventDefault();
    setWalletSaving(true);
    setWalletMessage('');
    try {
      await axiosClient.patch('/users/me', { walletAddress: walletInput });
      setWalletMessage('Wallet address saved');
      loadProfile();
    } catch (err) {
      setWalletMessage(err.response?.data?.message || 'Failed to save wallet address');
    } finally {
      setWalletSaving(false);
    }
  }

  const teaches = skills.filter((s) => s.relation_type === 'teaches');
  const wantsToLearn = skills.filter((s) => s.relation_type === 'wants_to_learn');

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">My Skill Profile</h1>
      {profile && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-lg font-semibold shrink-0">
            {initials(profile.full_name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-lg">{profile.full_name}</p>
              {profile.user_type && (
                <span className="text-xs bg-brand-50 text-brand-700 rounded-full px-2.5 py-0.5 font-medium">
                  {USER_TYPE_LABEL[profile.user_type]}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm">{profile.school_or_org}</p>
            <p className="text-slate-500 text-sm mt-1">{profile.bio || 'No bio yet.'}</p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <h2 className="font-semibold mb-3 text-brand-600">Teaches</h2>
          {teaches.length === 0 && <p className="text-slate-500 text-sm">No skills added yet.</p>}
          <ul className="space-y-1">
            {teaches.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm text-slate-700">
                <span>
                  {s.skill_name} <span className="text-slate-500">({s.proficiency})</span>
                </span>
                <button
                  onClick={() => handleRemoveSkill(s.id)}
                  className="text-slate-400 hover:text-red-500 text-xs"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <h2 className="font-semibold mb-3 text-brand-600">Wants to Learn</h2>
          {wantsToLearn.length === 0 && <p className="text-slate-500 text-sm">No skills added yet.</p>}
          <ul className="space-y-1">
            {wantsToLearn.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm text-slate-700">
                <span>{s.skill_name}</span>
                <button
                  onClick={() => handleRemoveSkill(s.id)}
                  className="text-slate-400 hover:text-red-500 text-xs"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold mb-3 text-brand-600">Add a Skill</h2>
        <AddSkillForm onAdded={loadSkills} />
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <h2 className="font-semibold mb-1 text-brand-600">Wallet Address</h2>
        <p className="text-slate-500 text-sm mb-3">
          Connect a wallet address to receive blockchain credentials when you complete skill exchanges.
        </p>
        <form onSubmit={handleSaveWallet} className="flex gap-3">
          <input
            type="text"
            placeholder="0x…"
            className="flex-1 rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            value={walletInput}
            onChange={(e) => setWalletInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={walletSaving}
            className="rounded-full bg-brand-600 hover:bg-brand-700 transition px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {walletSaving ? 'Saving…' : 'Save'}
          </button>
        </form>
        {walletMessage && <p className="text-sm text-slate-500 mt-2">{walletMessage}</p>}
      </div>
    </AppLayout>
  );
}
