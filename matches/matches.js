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


const matches = [
  { name:"Ananya Sharma", score:92, common:"Travel, Reading, Family Values", img:"https://i.pravatar.cc/400?img=44" },
  { name:"Simran Kaur", score:88, common:"Fitness, Music, Career Focus", img:"https://i.pravatar.cc/400?img=32" },
  { name:"Ishita Gupta", score:85, common:"Design, Travel, Home Life", img:"https://i.pravatar.cc/400?img=47" },
  { name:"Naina Bedi", score:81, common:"Culture, Food, Weekend Hikes", img:"https://i.pravatar.cc/400?img=25" },
  { name:"Rohan Verma", score:90, common:"Finance, Travel, Family Values", img:"https://i.pravatar.cc/400?img=51" },
  { name:"Kabir Malhotra", score:78, common:"Startups, Fitness, Movies", img:"https://i.pravatar.cc/400?img=14" }
];

function matchCard(m){
  return `<div class="match-card glass-card card-lift fade-in">
    <div class="zoom-wrap"><img src="${m.img}" alt="Match photo of ${m.name}"><span class="match-score">${m.score}% Match</span></div>
    <div class="match-body">
      <h4>${m.name}</h4>
      <p class="interests">Common: ${m.common}</p>
      <a href="../profile-details/details.html" class="btn btn-primary btn-sm btn-block">Send Interest</a>
    </div>
  </div>`;
}

document.getElementById('match-list').innerHTML = matches.map(matchCard).join('');
