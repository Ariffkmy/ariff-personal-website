/* =============================================
   ARIFF HAKIMI — PORTFOLIO SCRIPT
   ============================================= */

'use strict';

// ─── ELEMENTS ────────────────────────────────
const progressFill = document.getElementById('progressFill');
const themeToggle = document.getElementById('themeToggle');
const cursor      = document.getElementById('cursor');
const cursorDot   = document.getElementById('cursorDot');
const dots        = document.querySelectorAll('.dot');
const panels      = document.querySelectorAll('.panel');
const html        = document.documentElement;

// ─── UTILS ───────────────────────────────────
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ─── SCROLL PROGRESS & ACTIVE DOT ────────────
function updateScrollUI() {
  const maxScroll = html.scrollHeight - window.innerHeight;
  const pct = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  progressFill.style.width = pct.toFixed(2) + '%';

  // Active section = the one crossing the middle of the viewport
  const mid = window.innerHeight / 2;
  let idx = 0;
  panels.forEach((p, i) => {
    if (p.getBoundingClientRect().top <= mid) idx = i;
  });
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
window.addEventListener('resize', updateScrollUI);

// ─── REVEAL SECTIONS ON SCROLL ───────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

panels.forEach((p) => revealObserver.observe(p));

// ─── PROJECT CAROUSEL BUTTONS ────────────────
(function () {
  const wrap    = document.getElementById('projectsWrap');
  const scroll  = document.getElementById('projectsScroll');
  const btnPrev = document.getElementById('projectsPrev');
  const btnNext = document.getElementById('projectsNext');
  if (!wrap || !scroll || !btnPrev || !btnNext) return;

  const STEP = 300 + 19; // card width + gap

  function updateFades() {
    const { scrollLeft, scrollWidth, clientWidth } = scroll;
    wrap.classList.toggle('can-scroll-left',  scrollLeft > 1);
    wrap.classList.toggle('can-scroll-right', scrollLeft < scrollWidth - clientWidth - 1);
  }

  scroll.addEventListener('scroll', updateFades, { passive: true });
  updateFades(); // set initial state

  btnNext.addEventListener('click', () => {
    scroll.scrollBy({ left: STEP, behavior: 'smooth' });
  });

  btnPrev.addEventListener('click', () => {
    scroll.scrollBy({ left: -STEP, behavior: 'smooth' });
  });
})();

// ─── JUMP TO PANEL ───────────────────────────
function scrollToPanel(index) {
  if (panels[index]) panels[index].scrollIntoView({ behavior: 'smooth' });
}

// Expose globally for onclick handlers in HTML
window.scrollToPanel = scrollToPanel;

// ─── THEME TOGGLE ────────────────────────────
const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('portfolio-theme', next);
});

// ─── CUSTOM CURSOR ───────────────────────────
let mouseX = -100;
let mouseY = -100;
let cursorX = -100;
let cursorY = -100;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

function animateCursor() {
  cursorX = lerp(cursorX, mouseX, 0.12);
  cursorY = lerp(cursorY, mouseY, 0.12);
  cursor.style.left = cursorX + 'px';
  cursor.style.top  = cursorY + 'px';
  requestAnimationFrame(animateCursor);
}

// Hover effect on interactive elements
const hoverTargets = 'a, button, .project-card';

document.addEventListener('mouseover', (e) => {
  if (e.target.closest(hoverTargets)) {
    document.body.classList.add('cursor-hover');
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target.closest(hoverTargets)) {
    document.body.classList.remove('cursor-hover');
  }
});

// Hide cursor when mouse leaves window
document.addEventListener('mouseleave', () => {
  cursor.style.opacity    = '0';
  cursorDot.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
  cursor.style.opacity    = '1';
  cursorDot.style.opacity = '1';
});


// ─── CAREER TIMELINE MODAL ───────────────────
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
  const modal     = document.getElementById('tlModal');
  const modalList = document.getElementById('tlModalList');
  const tlItems   = document.querySelectorAll('.tl-item');
  if (!modal) return;

  tlItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const idx   = parseInt(item.dataset.index, 10);
      const lines = careerData[idx] || [];
      modalList.innerHTML = lines.map(t => `<li>${t}</li>`).join('');
      modal.classList.add('visible');
    });

    item.addEventListener('mouseleave', () => {
      modal.classList.remove('visible');
    });
  });
})();

// ─── INIT ────────────────────────────────────
panels[0].classList.add('visible');
updateScrollUI();
animateCursor();
