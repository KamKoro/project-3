import { useEffect, useRef, useState } from "react";
import * as songs from "../../services/songService";

export default function SongAutocomplete({
  onSelect,
  placeholder = "Search title, artist, album…",
  excludeIds = [],
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [active, setActive] = useState(0);
  const [err, setErr] = useState("");
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // fetch helper
  async function fetchSongs(term) {
    try {
      setErr("");
      setLoading(true);
      const res = await songs.getAll({ q: term || "" });
      const filtered = excludeIds.length ? res.filter(s => !excludeIds.includes(s._id)) : res;
      setOptions(filtered.slice(0, 10));
      setActive(0);
    } catch (e) {
      setErr(e.message || "Failed to load songs");
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }

  // fetch immediately when opened (even if q === "")
  useEffect(() => {
    if (open) fetchSongs(q);
  }, [open]); // eslint-disable-line

  // debounce while typing
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => fetchSongs(q), 200);
    return () => clearTimeout(t);
  }, [q, open]); // eslint-disable-line

  // close on outside click
  useEffect(() => {
    function onDoc(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function choose(idx) {
    const opt = options[idx];
    if (!opt) return;
    onSelect(opt);            // send the full song doc to parent
    setQ("");
    setOptions([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  function onKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(active); }
    else if (e.key === "Escape") { setOpen(false); }
  }

  return (
    <div className="ac-wrap" ref={wrapRef}>
      <input
        ref={inputRef}
        className="ac-input"
        placeholder={placeholder}
        value={q}
        onChange={e => { setQ(e.target.value); if (!open) setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls="song-ac-list"
      />
      {open && (
        <div className="ac-dropdown" role="listbox" id="song-ac-list">
          {loading && <div className="ac-empty">Searching…</div>}
          {err && !loading && <div className="ac-empty" style={{ color: "crimson" }}>{err}</div>}
          {!loading && !err && options.length === 0 && <div className="ac-empty">No matches</div>}
          {!loading && !err && options.map((s, idx) => (
            <div
              key={s._id}
              role="option"
              aria-selected={idx === active}
              className={`ac-option ${idx === active ? "is-active" : ""}`}
              onMouseEnter={() => setActive(idx)}
              onMouseDown={(e) => { e.preventDefault(); choose(idx); }}
              title={`${s.title} — ${s.artist}${s.album ? ` · ${s.album}` : ""}`}
            >
              <div className="ac-line">
                <strong className="ac-title">{s.title}</strong>
                <span className="ac-artist"> — {s.artist || "Unknown"}</span>
              </div>
              <div className="ac-meta">{s.album || "Single"}{s.year ? ` · ${s.year}` : ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
