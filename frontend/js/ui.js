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

export function renderSections(sections) {
  const list = document.getElementById('sections-list');
  const heading = document.getElementById('sections-heading');
  list.innerHTML = '';
  heading.textContent = `${sections.length} secciones asignadas`;
  if (sections.length === 0) {
    list.innerHTML = '<p class="muted-text">Sin secciones asignadas.</p>';
    return;
  }
  for (const s of sections) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'section-btn button-secondary';
    btn.dataset.sectionId = s.id;
    btn.innerHTML = `<strong>${s.code}</strong><span>${s.name} — ${s.semester}</span>`;
    list.appendChild(btn);
  }
}

export function renderSectionDetail({ section, students }) {
  document.getElementById('students-placeholder').hidden = true;
  const content = document.getElementById('students-content');
  content.hidden = false;
  document.getElementById('section-label').textContent = `${section.code} — ${section.name}`;
  document.getElementById('students-heading').textContent = `${students.length} estudiante(s)`;

  const table = document.getElementById('students-table');
  table.innerHTML = '';

  for (const student of students) {
    const grades = student.grades ?? [];
    const gradesHtml = grades.length
      ? grades.map(g => `<span class="grade-badge">${g.evaluation_type}: <strong>${g.score}</strong></span>`).join('')
      : '<span class="muted-text">Sin calificaciones</span>';

    const row = document.createElement('div');
    row.className = 'student-row';
    row.innerHTML = `
      <div class="student-row__name">
        <p class="card-kicker">Estudiante</p>
        <p class="student-name">${student.student_name}</p>
      </div>
      <div class="student-row__grades">${gradesHtml}</div>
      <div class="student-row__actions">
        <button type="button" class="button-secondary btn-add-grade" data-enrollment-id="${student.enrollment_id}">+ Nota</button>
      </div>
    `;
    table.appendChild(row);
  }
}

export function showGradeForm(enrollmentId, onSubmit) {
  const area = document.getElementById('grade-form-area');
  area.innerHTML = `
    <form id="grade-form" class="grade-form">
      <p class="card-kicker">Nueva calificación — Inscripción #${enrollmentId}</p>
      <input type="hidden" name="enrollment_id" value="${enrollmentId}">
      <div class="grade-form__grid">
        <label>Tipo de evaluación
          <select name="evaluation_type" required>
            <option value="">Seleccionar…</option>
            <option value="Parcial 1">Parcial 1</option>
            <option value="Parcial 2">Parcial 2</option>
            <option value="Final">Final</option>
          </select>
        </label>
        <label>Nota (0–20)
          <input type="number" name="score" min="0" max="20" step="0.1" required>
        </label>
        <label>Peso (%)
          <input type="number" name="weight" min="0" max="100" step="0.5" value="30" required>
        </label>
        <label>Periodo
          <input type="text" name="period" value="2026-1" required>
        </label>
        <label>Observación (opcional)
          <input type="text" name="observation">
        </label>
      </div>
      <div class="grade-form__actions">
        <button type="submit">Guardar nota</button>
        <button type="button" id="cancel-grade-form" class="button-secondary">Cancelar</button>
      </div>
    </form>
  `;
  area.hidden = false;

  document.getElementById('grade-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await onSubmit({
      enrollment_id: Number(fd.get('enrollment_id')),
      evaluation_type: fd.get('evaluation_type'),
      score: Number(fd.get('score')),
      weight: Number(fd.get('weight')),
      period: fd.get('period'),
      observation: fd.get('observation') || undefined,
    });
  });

  document.getElementById('cancel-grade-form').addEventListener('click', () => {
    area.innerHTML = '';
    area.hidden = true;
  });
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
