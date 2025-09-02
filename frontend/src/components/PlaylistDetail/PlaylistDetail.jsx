// src/components/PlaylistDetail/PlaylistDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as playlists from "../../services/playlistService";
import SongAutocomplete from "../Songs/SongAutocomplete.jsx";

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");

  // meta/settings
  const [edit, setEdit] = useState({ name: "", description: "", isPublic: false });

  // UI state
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // settings hidden by default

  // tiny transparent pixel
  const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

  // Helper: normalize to public URL for local covers in /public/covers
  const toCoverSrc = (val) => {
    if (!val) return null;
    if (val.startsWith("/covers/")) return val;            // local cover
    if (/^https?:\/\//i.test(val)) return val;             // external (kept as-is)
    // fallback: treat as filename placed under /covers
    return `/covers/${val.replace(/^\/+/, "")}`;
  };

  // Small cover component with graceful fallback + no broken icon
  function Cover({ url, title }) {
    const [ok, setOk] = useState(Boolean(url));
    const src = toCoverSrc(url) || BLANK;
    const initial = (title || "?").slice(0, 1).toUpperCase();

    if (!ok) {
      return (
        <div className="cover-fallback" aria-label={`${title} cover`}>
          {initial}
        </div>
      );
    }
    return (
      <img
        className="cover-img"
        src={src}
        alt={`${title} cover`}
        loading="lazy"
        decoding="async"
        onError={() => setOk(false)}
      />
    );
  }

  // load playlist
  useEffect(() => {
    (async () => {
      try {
        const p = await playlists.read(id);
        setPlaylist(p);
        setEdit({
          name: p.name,
          description: p.description ?? "",
          isPublic: !!p.isPublic,
        });
      } catch (e) {
        setError(e.message || "Failed to load playlist");
      }
    })();
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    try {
      const updated = await playlists.update(id, edit);
      setPlaylist(updated);
      setShowSettings(false); // close settings after successful save
    } catch (e) {
      setError(e.message || "Failed to save");
    }
  }

  async function handleDelete() {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Delete this playlist?")) return;
    try {
      await playlists.remove(id);
      navigate("/playlists");
    } catch (e) {
      setError(e.message || "Failed to delete");
    }
  }

  async function addSong(songId) {
    try {
      const updated = await playlists.addSong(id, songId);
      setPlaylist(updated);
    } catch (e) {
      setError(e.message || "Failed to add song");
    }
  }

  async function removeSong(songId) {
    try {
      const updated = await playlists.removeSong(id, songId);
      setPlaylist(updated);
    } catch (e) {
      setError(e.message || "Failed to remove song");
    }
  }

  // duration helper (supports seconds or "m:ss")
  function formatDuration(d) {
    if (d == null) return "—";
    if (typeof d === "string") return d;
    if (typeof d === "number" && !Number.isNaN(d)) {
      const m = Math.floor(d / 60);
      const s = d % 60;
      return `${m}:${String(s).padStart(2, "0")}`;
    }
    return "—";
  }

  const hasSongs = useMemo(() => (playlist?.songs?.length ?? 0) > 0, [playlist]);

  if (!playlist) return <main className="container"><p>Loading…</p></main>;

  return (
    <main className="container">
      {/* Title */}
      <h1 className="playlist-title">{playlist.name}</h1>
      {playlist.description && (
        <p style={{ opacity: 0.9, marginTop: 0, textAlign: "center" }}>
          {playlist.description}
        </p>
      )}
      {error && <p style={{ color: "crimson", textAlign: "center" }}>{error}</p>}

      {/* Top toolbar: Edit playlist (also enables remove chips), Add songs */}
      <div className="playlist-toolbar">
        <button
          className="edit-btn"
          type="button"
          onClick={() => setShowSettings(v => !v)}
          aria-expanded={showSettings}
          aria-controls="playlist-settings"
        >
          {showSettings ? "Done" : "Edit Playlist"}
        </button>

        <button className="btn" type="button" onClick={() => setShowAdd(true)}>
          <strong>+ Add Songs</strong>
        </button>
      </div>

      {/* Settings (hidden by default) */}
      {showSettings && (
        <form
          id="playlist-settings"
          onSubmit={handleSave}
          className="playlist-settings"
        >
          <h2 style={{ marginTop: 0 }}>Playlist Settings</h2>

          <div className="settings-grid">
            <label>
              Name
              <input
                type="text"
                value={edit.name}
                onChange={e => setEdit({ ...edit, name: e.target.value })}
                required
                placeholder="Playlist name"
              />
            </label>

            <label>
              Description
              <input
                type="text"
                value={edit.description}
                onChange={e => setEdit({ ...edit, description: e.target.value })}
                placeholder="Description (optional)"
              />
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
              <input
                type="checkbox"
                checked={edit.isPublic}
                onChange={e => setEdit({ ...edit, isPublic: e.target.checked })}
              />
              Public
            </label>
          </div>

          <div style={{ display: "flex", gap: ".5rem", marginTop: ".9rem" }}>
            <button className="btn" type="submit">Save Changes</button>
            <button className="btn btn-outline" type="button" onClick={() => setShowSettings(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" type="button" onClick={handleDelete}>
              Delete Playlist
            </button>
          </div>
        </form>
      )}

      {/* Track list */}
      <section className="card">
        <div className="tracklist-header">
          <div className="col col-title">Title</div>
          <div className="col col-artist">Artist</div>
          <div className="col col-album">Album</div>
          <div className="col col-duration">⏱</div>
          <div className="col col-actions"></div>
        </div>

        {hasSongs ? (
          <ul className="tracklist">
            {playlist.songs.map((s) => (
              <li key={s._id} className="track-row">
                <div className="col col-title">
                  <div className="title-wrap">
                    <Cover url={s.coverUrl} title={s.title} />
                    <div className="title-text">
                      <strong>{s.title}</strong>
                      {s.year ? <span className="muted"> · {s.year}</span> : null}
                    </div>
                  </div>
                </div>
                <div className="col col-artist">{s.artist || "—"}</div>
                <div className="col col-album">{s.album || "—"}</div>
                <div className="col col-duration">{formatDuration(s.duration)}</div>
                <div className="col col-actions">
                  {showSettings && (
                    <button
                      type="button"
                      className="chip-x"
                      onClick={() => removeSong(s._id)}
                      aria-label={`Remove ${s.title}`}
                      title="Remove from playlist"
                    >
                      ×
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ padding: ".75rem 0" }}>
            <p>No songs in this playlist yet.</p>
            <button className="btn" onClick={() => setShowAdd(true)}>Add songs</button>
          </div>
        )}
      </section>

      {/* Add-song with autocomplete */}
      {showAdd && (
        <div className="fab-form-overlay" role="dialog" aria-modal="true" aria-label="Add songs to playlist">
          <div className="fab-form card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".75rem" }}>
              <h2 style={{ margin: 0 }}>Add from Catalogue</h2>
              <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Close</button>
            </div>

            <SongAutocomplete
              placeholder="Search title, artist, album…"
              excludeIds={(playlist.songs || []).map(s => s._id)}
              onSelect={async (song) => {
                try {
                  const updated = await playlists.addSong(id, song._id);
                  setPlaylist(updated);
                } catch (e) {
                  setError(e.message || "Failed to add song");
                }
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
