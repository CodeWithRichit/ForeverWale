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


const profiles = [
  { name:"Ananya Sharma", age:27, prof:"Software Engineer", religion:"Hindu", city:"Chandigarh", height:"5'4\"", img:"https://i.pravatar.cc/400?img=44" },
  { name:"Rohan Verma", age:29, prof:"Chartered Accountant", religion:"Hindu", city:"Delhi", height:"5'10\"", img:"https://i.pravatar.cc/400?img=51" },
  { name:"Simran Kaur", age:26, prof:"Doctor", religion:"Sikh", city:"Ludhiana", height:"5'5\"", img:"https://i.pravatar.cc/400?img=32" },
  { name:"Kabir Malhotra", age:30, prof:"Product Manager", religion:"Hindu", city:"Mumbai", height:"5'11\"", img:"https://i.pravatar.cc/400?img=14" },
  { name:"Ishita Gupta", age:25, prof:"UX Designer", religion:"Hindu", city:"Pune", height:"5'3\"", img:"https://i.pravatar.cc/400?img=47" },
  { name:"Varun Chopra", age:28, prof:"Entrepreneur", religion:"Hindu", city:"Jaipur", height:"6'0\"", img:"https://i.pravatar.cc/400?img=15" },
  { name:"Naina Bedi", age:27, prof:"Architect", religion:"Sikh", city:"Amritsar", height:"5'6\"", img:"https://i.pravatar.cc/400?img=25" },
  { name:"Aditya Rao", age:31, prof:"Marketing Head", religion:"Hindu", city:"Bengaluru", height:"5'9\"", img:"https://i.pravatar.cc/400?img=13" }
];

function profileCard(p){
  return `<div class="profile-card glass-card card-lift fade-in">
    <div class="zoom-wrap"><img src="${p.img}" alt="Profile photo of ${p.name}"></div>
    <div class="pc-body">
      <h4>${p.name}, ${p.age}</h4>
      <p class="pc-meta">${p.prof}<br>${p.religion} &middot; ${p.city} &middot; ${p.height}</p>
      <a href="../profile-details/details.html" class="btn btn-outline btn-sm btn-block">View Profile</a>
    </div>
  </div>`;
}

function renderProfiles(containerId, list){
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = list.map(profileCard).join('');
}

renderProfiles('search-profiles', profiles);

// Simple filter by city/profession/religion (beginner-friendly demo search)
const searchForm = document.getElementById('searchForm');
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = document.getElementById('fCity').value.toLowerCase();
  const religion = document.getElementById('fReligion').value.toLowerCase();
  const profession = document.getElementById('fProfession').value.toLowerCase();

  const filtered = profiles.filter(p =>
    (city === '' || p.city.toLowerCase().includes(city)) &&
    (religion === '' || p.religion.toLowerCase().includes(religion)) &&
    (profession === '' || p.prof.toLowerCase().includes(profession))
  );
  renderProfiles('search-profiles', filtered.length ? filtered : profiles);
});
