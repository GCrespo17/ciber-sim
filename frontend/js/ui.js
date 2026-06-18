const $ = (id) => document.getElementById(id);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const shell = $('portal-shell');
const rail = shell.querySelector('.portal-rail');
const topbar = shell.querySelector('.portal-topbar');
const navButtons = $$('.rail-nav button');
const views = $$('#student-panel .view');
const subtitle = $('dashboard-subtitle');

const screens = {
  login: $('login-screen'),
  student: $('student-panel'),
  teacher: $('teacher-panel'),
};

const viewSubtitles = {
  home: 'Resumen académico del periodo actual.',
  courses: 'Cursos y secciones inscritas en el periodo.',
  grades: 'Calificaciones publicadas por curso y sección.',
  profile: 'Datos personales y de cuenta.',
};

function hideAll() {
  for (const el of Object.values(screens)) {
    el.hidden = true;
  }
}

function hideAllViews() {
  for (const view of views) {
    view.hidden = true;
  }
}

function formatRole(role) {
  if (role === 'student') return 'Estudiante';
  if (role === 'teacher') return 'Profesor';
  return role;
}

export function showView(name) {
  hideAllViews();
  const target = views.find((v) => v.dataset.view === name);
  if (target) {
    target.hidden = false;
  }
  for (const btn of navButtons) {
    btn.removeAttribute('aria-current');
    if (btn.dataset.target === name) {
      btn.setAttribute('aria-current', 'page');
    }
  }
  if (subtitle && viewSubtitles[name]) {
    subtitle.textContent = viewSubtitles[name];
  }
}

export function showLogin() {
  hideAll();
  shell.classList.add('logged-out');
  rail.hidden = true;
  topbar.hidden = true;
  screens.login.hidden = false;
}

export function showPanel(user) {
  hideAll();
  shell.classList.remove('logged-out');
  rail.hidden = false;
  topbar.hidden = false;
  if (user.role === 'student') {
    $('student-name').textContent = user.name;
    $('student-id').textContent = user.id;
    $('student-name-display').textContent = user.name;
    $('student-role').textContent = formatRole(user.role);
    screens.student.hidden = false;
    showView('home');
  } else if (user.role === 'teacher') {
    rail.hidden = true;
    $('teacher-name').textContent = user.name;
    screens.teacher.hidden = false;
  }
}

export function renderGrades(gradesList) {
  const table = document.querySelector('[data-view="grades"] .grades-table');
  if (!table) return;

  const existing = table.querySelectorAll('[role="row"]:not(.grades-table__head)');
  existing.forEach((r) => r.remove());

  if (gradesList.length === 0) return;

  for (const g of gradesList) {
    const row = document.createElement('div');
    row.setAttribute('role', 'row');
    row.innerHTML = `
      <span role="cell">${g.course} (${g.code})</span>
      <span role="cell">${g.section} — ${g.semester}</span>
      <span role="cell">${g.score} / 20</span>
    `;
    table.appendChild(row);
  }
}

export function setLoginError(msg) {
  $('login-error').textContent = msg;
}

export function getFormValues() {
  return {
    email: $('email').value.trim(),
    password: $('password').value,
  };
}
