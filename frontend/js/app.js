import { login, getProfile, getGrades, logout as apiLogout } from './api.js';
import { showLogin, showPanel, showView, setLoginError, getFormValues, renderGrades } from './ui.js';

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
    } else {
      showPanel(user);
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

showLogin();
