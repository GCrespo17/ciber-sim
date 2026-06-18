import { login, getProfile, logout as apiLogout } from './api.js';
import { showLogin, showPanel, showView, setLoginError, getFormValues } from './ui.js';

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  setLoginError('');

  const { email, password } = getFormValues();

  try {
    const user = await login(email, password);
    if (user.role === 'student') {
      const profile = await getProfile(user.id);
      showPanel(profile);
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

showLogin();
