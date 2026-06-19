import {
  login, getProfile, getGrades, logout as apiLogout,
  getSections, getSectionStudents, createGrade,
} from './api.js';
import {
  showLogin, showPanel, showView, setLoginError, getFormValues, renderGrades,
  renderSections, renderSectionDetail, showGradeForm,
} from './ui.js';

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  setLoginError('');

  const { email, password } = getFormValues();

  try {
    const user = await login(email, password);
    if (user.role === 'student') {
      const profile = await getProfile(user.id);
      const gradesList = await getGrades(user.id);
      showPanel(profile);
      renderGrades(gradesList);
    } else if (user.role === 'teacher') {
      showPanel(user);
      const sections = await getSections();
      renderSections(sections);
    }
  } catch (err) {
    showLogin();
    setLoginError(err.message);
  }
});

document.querySelectorAll('.rail-nav button').forEach((btn) => {
  btn.addEventListener('click', () => {
    showView(btn.dataset.target);
  });
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await apiLogout();
  showLogin();
});

document.getElementById('logout-btn-teacher').addEventListener('click', async () => {
  await apiLogout();
  showLogin();
});

document.getElementById('toggle-password').addEventListener('click', () => {
  const input = document.getElementById('password');
  const eyeOn = document.getElementById('eye-icon');
  const eyeOff = document.getElementById('eye-off-icon');
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  eyeOn.hidden = isHidden;
  eyeOff.hidden = !isHidden;
});

document.getElementById('sections-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('.section-btn');
  if (!btn) return;
  document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const data = await getSectionStudents(btn.dataset.sectionId);
  renderSectionDetail(data);
});

document.getElementById('students-table').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-add-grade');
  if (!btn) return;
  showGradeForm(Number(btn.dataset.enrollmentId), async (payload) => {
    await createGrade(payload);
    const active = document.querySelector('.section-btn.active');
    if (active) {
      const data = await getSectionStudents(active.dataset.sectionId);
      renderSectionDetail(data);
    }
    document.getElementById('grade-form-area').innerHTML = '';
    document.getElementById('grade-form-area').hidden = true;
  });
});

showLogin();
