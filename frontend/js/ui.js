const $ = (id) => document.getElementById(id);

const screens = {
  login: $('login-screen'),
  student: $('student-panel'),
  teacher: $('teacher-panel'),
};

function hideAll() {
  for (const el of Object.values(screens)) {
    el.hidden = true;
  }
}

export function showLogin() {
  hideAll();
  screens.login.hidden = false;
}

export function showPanel(user) {
  hideAll();
  if (user.role === 'student') {
    $('student-name').textContent = user.name;
    screens.student.hidden = false;
  } else if (user.role === 'teacher') {
    $('teacher-name').textContent = user.name;
    screens.teacher.hidden = false;
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
