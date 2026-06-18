import { login, logout as apiLogout } from './api.js';
import { showLogin, showPanel, setLoginError, getFormValues } from './ui.js';

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  setLoginError('');

  const { email, password } = getFormValues();

  try {
    const user = await login(email, password);
    showPanel(user);
  } catch (err) {
    setLoginError(err.message);
  }
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
