const themeBtn = document.getElementById('theme-toggle');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
  if (themeBtn) themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

setTheme(localStorage.getItem('fw-theme') || 'light');

if (themeBtn) {
  themeBtn.onclick = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('fw-theme', next);
    setTheme(next);
  };
}
