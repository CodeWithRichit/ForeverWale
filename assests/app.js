/* =========================================================
   ForeverWale — shared app.js
   Theme toggle, navigation, and lightweight auth simulation
   shared by the homepage and every new page.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Theme toggle (same behaviour as original homepage) ---------- */
  function initTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    function applyTheme(theme) {
      if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        toggle.textContent = '☀️';
      } else {
        root.removeAttribute('data-theme');
        toggle.textContent = '🌙';
      }
    }

    applyTheme(localStorage.getItem('fw-theme') || 'light');

    toggle.addEventListener('click', function () {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      localStorage.setItem('fw-theme', next);
      applyTheme(next);
    });
  }

  /* ---------- Mobile hamburger menu ---------- */
  function initNavToggle() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      const isOpen = links.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Active page indicator ---------- */
  function initActiveLink() {
    const links = document.querySelectorAll('.nav-links a[data-page]');
    let current = (document.body.getAttribute('data-page') || '').trim();
    links.forEach(function (a) {
      if (a.getAttribute('data-page') === current) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ---------- Auth simulation (demo only, stored in localStorage) ---------- */
  const AUTH_KEY = 'fw-auth';

  const FWAuth = {
    isLoggedIn: function () {
      return localStorage.getItem(AUTH_KEY) === 'true';
    },
    login: function () {
      localStorage.setItem(AUTH_KEY, 'true');
    },
    logout: function () {
      localStorage.removeItem(AUTH_KEY);
    }
  };

  function initAuthUI() {
    const loggedIn = FWAuth.isLoggedIn();
    document.querySelectorAll('[data-auth="guest"]').forEach(function (el) {
      el.classList.toggle('auth-hidden', loggedIn);
    });
    document.querySelectorAll('[data-auth="user"]').forEach(function (el) {
      el.classList.toggle('auth-hidden', !loggedIn);
    });

    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
      logoutLink.addEventListener('click', function (e) {
        e.preventDefault();
        FWAuth.logout();
        window.location.href = 'index.html';
      });
    }
  }

  /* ---------- Password show/hide toggles ---------- */
  function initPasswordToggles() {
    document.querySelectorAll('.toggle-pass').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.textContent = isPassword ? 'Hide' : 'Show';
      });
    });
  }

  /* ---------- Alert helper ---------- */
  function showAlert(alertEl, message, type) {
    if (!alertEl) return;
    alertEl.textContent = message;
    alertEl.classList.remove('success', 'error');
    alertEl.classList.add(type, 'show');
  }

  /* ---------- Sign Up form ---------- */
  function initSignUpForm() {
    const form = document.getElementById('signup-form');
    if (!form) return;
    const alertEl = document.getElementById('signup-alert');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const password = document.getElementById('su-password').value;
      const confirm = document.getElementById('su-confirm').value;

      if (password.length < 8) {
        showAlert(alertEl, 'Password must be at least 8 characters long.', 'error');
        return;
      }
      if (password !== confirm) {
        showAlert(alertEl, 'Passwords do not match. Please re-enter.', 'error');
        return;
      }

      showAlert(alertEl, 'Account created successfully! Redirecting you to sign in…', 'success');
      form.reset();
      setTimeout(function () {
        window.location.href = 'signin.html';
      }, 1400);
    });
  }

  /* ---------- Sign In form ---------- */
  function initSignInForm() {
    const form = document.getElementById('signin-form');
    if (!form) return;
    const alertEl = document.getElementById('signin-alert');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showAlert(alertEl, 'Signed in successfully! Redirecting you home…', 'success');
      FWAuth.login();
      setTimeout(function () {
        window.location.href = 'index.html';
      }, 1000);
    });
  }

  /* ---------- Post Your Details form ---------- */
  function initDetailsForm() {
    const form = document.getElementById('details-form');
    if (!form) return;
    const alertEl = document.getElementById('details-alert');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showAlert(alertEl, 'Your profile has been submitted for review. Our team will verify it shortly.', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const resetBtn = document.getElementById('details-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (alertEl) alertEl.classList.remove('show');
      });
    }
  }

  /* ---------- Contact form ---------- */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const alertEl = document.getElementById('contact-alert');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showAlert(alertEl, 'Thank you for reaching out — our team will get back to you within 24 hours.', 'success');
      form.reset();
    });
  }

  /* ---------- Find Matches: filters + interest buttons ---------- */
  function initFindMatches() {
    const grid = document.getElementById('profile-grid');
    if (!grid) return;

    grid.querySelectorAll('.js-interest').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.textContent = 'Interest sent ✓';
        btn.classList.add('btn-solid');
        btn.disabled = true;
      });
    });

    const filterForm = document.getElementById('filters-form');
    if (filterForm) {
      filterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNavToggle();
    initActiveLink();
    initAuthUI();
    initPasswordToggles();
    initSignUpForm();
    initSignInForm();
    initDetailsForm();
    initContactForm();
    initFindMatches();
  });
})();
