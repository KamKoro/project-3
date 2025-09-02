const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

export async function mine() {
  const res = await fetch(`${BASE_URL}/playlists`, { headers: tokenHeader() });
  return handle(res);
}

export async function create(payload) {
  const res = await fetch(`${BASE_URL}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...tokenHeader() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function read(id) {
  const res = await fetch(`${BASE_URL}/playlists/${id}`, { headers: tokenHeader() });
  return handle(res);
}

export async function update(id, payload) {
  const res = await fetch(`${BASE_URL}/playlists/${id}`, {
    method: 'PATCH', // ✅ use PATCH to match backend
    headers: { 'Content-Type': 'application/json', ...tokenHeader() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function remove(id) {
  const res = await fetch(`${BASE_URL}/playlists/${id}`, {
    method: 'DELETE',
    headers: tokenHeader(),
  });
  return handle(res, true); // ✅ returns null for 204
}

export async function addSong(id, songId) {
  const res = await fetch(`${BASE_URL}/playlists/${id}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...tokenHeader() },
    body: JSON.stringify({ songId }),
  });
  return handle(res);
}

export async function removeSong(id, songId) {
  const res = await fetch(`${BASE_URL}/playlists/${id}/songs/${songId}`, {
    method: 'DELETE',
    headers: tokenHeader(),
  });
  return handle(res);
}

// helpers
function tokenHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res, noJson = false) {
  if (!res.ok) throw new Error((await safe(res))?.message || res.statusText);
  return noJson ? null : res.json();
}

async function safe(res) {
  try { return await res.json(); }
  catch { return null; }
}
