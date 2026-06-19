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

export async function getGrades(userId) {
  const res = await fetch(`/api/users/${userId}/grades`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch grades.');
  }
  return data;
}

export async function getSections() {
  const res = await fetch('/api/sections');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch sections.');
  return data;
}

export async function getSectionStudents(sectionId) {
  const res = await fetch(`/api/sections/${sectionId}/students`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch students.');
  return data;
}

export async function createGrade(payload) {
  const res = await fetch('/api/grades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create grade.');
  return data;
}

export async function updateGrade(gradeId, payload) {
  const res = await fetch(`/api/grades/${gradeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update grade.');
  return data;
}
