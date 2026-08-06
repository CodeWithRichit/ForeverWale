/* ===== ForeverWale shared script: theme, navbar, scroll-to-top ===== */

// Loading screen
window.addEventListener('load', () => {
  const loader = document.querySelector('.loader');
  if (loader) setTimeout(() => loader.classList.add('hide'), 400);
});

// Dark mode: load saved theme on page start
const savedTheme = localStorage.getItem('fw-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// Dark mode toggle button
const themeBtn = document.querySelector('.theme-toggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fw-theme', next);
  });
}

// Mobile hamburger menu
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
}

// Navbar shadow + scroll-to-top button on scroll
const navbar = document.querySelector('.navbar');
const scrollTopBtn = document.querySelector('.scroll-top');
window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  if (scrollTopBtn) scrollTopBtn.classList.toggle('show', window.scrollY > 400);
});
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}


// Basic login form validation + success message
const loginForm = document.getElementById('loginForm');
const formMsg = document.getElementById('formMsg');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (loginForm.checkValidity()) {
    formMsg.classList.add('show');
    setTimeout(() => loginForm.reset(), 1200);
  }
});
