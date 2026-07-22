import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function AddSkillForm({ onAdded }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [relationType, setRelationType] = useState('teaches');
  const [proficiency, setProficiency] = useState('beginner');
  const [yearsExperience, setYearsExperience] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query || selectedSkill) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      axiosClient.get('/skills/search', { params: { q: query } }).then((r) => setResults(r.data.data));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, selectedSkill]);

  function pickSkill(skill) {
    setSelectedSkill(skill);
    setQuery(skill.name);
    setResults([]);
  }

  function clearSelection() {
    setSelectedSkill(null);
    setQuery('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!selectedSkill) {
      setError('Pick a skill from the list first');
      return;
    }
    setSubmitting(true);
    try {
      await axiosClient.post('/skills/me', {
        skillId: selectedSkill.id,
        relationType,
        proficiency: relationType === 'teaches' ? proficiency : null,
        yearsExperience: relationType === 'teaches' && yearsExperience ? yearsExperience : null,
        description: description || null,
      });
      clearSelection();
      setYearsExperience('');
      setDescription('');
      onAdded?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add skill');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for a skill…"
          className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedSkill(null);
          }}
        />
        {results.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-stone-200 rounded-lg max-h-48 overflow-auto shadow-lg">
            {results.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm hover:bg-stone-100"
                  onClick={() => pickSkill(s)}
                >
                  {s.name} <span className="text-slate-500">({s.category})</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-3">
        <select
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          value={relationType}
          onChange={(e) => setRelationType(e.target.value)}
        >
          <option value="teaches">I can teach this</option>
          <option value="wants_to_learn">I want to learn this</option>
        </select>

        {relationType === 'teaches' && (
          <>
            <select
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="Years"
              className="w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
            />
          </>
        )}
      </div>

      <input
        type="text"
        placeholder="Short description (optional)"
        className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-brand-600 hover:bg-brand-700 transition px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Adding…' : 'Add skill'}
      </button>
    </form>
  );
}
