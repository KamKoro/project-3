import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as playlists from '../../services/playlistService';

export default function PlaylistsPage() {
  const navigate = useNavigate();

  const [lists, setLists] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', isPublic: false });
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    try {
      const data = await playlists.mine();
      setLists(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const created = await playlists.create(form);
      setLists(prev => [created, ...prev]);
      setForm({ name: '', description: '', isPublic: false });
      setShowForm(false);
      // Go straight to the new playlist
      navigate(`/playlists/${created._id}`);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this playlist?')) return;
    try {
      await playlists.remove(id);
      setLists(prev => prev.filter(p => p._id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  const isEmpty = lists.length === 0;

  return (
    <main className="container" style={{ position: 'relative', minHeight: '100vh' }}>
      <h1>My Playlists</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {isEmpty ? (
        <section className="card" style={{ marginBottom: '1rem' }}>
          <h2>Let’s create your first playlist</h2>
          <p>You don’t have any playlists yet.</p>
          <button className="btn" onClick={() => setShowForm(true)}>➕ New Playlist</button>
        </section>
      ) : (
        <ul className="grid">
          {lists.map(p => (
            <li key={p._id} className="card">
              <h3 style={{ margin: 0 }}>
                <Link to={`/playlists/${p._id}`}>{p.name}</Link>
              </h3>
              <p>{p.description}</p>
              <small>{p.isPublic ? 'Public' : 'Private'}</small>
              <div style={{ marginTop: '.5rem', display: 'flex', gap: '.5rem' }}>
                <Link className="btn" to={`/playlists/${p._id}`}>Open</Link>
                <button className="btn btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Floating button */}
      <button
        className="fab"
        onClick={() => setShowForm(!showForm)}
        aria-label="Create Playlist"
      >
        {showForm ? '✖' : '➕'}
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
