import { useEffect, useMemo, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as playlists from "../../services/playlistService";
import * as songs from "../../services/songService";
import { UserContext } from "../../contexts/UserContext";

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [myPlaylists, setMyPlaylists] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [catalogueCount, setCatalogueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({ name: "", isPublic: false });

  useEffect(() => {
    (async () => {
      try {
        const [lists, catalog] = await Promise.all([playlists.mine(), songs.getAll()]);
        setMyPlaylists(Array.isArray(lists) ? lists : []);
        setCatalogue(Array.isArray(catalog) ? catalog : []);
        setCatalogueCount(Array.isArray(catalog) ? catalog.length : 0);
      } catch (e) {
        setErr(e.message || "Something went wrong loading your dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleCreateFirstPlaylist(e) {
    e.preventDefault();
    try {
      const created = await playlists.create(form);
      setMyPlaylists((prev) => [created, ...prev]);
      setForm({ name: "", isPublic: false });
      navigate(`/playlists/${created._id}`);
    } catch (e) {
      setErr(e.message);
    }
  }

  const songById = useMemo(() => {
    const map = new Map();
    for (const s of catalogue) {
      if (s && (s._id || s.id)) map.set(String(s._id || s.id), s);
    }
    return map;
  }, [catalogue]);

  const allArtistsOnMyPlaylists = useMemo(() => {
    const artists = [];
    for (const p of myPlaylists) {
      const items = p?.songs || p?.tracks || [];
      for (const it of items) {
        if (!it) continue;
        if (typeof it === "string") {
          const found = songById.get(it);
          if (found?.artist) artists.push(found.artist);
        } else if (it?._id || it?.id) {
          if (it.artist) {
            artists.push(it.artist);
          } else {
            const found = songById.get(String(it._id || it.id));
            if (found?.artist) artists.push(found.artist);
          }
        }
      }
    }
    return artists;
  }, [myPlaylists, songById]);

  const topArtists = useMemo(() => {
    const counts = new Map();
    for (const a of allArtistsOnMyPlaylists) {
      counts.set(a, (counts.get(a) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [allArtistsOnMyPlaylists]);

  const recentPlaylists = useMemo(() => {
    return [...myPlaylists].slice(0, 6);
  }, [myPlaylists]);

  if (!user) {
    return (
      <main className="container">
        <h1>Welcome</h1>
        <p>Please sign in to manage your music.</p>
        <Link className="btn" to="/sign-in">Sign In</Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="container"><p>Loading…</p></main>
    );
  }

  if (myPlaylists.length === 0) {
    return (
      <main className="container" style={{ display: "grid", gap: "1rem" }}>
        <h1>Welcome, {user.username} 👋</h1>
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <section className="card" style={{ padding: "1rem" }}>
          <h2>Let’s get you set up</h2>
          <ol style={{ lineHeight: 1.7 }}>
            <li><strong>Create your first playlist</strong> (name, public/private)</li>
            <li>
              {catalogueCount > 0 ? (
                <>Browse the <Link to="/songs">Song Catalogue</Link> and add songs</>
              ) : (
                <>Add a few songs on the <Link to="/songs">Song Catalogue</Link> page</>
              )}
            </li>
            <li>Open your playlist to add/remove songs any time</li>
          </ol>
        </section>

        <section className="card" style={{ padding: "1rem" }}>
          <h3>Create Your First Playlist</h3>
          <form onSubmit={handleCreateFirstPlaylist} style={{ display: "grid", gap: ".5rem", maxWidth: 520 }}>
            <input
              placeholder="Playlist name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              />
              Make this playlist public
            </label>
            <div style={{ display: "flex", gap: ".5rem" }}>
              <button type="submit" className="btn">Create playlist</button>
              <Link className="btn btn-outline" to="/songs">
                {catalogueCount > 0 ? "Browse songs" : "Add songs first"}
              </Link>
            </div>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="container" style={{ display: "grid", gap: "1.25rem" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".5rem", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          <Link className="btn" to="/playlists">Manage Playlists</Link>
          <Link className="btn btn-outline" to="/songs">Song Catalogue ({catalogueCount})</Link>
        </div>
      </header>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {/* Recently created playlists */}
      <section className="card" style={{ padding: "1rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: ".75rem" }}>
          <h2 style={{ margin: 0 }}>Recently created</h2>
          <Link to="/playlists" className="btn btn-small btn-outline">View all</Link>
        </div>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {recentPlaylists.map((p) => (
            <li key={p._id} className="card" style={{ padding: "1rem" }}>
              <h3 style={{ marginTop: 0, marginBottom: 0 }}>
                <Link to={`/playlists/${p._id}`} style={{ color: "inherit" }}>
                  {p.name}
                </Link>
              </h3>
              {/* Created At removed */}
            </li>
          ))}
        </ul>
      </section>

      {/* Top artists */}
      <section className="card" style={{ padding: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Your top artists</h2>
        {topArtists.length === 0 ? (
          <p style={{ marginTop: ".5rem" }}>
            Add songs to your playlists to see your top artists here.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: ".75rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {topArtists.map((a) => (
              <li
                key={a.name}
                className="card"
                style={{ padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <span style={{ fontWeight: 600 }}>{a.name}</span>
                <span
                  title={`${a.count} song${a.count === 1 ? "" : "s"} across your playlists`}
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    border: "1px solid var(--border, #ccc)",
                    padding: ".125rem .5rem",
                    borderRadius: "999px",
                    opacity: 0.85,
                  }}
                >
                  {a.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
