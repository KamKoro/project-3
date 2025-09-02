import { useEffect, useState } from 'react';
import * as songs from '../../services/songService';

export default function SongsPage() {
  const [catalogue, setCatalogue] = useState([]);
  const [form, setForm] = useState({ title: '', artist: '', album: '', year: '', coverUrl: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);
  async function load() {
    try { setCatalogue(await songs.getAll()); }
    catch (e) { setError(e.message); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const payload = { ...form, year: form.year ? Number(form.year) : undefined };
      const created = await songs.create(payload);
      setCatalogue([created, ...catalogue]);
      setForm({ title: '', artist: '', album: '', year: '', coverUrl: '' });
    } catch (e) { setError(e.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this song?')) return;
    try {
      await songs.remove(id);
      setCatalogue(catalogue.filter(s => s._id !== id));
    } catch (e) { setError(e.message); }
  }

  return (
    <main className="container">
      <h1>Song Catalogue</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <form onSubmit={handleCreate} className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h2>Add a Song</h2>
        <div className="grid" style={{ display: 'grid', gap: '.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <input placeholder="Artist" value={form.artist} onChange={e => setForm({ ...form, artist: e.target.value })} required />
          <input placeholder="Album" value={form.album} onChange={e => setForm({ ...form, album: e.target.value })} />
          <input placeholder="Year" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} inputMode="numeric" />
          <input placeholder="Cover URL" value={form.coverUrl} onChange={e => setForm({ ...form, coverUrl: e.target.value })} />
        </div>
        <button type="submit" style={{ marginTop: '.5rem' }}>Add</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '.75rem' }}>
        {catalogue.map(s => (
          <li key={s._id} className="card" style={{ padding: '.75rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            {s.coverUrl ? <img src={s.coverUrl} alt={`${s.title} cover`} width="56" height="56" style={{ objectFit: 'cover' }} /> : <div style={{ width: 56, height: 56, background: '#eee' }} />}
            <div style={{ flex: 1 }}>
              <strong>{s.title}</strong> — {s.artist} {s.album ? <>· <em>{s.album}</em></> : null}
              {s.year ? <> · {s.year}</> : null}
            </div>
            {/* Owner-only actions: back-end enforces auth; front-end hides for guests */}
            {localStorage.getItem('token') && (
              <button className="btn btn-outline" onClick={() => handleDelete(s._id)}>Delete</button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
