/* =========================================================
   ForeverWale — app.js
   One small function for each feature. Read top to bottom.

   NOTE: There is no server, so accounts and profiles are kept
   in the browser's localStorage. This is fine for a college
   project; a real website would store them in a database.
   ========================================================= */


/* =========================================================
   1. SMALL HELPERS (used by everything below)
   ========================================================= */

// Shortcut: $('theme-toggle') instead of document.getElementById('theme-toggle')
function $(id) {
  return document.getElementById(id);
}

// Save and read data in the browser (localStorage stores text, so we convert to JSON)
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

// Show a green (success) or red (error) message box above a form
function showAlert(box, message, type) {
  box.textContent = message;
  box.classList.remove('success', 'error');
  box.classList.add(type, 'show');
}

// Show a small pop-up message at the bottom of the screen for 2.5 seconds
function toast(message) {
  const box = document.createElement('div');
  box.className = 'toast';
  box.textContent = message;
  document.body.appendChild(box);
  setTimeout(function () { box.classList.add('show'); }, 10);
  setTimeout(function () { box.remove(); }, 2600);
}


// Shrink a chosen image and return it as a small JPEG data URL (so it fits in localStorage)
function resizeImage(file, maxSide, quality) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = function () {
      const img = new Image();
      img.onerror = reject;
      img.onload = function () {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Profiles posted by the signed-in user (older profiles get an id the first time they are read)
function myProfiles() {
  const user = currentUser();
  if (!user) return [];
  let changed = false;
  const all = load('fw-profiles', []);
  all.forEach(function (p) {
    if (!p.id) { p.id = 'p' + Date.now() + Math.random().toString(36).slice(2, 7); changed = true; }
  });
  if (changed) save('fw-profiles', all);
  return all.filter(function (p) { return p.owner === user.email; });
}

// Delete one profile (only the owner can delete it)
function deleteProfile(id) {
  const user = currentUser();
  if (!user) return false;
  const all = load('fw-profiles', []);
  const left = all.filter(function (p) { return !(p.id === id && p.owner === user.email); });
  save('fw-profiles', left);
  return left.length !== all.length;
}

// Check a mobile number: optional +91, then 10 digits starting with 6-9
function cleanMobile(text) {
  return text.replace(/[\s-]/g, '').replace(/^\+91/, '');
}

function isValidMobile(text) {
  return /^[6-9]\d{9}$/.test(cleanMobile(text));
}

// Returns a list of the password rules that are NOT met yet
function passwordProblems(password) {
  const problems = [];
  if (password.length < 8) problems.push('8+ characters');
  if (!/[A-Z]/.test(password)) problems.push('a capital letter');
  if (!/[a-z]/.test(password)) problems.push('a small letter');
  if (!/[0-9]/.test(password)) problems.push('a number');
  return problems;
}


/* =========================================================
   2. THEME BUTTON (light / dark) — remembers your choice
   ========================================================= */

function initTheme() {
  const button = $('theme-toggle');
  if (!button) return;

  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      button.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      button.textContent = '🌙';
    }
  }

  setTheme(localStorage.getItem('fw-theme') || 'light');   // apply saved theme on page load

  button.addEventListener('click', function () {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem('fw-theme', next);                 // remember for next visit
    setTheme(next);
  });
}


/* =========================================================
   3. NAVIGATION — hamburger menu and "active page" underline
   ========================================================= */

function initNavigation() {
  const burger = $('nav-toggle');
  const links = $('nav-links');
  if (!burger || !links) return;

  // Open / close the menu on small screens
  function setMenu(open) {
    links.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  burger.addEventListener('click', function () {
    setMenu(!links.classList.contains('is-open'));
  });

  // Close the menu after a link is tapped
  links.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });

  // Underline the link of the page we are on (matches <body data-page="...">)
  const page = document.body.getAttribute('data-page');
  const current = links.querySelector('a[data-page="' + page + '"]');
  if (current) {
    current.classList.add('active');
    current.setAttribute('aria-current', 'page');
  }
}


/* =========================================================
   4. LOGIN SYSTEM — accounts, login, logout
   ========================================================= */

// "Remember me" ticked  -> stay logged in even after closing the browser (localStorage)
// "Remember me" not ticked -> logged out when the tab closes (sessionStorage)

function getUsers() {
  return load('fw-users', []);
}

function currentUser() {
  const email = localStorage.getItem('fw-session') || sessionStorage.getItem('fw-session');
  return getUsers().find(function (user) { return user.email === email; }) || null;
}

function logIn(user, remember) {
  const place = remember ? localStorage : sessionStorage;
  place.setItem('fw-session', user.email);
}

function logOut() {
  localStorage.removeItem('fw-session');
  sessionStorage.removeItem('fw-session');
}

// Used before actions that need an account. If not logged in, send to Sign In
// and come back to this page afterwards.
function requireLogin(message) {
  if (currentUser()) return true;
  toast(message);
  sessionStorage.setItem('fw-return', location.pathname.split('/').pop() + location.search);
  setTimeout(function () { location.href = 'signin.html'; }, 1400);
  return false;
}

// Show "Sign In / Sign Up" to visitors and "Logout" to logged-in users
function initAuthLinks() {
  const loggedIn = currentUser() !== null;

  document.querySelectorAll('[data-auth="guest"]').forEach(function (item) {
    item.classList.toggle('auth-hidden', loggedIn);
  });
  document.querySelectorAll('[data-auth="user"]').forEach(function (item) {
    item.classList.toggle('auth-hidden', !loggedIn);
  });

  // Logout button: log out, then go to the Home page
  const logout = $('logout-link');
  if (logout) {
    logout.addEventListener('click', function (event) {
      event.preventDefault();
      logOut();
      location.href = 'index.html';
    });
  }
}


/* =========================================================
   5. SHOW / HIDE PASSWORD BUTTONS
   ========================================================= */

function initPasswordToggles() {
  document.querySelectorAll('.toggle-pass').forEach(function (button) {
    button.addEventListener('click', function () {
      const input = $(button.getAttribute('data-target'));
      const hidden = input.type === 'password';
      input.type = hidden ? 'text' : 'password';
      button.textContent = hidden ? 'Hide' : 'Show';
    });
  });
}


/* =========================================================
   6. SIGN UP PAGE
   ========================================================= */

function initSignUp() {
  const form = $('signup-form');
  if (!form) return;

  const box = $('signup-alert');
  const hint = $('pw-hint');

  // Live password check while typing
  $('su-password').addEventListener('input', function () {
    const problems = passwordProblems(this.value);
    if (problems.length === 0) {
      hint.textContent = 'Strong password ✓';
      hint.style.color = '#2E6B3E';
    } else {
      hint.textContent = 'Still needs: ' + problems.join(', ');
      hint.style.color = 'var(--red)';
    }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = $('su-name').value.trim();
    const email = $('su-email').value.trim().toLowerCase();
    const mobile = cleanMobile($('su-mobile').value);
    const password = $('su-password').value;
    const users = getUsers();

    // Check everything, stop at the first problem
    if (name.length < 2) return showAlert(box, 'Please enter your full name.', 'error');
    if (!isValidMobile(mobile)) return showAlert(box, 'Enter a valid 10-digit mobile number.', 'error');
    if (passwordProblems(password).length > 0) {
      return showAlert(box, 'Password needs: ' + passwordProblems(password).join(', ') + '.', 'error');
    }
    if (password !== $('su-confirm').value) return showAlert(box, 'Passwords do not match.', 'error');
    if (users.some(function (u) { return u.email === email; })) {
      return showAlert(box, 'This email is already registered. Please sign in.', 'error');
    }
    if (users.some(function (u) { return u.mobile === mobile; })) {
      return showAlert(box, 'This mobile number is already registered.', 'error');
    }

    // All good: save the new account
    users.push({ name: name, email: email, mobile: mobile, password: password });
    save('fw-users', users);

    // "Remember me" -> pre-fill the email on the Sign In page
    if ($('su-remember').checked) localStorage.setItem('fw-prefill', email);

    showAlert(box, 'Account created! Taking you to Sign In…', 'success');
    setTimeout(function () { location.href = 'signin.html'; }, 1200);
  });
}


/* =========================================================
   7. SIGN IN PAGE (+ Forgot password)
   ========================================================= */

function initSignIn() {
  const form = $('signin-form');
  if (!form) return;

  const box = $('signin-alert');

  // Pre-fill the email if "Remember me" was ticked on Sign Up
  const prefill = localStorage.getItem('fw-prefill');
  if (prefill) $('si-id').value = prefill;

  // Find the account that matches an email or a mobile number
  function findUser(text) {
    const id = text.trim().toLowerCase();
    return getUsers().find(function (u) {
      return u.email === id || u.mobile === cleanMobile(id);
    });
  }

  // Login button
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const user = findUser($('si-id').value);
    if (!user || user.password !== $('si-password').value) {
      return showAlert(box, 'Wrong email / mobile or password.', 'error');
    }

    logIn(user, $('si-remember').checked);
    showAlert(box, 'Welcome back, ' + user.name.split(' ')[0] + '! Redirecting…', 'success');

    // Go back to the page the user came from (if any), otherwise Home
    const back = sessionStorage.getItem('fw-return');
    sessionStorage.removeItem('fw-return');
    setTimeout(function () { location.href = back || 'index.html'; }, 900);
  });

  // "Forgot password?" link.
  // A real site would e-mail a reset link; here we ask for a new password directly.
  $('forgot-link').addEventListener('click', function (event) {
    event.preventDefault();

    const user = findUser($('si-id').value);
    if (!user) {
      return showAlert(box, 'Type your registered email or mobile above, then click "Forgot password?".', 'error');
    }

    const newPassword = prompt('Create a new password for ' + user.email +
      '\n(8+ characters, a capital letter, a small letter and a number)');
    if (newPassword === null) return;                      // user pressed Cancel

    const problems = passwordProblems(newPassword);
    if (problems.length > 0) {
      return showAlert(box, 'New password needs: ' + problems.join(', ') + '.', 'error');
    }

    const users = getUsers();
    users.find(function (u) { return u.email === user.email; }).password = newPassword;
    save('fw-users', users);
    showAlert(box, 'Password changed. You can now sign in.', 'success');
  });
}


/* =========================================================
   8. HOME PAGE — "Search matches" button
   ========================================================= */

// Sends the chosen options to the Find Matches page through the web address
function initHomeSearch() {
  const button = $('home-search');
  if (!button) return;

  button.addEventListener('click', function () {
    let community = $('community').value.trim();
    if (community.toLowerCase() === 'any') community = '';

    const params = new URLSearchParams({
      gender: $('looking-for').value,
      age: $('age').value,
      caste: community,
      city: $('city').value.trim()
    });
    location.href = 'find-matches.html?' + params.toString();
  });
}


/* =========================================================
   9. FIND MATCHES PAGE — filters, View Profile, Interest
   ========================================================= */

// "5 ft 6 in" -> 66 inches. Also understands "5'6", "5.6" and "168 cm".
function toInches(text) {
  const numbers = text.match(/\d+/g) || [];
  if (numbers.length === 0) return 0;
  if (/cm/i.test(text)) return Math.round(Number(numbers[0]) / 2.54);
  return Number(numbers[0]) * 12 + Number(numbers[1] || 0);
}

function showHeight(inches) {
  if (!inches) return '—';
  return Math.floor(inches / 12) + ' ft ' + (inches % 12) + ' in';
}

// Does an age fit a range such as "27–32" or "39+"?
function ageInRange(age, range) {
  if (range === 'Any') return true;
  const limits = range.match(/\d+/g).map(Number);
  return limits.length === 1 ? age >= limits[0] : age >= limits[0] && age <= limits[1];
}

// Build a profile card on the page for a profile saved by "Post Your Details"
function makeCard(profile) {
  function add(parent, tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  const card = document.createElement('article');
  card.className = 'profile-card';
  const data = {
    name: profile.name, gender: profile.gender, age: profile.age, religion: profile.religion,
    caste: profile.caste, city: profile.city, job: profile.job, edu: profile.edu,
    height: profile.height, bio: profile.bio
  };
  Object.keys(data).forEach(function (key) { card.dataset[key] = data[key]; });
  card.dataset.profileId = profile.id || '';
  const me = currentUser();
  const isMine = me && profile.owner === me.email;

  const photo = add(card, 'div', 'profile-photo');
  photo.style.background = 'linear-gradient(135deg, var(--rose), var(--red))';
  const avatar = add(photo, 'div', 'avatar', profile.name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase());
  card._photo = profile.photo || '';                      // kept for the View Profile pop-up
  card._photos = profile.photos || [];
  if (profile.photo) {
    photo.style.background = 'url("' + profile.photo + '") center / cover no-repeat';
    avatar.style.display = 'none';                        // the real photo replaces the initials
  }
  if (profile.age) add(photo, 'span', 'age-badge', profile.age + ' yrs');

  const body = add(card, 'div', 'profile-body');
  add(body, 'h3', '', profile.name);
  add(body, 'p', 'profile-meta', [profile.height ? showHeight(profile.height) : '', profile.job, profile.city].filter(function (x) { return x && x !== '—'; }).join(' · '));
  add(body, 'p', 'profile-bio', profile.bio);
  const actions = add(body, 'div', 'profile-actions');
  add(actions, 'button', 'btn js-view', 'View Profile').type = 'button';
  add(actions, 'button', 'btn btn-solid js-interest', 'Interest').type = 'button';
  if (isMine) {
    add(body, 'span', 'my-badge', 'Your profile');
    add(body, 'button', 'btn btn-delete js-delete', 'Delete my profile').type = 'button';
  }
  return card;
}

function initFindMatches() {
  const grid = $('profile-grid');
  if (!grid) return;

  const form = $('filters-form');

  // 9a. Add profiles that people posted on "Post Your Details"
  myProfiles();                                          // makes sure older profiles have ids
  load('fw-profiles', []).forEach(function (profile) {
    if (profile.name) grid.appendChild(makeCard(profile));
  });

  // 9b. Filtering ---------------------------------------------
  function applyFilters() {
    const search = $('fm-search').value.trim().toLowerCase();
    const wanted = {
      age: $('f-age').value,
      gender: $('f-gender').value,
      religion: $('f-religion').value,
      caste: $('f-caste').value.trim().toLowerCase(),
      city: $('f-city').value.trim().toLowerCase(),
      job: $('f-occupation').value.trim().toLowerCase(),
      edu: $('f-education').value.trim().toLowerCase(),
      height: toInches($('f-height').value)
    };

    const cards = grid.querySelectorAll('.profile-card');
    let shown = 0;

    cards.forEach(function (card) {
      const d = card.dataset;
      const everything = Object.values(d).join(' ').toLowerCase();   // all card info as one text

      const matches =
        everything.includes(search) &&
        ageInRange(Number(d.age), wanted.age) &&
        (wanted.gender === 'Any' || d.gender === wanted.gender) &&
        (wanted.religion === 'Any' || d.religion === wanted.religion) &&
        d.caste.toLowerCase().includes(wanted.caste) &&
        d.city.toLowerCase().includes(wanted.city) &&
        d.job.toLowerCase().includes(wanted.job) &&
        d.edu.toLowerCase().includes(wanted.edu) &&
        Number(d.height) >= wanted.height;

      card.style.display = matches ? '' : 'none';
      if (matches) shown++;
    });

    $('result-count').textContent = 'Showing ' + shown + ' of ' + cards.length + ' profiles';
    $('no-results').style.display = shown === 0 ? 'block' : 'none';
  }

  // Filter as the user types / picks, and also when "Search matches" is clicked
  form.addEventListener('input', applyFilters);
  form.addEventListener('change', applyFilters);
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    applyFilters();
    $('result-count').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // "Clear filters" button
  $('clear-filters').addEventListener('click', function () {
    form.reset();
    applyFilters();
  });

  // Fill the filters from the Home page search (web address like ?gender=Bride&city=Delhi)
  const fromHome = new URLSearchParams(location.search);
  if (fromHome.get('gender')) $('f-gender').value = fromHome.get('gender');
  if (fromHome.get('age')) $('f-age').value = fromHome.get('age');
  if (fromHome.get('caste')) $('f-caste').value = fromHome.get('caste');
  if (fromHome.get('city')) $('f-city').value = fromHome.get('city');

  // 9c. Interest buttons --------------------------------------
  // Each user's sent interests are saved under their own email.
  function interestKey() {
    return 'fw-interests-' + currentUser().email;
  }

  // Make every Interest button show the right text ("Interest" or "Interest sent ✓")
  function paintInterestButtons() {
    const sent = currentUser() ? load(interestKey(), []) : [];

    grid.querySelectorAll('.profile-card').forEach(function (card) {
      const button = card.querySelector('.js-interest');
      const isSent = sent.includes(card.dataset.name);
      button.textContent = isSent ? 'Interest sent ✓' : 'Interest';
      button.classList.toggle('btn-solid', !isSent);
    });

    if (openCard) {
      $('pm-interest').textContent = sent.includes(openCard.dataset.name) ? 'Withdraw interest' : 'Send interest';
    }
  }

  // Click once to send, click again to withdraw
  function toggleInterest(card) {
    if (!requireLogin('Please sign in to send an interest.')) return;

    const name = card.dataset.name;
    let sent = load(interestKey(), []);

    if (sent.includes(name)) {
      sent = sent.filter(function (n) { return n !== name; });
      toast('Interest withdrawn.');
    } else {
      sent.push(name);
      toast('Interest sent to ' + name + '!');
    }
    save(interestKey(), sent);
    paintInterestButtons();
  }

  // 9c-2. Delete my own profile
  grid.addEventListener('click', function (event) {
    const button = event.target.closest('.js-delete');
    if (!button) return;
    event.stopPropagation();
    if (!confirm('Delete your profile? This cannot be undone.')) return;
    const card = button.closest('.profile-card');
    if (deleteProfile(card.dataset.profileId)) {
      card.remove();
      toast('Your profile was deleted.');
      form.dispatchEvent(new Event('change'));            // refresh the "Showing X of Y" count
    }
  });

  // 9d. View Profile pop-up -----------------------------------
  const modal = $('profile-modal');
  let openCard = null;                                   // the card shown in the pop-up

  function openProfile(card) {
    const d = card.dataset;
    openCard = card;

    const pmAvatar = $('pm-avatar');
    pmAvatar.textContent = card.querySelector('.avatar').textContent;
    pmAvatar.style.backgroundImage = '';
    if (card._photo) {
      pmAvatar.textContent = '';
      pmAvatar.style.backgroundImage = 'url("' + card._photo + '")';
      pmAvatar.classList.add('has-photo');
    } else {
      pmAvatar.classList.remove('has-photo');
    }

    // Extra photos (if any) shown as small thumbnails under the name
    let gallery = $('pm-gallery');
    if (!gallery) {
      gallery = document.createElement('div');
      gallery.id = 'pm-gallery';
      gallery.className = 'pm-gallery';
      $('pm-meta').insertAdjacentElement('afterend', gallery);
    }
    gallery.innerHTML = '';
    (card._photos || []).forEach(function (src) {
      const thumb = document.createElement('img');
      thumb.src = src;
      thumb.alt = d.name + ' photo';
      gallery.appendChild(thumb);
    });

    $('pm-name').textContent = d.name;
    $('pm-meta').textContent = [d.age ? d.age + ' years' : '', d.city !== '—' ? d.city : ''].filter(Boolean).join(' · ');
    $('pm-bio').textContent = d.bio || card.querySelector('.profile-bio').textContent;

    const rows = [
      ['Height', showHeight(Number(d.height))],
      ['Profession', d.job],
      ['Education', d.edu],
      ['Religion', d.religion],
      ['Community', d.caste],
      ['City', d.city]
    ];
    const list = $('pm-details');
    list.innerHTML = '';
    rows.forEach(function (row) {
      const term = document.createElement('dt');
      const value = document.createElement('dd');
      term.textContent = row[0];
      value.textContent = row[1];
      list.appendChild(term);
      list.appendChild(value);
    });

    modal.hidden = false;
    paintInterestButtons();
    $('pm-close').focus();
  }

  function closeProfile() {
    modal.hidden = true;
    openCard = null;
  }

  // 9e. One click listener for all cards (works for posted profiles too)
  grid.addEventListener('click', function (event) {
    const card = event.target.closest('.profile-card');
    if (!card) return;
    if (event.target.closest('.js-view')) openProfile(card);
    if (event.target.closest('.js-interest')) toggleInterest(card);
  });

  $('pm-interest').addEventListener('click', function () { toggleInterest(openCard); });
  $('pm-close').addEventListener('click', closeProfile);
  modal.addEventListener('click', function (event) {
    if (event.target === modal) closeProfile();           // click on the dark area
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) closeProfile();
  });

  applyFilters();
  paintInterestButtons();
}


/* =========================================================
   10. POST YOUR DETAILS PAGE
   ========================================================= */

function initPostDetails() {
  const form = $('details-form');
  if (!form) return;

  const box = $('details-alert');

  // 10a. Age is worked out from the date of birth
  $('pd-dob').addEventListener('change', function () {
    const born = new Date(this.value);
    if (isNaN(born)) return;
    const today = new Date();
    let age = today.getFullYear() - born.getFullYear();
    const birthdayPassed = today.getMonth() > born.getMonth() ||
      (today.getMonth() === born.getMonth() && today.getDate() >= born.getDate());
    if (!birthdayPassed) age--;
    $('pd-age').value = age;
  });

  // 10b. Photo upload boxes show the chosen file names (max 5 MB each)
  function watchUpload(inputId, maxFiles) {
    const input = $(inputId);
    const label = document.querySelector('label.upload-box[for="' + inputId + '"]');
    const originalText = label.innerHTML;
    label.dataset.original = originalText;                 // remembered so Reset can restore it

    input.addEventListener('change', function () {
      const files = Array.from(input.files);

      const tooMany = files.length > maxFiles;
      const tooBig = files.some(function (f) { return f.size > 5 * 1024 * 1024; });
      const notImage = files.some(function (f) { return !f.type.startsWith('image/'); });

      if (tooMany || tooBig || notImage) {
        input.value = '';
        label.innerHTML = originalText;
        toast(tooMany ? 'Please choose up to ' + maxFiles + ' image(s).' : 'Only images up to 5 MB are allowed.');
        return;
      }
      if (files.length > 0) {
        label.textContent = '✓ ' + files.map(function (f) { return f.name; }).join(', ');

        // Show a small preview of each chosen photo
        const previews = document.createElement('div');
        previews.className = 'upload-previews';
        label.appendChild(previews);
        files.forEach(function (file) {
          resizeImage(file, 200, 0.7).then(function (src) {
            const thumb = document.createElement('img');
            thumb.src = src;
            thumb.alt = 'Selected photo preview';
            previews.appendChild(thumb);
          }).catch(function () {});
        });
      }
    });
  }
  watchUpload('pd-photo', 1);
  watchUpload('pd-photos', 5);

  // 10c. Reset button: also clears the message and the file names
  form.addEventListener('reset', function () {
    box.classList.remove('show');
    form.querySelectorAll('label.upload-box').forEach(function (label) {
      label.innerHTML = label.dataset.original;
    });
  });


  // 10e. "Your posted profiles" list with a Delete button
  const mine = $('my-profiles');
  function showMyProfiles() {
    if (!mine) return;
    const list = myProfiles();
    mine.style.display = list.length ? 'block' : 'none';
    const rows = $('my-profiles-list');
    rows.innerHTML = '';
    list.forEach(function (p) {
      const row = document.createElement('div');
      row.className = 'my-profile-row';
      const info = document.createElement('div');
      info.className = 'my-profile-info';
      if (p.photo) {
        const pic = document.createElement('img');
        pic.src = p.photo;
        pic.alt = p.name;
        pic.className = 'my-profile-pic';
        info.appendChild(pic);
      }
      const strong = document.createElement('strong');
      strong.textContent = p.name;
      const small = document.createElement('span');
      small.textContent = [p.age ? p.age + ' yrs' : '', p.city && p.city !== '—' ? p.city : ''].filter(Boolean).map(function (x) { return ' · ' + x; }).join('');
      info.appendChild(strong);
      info.appendChild(small);
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn btn-delete btn-sm';
      del.textContent = 'Delete';
      del.addEventListener('click', function () {
        if (!confirm('Delete the profile "' + p.name + '"? This cannot be undone.')) return;
        deleteProfile(p.id);
        showMyProfiles();
        toast('Profile deleted.');
      });
      row.appendChild(info);
      row.appendChild(del);
      rows.appendChild(row);
    });
  }
  showMyProfiles();

  // 10d. Submit button: check, then save the profile
  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!requireLogin('Please sign in to post your details.')) return;

    // Nothing is required, but at least one thing must be filled in (dropdowns don't count)
    const filledSomething =
      Array.from(form.querySelectorAll('input:not([type="file"]), textarea')).some(function (field) {
        return field.value.trim() !== '';
      }) || $('pd-photo').files.length > 0 || $('pd-photos').files.length > 0;
    if (!filledSomething) {
      return showAlert(box, 'Please fill in at least one thing before submitting.', 'error');
    }

    // These are only checked when you actually typed something in them
    const ageText = $('pd-age').value.trim();
    const age = ageText === '' ? '' : Number(ageText);
    if ($('pd-mobile').value.trim() !== '' && !isValidMobile($('pd-mobile').value)) {
      return showAlert(box, 'Enter a valid 10-digit mobile number.', 'error');
    }
    if (age !== '' && (age < 18 || age > 90)) {
      return showAlert(box, 'Age must be between 18 and 90.', 'error');
    }

    // Read the photos (shrunk so they fit in the browser's storage)
    let photo = '';
    let photos = [];
    try {
      const main = $('pd-photo').files[0];
      if (main) photo = await resizeImage(main, 700, 0.8);
      photos = await Promise.all(Array.from($('pd-photos').files).slice(0, 5).map(function (f) {
        return resizeImage(f, 700, 0.75);
      }));
    } catch (error) {
      return showAlert(box, 'Could not read one of the photos. Please try a different image.', 'error');
    }

    // Save the profile
    const bioParts = [$('pd-hobbies').value.trim(), $('pd-interests').value.trim()].filter(Boolean);
    const profiles = load('fw-profiles', []);
    profiles.push({
      id: 'p' + Date.now() + Math.random().toString(36).slice(2, 7),
      owner: currentUser().email,
      name: $('pd-name').value.trim() || 'New Member',
      gender: { Male: 'Groom', Female: 'Bride' }[$('pd-gender').value] || 'Other',
      age: age,
      height: toInches($('pd-height').value) || 0,
      religion: $('pd-religion').value.trim() || '—',
      caste: $('pd-caste').value.trim() || '—',
      city: $('pd-city').value.trim() || '—',
      job: $('pd-occupation').value.trim() || '—',
      edu: $('pd-education').value.trim() || '—',
      bio: bioParts.length ? 'Enjoys ' + bioParts.join(', ') + '.' : 'New member of ForeverWale.',
      photo: photo,
      photos: photos
    });
    try {
      save('fw-profiles', profiles);
    } catch (error) {
      // Browser storage is full: save again without the extra photos
      profiles[profiles.length - 1].photos = [];
      try {
        save('fw-profiles', profiles);
        toast('Storage is full, so only your main photo was saved.');
      } catch (error2) {
        profiles.pop();
        return showAlert(box, 'Browser storage is full. Try smaller photos or delete an old profile.', 'error');
      }
    }

    form.reset();
    showMyProfiles();
    showAlert(box, 'Profile saved! You can now see it on the Find Matches page.', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* =========================================================
   11. CONTACT US PAGE
   ========================================================= */

function initContact() {
  const form = $('contact-form');
  if (!form) return;

  const box = $('contact-alert');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const message = $('c-message').value.trim();
    if (message.length < 10) {
      return showAlert(box, 'Please write a little more (at least 10 characters).', 'error');
    }

    // Keep the message in the browser (a real site would e-mail it or store it on a server)
    const messages = load('fw-messages', []);
    messages.push({
      name: $('c-name').value.trim(),
      email: $('c-email').value.trim(),
      subject: $('c-subject').value.trim(),
      message: message,
      date: new Date().toLocaleString()
    });
    save('fw-messages', messages);

    form.reset();
    showAlert(box, 'Thank you! We will reply within 24 hours.', 'success');
  });
}


/* =========================================================
   12. START — run every feature once the page has loaded
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  initTheme();
  initNavigation();
  initAuthLinks();
  initPasswordToggles();
  initHomeSearch();
  initSignUp();
  initSignIn();
  initFindMatches();
  initPostDetails();
  initContact();
});
