// src/components/PlaylistsPage/PlaylistsPage.jsx
import { useEffect, useState } from 'react';
import * as playlists from '../../services/playlistService';
import { Link } from 'react-router-dom';

export default function PlaylistsPage() {
  const [lists, setLists] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', isPublic: false });
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    try { setLists(await playlists.mine()); }
    catch (e) { setError(e.message); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const created = await playlists.create(form);
      setLists([created, ...lists]);
      setForm({ name: '', description: '', isPublic: false });
      setShowForm(false);
    } catch (e) { setError(e.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this playlist?')) return;
    try {
      await playlists.remove(id);
      setLists(lists.filter(p => p._id !== id));
    } catch (e) { setError(e.message); }
  }

  return (
    <main className="container" style={{ position: 'relative', minHeight: '100vh' }}>
      <h1>My Playlists</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {/* Playlist grid */}
      <ul
        className="grid"
        style={{
          listStyle: 'none',
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        {lists.map(p => (
          <li key={p._id} className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
            <Link to={`/playlists/${p._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ width: '100%', aspectRatio: '1 / 1', background: 'var(--bg-elev,#1a1a1a)' }}>
                <img
                  src={p.coverUrl || '/covers/playlist-default.png'}
                  alt={`${p.name} cover`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  loading="lazy"
                />
              </div>
              <div style={{ padding: '0.75rem 0.9rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', lineHeight: 1.2 }}>{p.name}</h3>
                {p.description && (
                  <p style={{ margin: '0.25rem 0 0', fontSize: '.875rem', opacity: 0.85 }}>{p.description}</p>
                )}
                <small style={{ opacity: .7 }}>{p.isPublic ? 'Public' : 'Private'}</small>
              </div>
            </Link>
            <div style={{ padding: '0 0.9rem 0.9rem', display: 'flex', gap: '.5rem' }}>
              <Link className="btn" to={`/playlists/${p._id}`}>Open</Link>
              <button className="btn btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Floating button */}
      <button
        className="fab"
        onClick={() => setShowForm(!showForm)}
        aria-label="Create Playlist"
      >
        {showForm ? "✖" : "➕"}
      </button>

      {/* Overlay form */}
      {showForm && (
        <div className="fab-form-overlay">
          <div className="fab-form card">
            <h2>Create Playlist</h2>
            <form onSubmit={handleCreate}>
              <input
                placeholder="Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={e => setForm({ ...form, isPublic: e.target.checked })}
                />
                Public
              </label>
              <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn">Create</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
