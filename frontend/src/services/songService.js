const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

export async function getAll({ mine = false, q = "" } = {}) {
  const params = new URLSearchParams();
  if (mine) params.set('mine', 'true');
  if (q) params.set('q', q);
  const res = await fetch(`${BASE_URL}/songs?${params.toString()}`, {
    headers: tokenHeader()
  });
  return handle(res);
}

export async function create(payload) {
  const res = await fetch(`${BASE_URL}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...tokenHeader() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function update(id, payload) {
  const res = await fetch(`${BASE_URL}/songs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...tokenHeader() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function remove(id) {
  const res = await fetch(`${BASE_URL}/songs/${id}`, {
    method: 'DELETE',
    headers: tokenHeader(),
  });
  return handle(res, true);
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
async function safe(res) { try { return await res.json(); } catch { return null; } }
