export async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed.');
  }
  return data;
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function getProfile(userId) {
  const res = await fetch(`/api/users/${userId}/profile`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch profile.');
  }
  return data;
}
