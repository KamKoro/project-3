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

      {/* Playlist list */}
      <ul className="grid" style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
        {lists.map(p => (
          <li key={p._id} className="card" style={{ padding: '1rem' }}>
            <h3 style={{ margin: 0 }}>
              <a href={`/playlists/${p._id}`}>{p.name}</a>
            </h3>
            <p>{p.description}</p>
            <small>{p.isPublic ? 'Public' : 'Private'}</small>
            <div style={{ marginTop: '.5rem', display: 'flex', gap: '.5rem' }}>
              <a className="btn" href={`/playlists/${p._id}`}>Open</a>
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
