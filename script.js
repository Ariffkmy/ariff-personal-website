/* =============================================
   ARIFF HAKIMI, PORTFOLIO SCRIPT
   ============================================= */

'use strict';

// ─── ELEMENTS ────────────────────────────────
const progressFill = document.getElementById('progressFill');
const themeToggle  = document.getElementById('themeToggle');
const panels       = document.querySelectorAll('.panel');
const html         = document.documentElement;

// ─── SCROLL PROGRESS (transform only) ────────
let ticking = false;
function updateScrollUI() {
  ticking = false;
  if (!progressFill) return;
  const maxScroll = html.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  progressFill.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio)).toFixed(4)})`;
}
function onScroll() {
  if (!ticking) { ticking = true; requestAnimationFrame(updateScrollUI); }
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);

// ─── JUMP TO PANEL ───────────────────────────
function scrollToPanel(index) {
  if (panels[index]) panels[index].scrollIntoView({ behavior: 'smooth' });
}
// Exposed globally for the onclick handlers in the HTML
window.scrollToPanel = scrollToPanel;

// ─── THEME TOGGLE ────────────────────────────
let savedTheme = 'light';
try { savedTheme = localStorage.getItem('portfolio-theme') || 'light'; } catch (e) { /* storage blocked */ }
html.setAttribute('data-theme', savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try { localStorage.setItem('portfolio-theme', next); } catch (e) { /* storage blocked */ }
  });
}

// ─── CAREER DETAIL CELL ──────────────────────
const careerData = [
  [
    'Built PowerApps for SE Asia drilling & measurement forecasting',
    'Created PowerBI dashboards for data-driven business decisions',
    'Delivered training sessions to the Digital Team & IT Onsite',
    'Provided IT support for internal business requests',
  ],
  [
    'Translated client requirements into technical specs for developers',
    'Acted as 1st-level support, resolving production issues promptly',
    'Managed databases and collaborated closely with QA & devs',
    'Led system setup and onboarding for new clients',
  ],
  [
    'Delivered full-cycle solutions aligned to business requirements',
    'Enforced best practices to improve code quality & maintainability',
    'Completed a process automation migration project in under a year',
  ],
  [
    'Translates business logic into high-functionality Mendix web apps',
    'Manages dev team & serves as primary client contact (since Apr 2025)',
    'Mentors junior developers and reviews code before UAT & Production',
    'Provides go-live support and handles urgent production fixes',
  ],
];

(function () {
  const modal      = document.getElementById('tlModal');
  const modalList  = document.getElementById('tlModalList');
  const modalTitle = document.getElementById('tlModalTitle');
  const tlItems    = document.querySelectorAll('.tl-item');
  if (!modal || !modalList) return;

  function show(item) {
    const idx   = parseInt(item.dataset.index, 10);
    const lines = careerData[idx] || [];
    modalList.replaceChildren(...lines.map((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      return li;
    }));
    if (modalTitle) {
      const role    = item.querySelector('.tl-role');
      const company = item.querySelector('.tl-company');
      const roleText = role ? role.firstChild.textContent.trim() : '';
      modalTitle.textContent = company ? `${roleText}, ${company.textContent.trim()}` : roleText;
    }
    tlItems.forEach((el) => {
      const on = el === item;
      el.setAttribute('aria-pressed', String(on));
      el.classList.toggle('tl-item--active', on);
    });
  }

  tlItems.forEach((item) => {
    item.addEventListener('mouseenter', () => show(item));
    item.addEventListener('focus', () => show(item));
    item.addEventListener('click', () => show(item));
  });
})();

// ─── INIT ────────────────────────────────────
updateScrollUI();
