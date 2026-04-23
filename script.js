/* =============================================
   ARIFF HAKIMI — PORTFOLIO SCRIPT
   ============================================= */

'use strict';

// ─── ELEMENTS ────────────────────────────────
const wrapper     = document.getElementById('scrollWrapper');
const progressFill = document.getElementById('progressFill');
const themeToggle = document.getElementById('themeToggle');
const cursor      = document.getElementById('cursor');
const cursorDot   = document.getElementById('cursorDot');
const dots        = document.querySelectorAll('.dot');
const panels      = document.querySelectorAll('.panel');
const html        = document.documentElement;

const PANEL_COUNT = panels.length;          // 5
const PANEL_WIDTH = () => window.innerWidth;
const MAX_SCROLL  = () => PANEL_WIDTH() * (PANEL_COUNT - 1);

// ─── STATE ───────────────────────────────────
let targetX  = 0;    // where we want to be
let currentX = 0;    // where we are (interpolated)
let rafId    = null;

// ─── UTILS ───────────────────────────────────
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

function currentPanel() {
  return Math.round(currentX / PANEL_WIDTH());
}

// ─── ANIMATION LOOP ──────────────────────────
function tick() {
  // Smooth lerp toward target
  currentX = lerp(currentX, targetX, 0.085);

  // Snap when close enough to avoid jitter
  if (Math.abs(currentX - targetX) < 0.5) {
    currentX = targetX;
  }

  // Move the wrapper via transform (GPU-composited)
  wrapper.style.transform = `translateX(${-currentX}px)`;

  // Progress bar
  const pct = MAX_SCROLL() > 0 ? (currentX / MAX_SCROLL()) * 100 : 0;
  progressFill.style.width = pct.toFixed(2) + '%';

  // Active dot
  const idx = currentPanel();
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));

  // Panel visibility for animations
  panels.forEach((p, i) => {
    const panelX  = i * PANEL_WIDTH();
    const distPx  = Math.abs(currentX - panelX);
    const visible = distPx < PANEL_WIDTH() * 0.5;
    p.classList.toggle('visible', visible);
  });

  rafId = requestAnimationFrame(tick);
}

// ─── SCROLL HANDLING ─────────────────────────
let wheelAccum = 0;
let wheelTimer = null;

window.addEventListener('wheel', (e) => {
  e.preventDefault();

  // Combine both axes so trackpad pans and scroll wheels both work
  wheelAccum += e.deltaY + e.deltaX;

  targetX = clamp(targetX + e.deltaY + e.deltaX, 0, MAX_SCROLL());

  // Clear accumulator after gesture ends
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => { wheelAccum = 0; }, 200);
}, { passive: false });

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

// ─── TOUCH / SWIPE ───────────────────────────
let touchStartX = 0;
let touchStartY = 0;
let lastTouchX  = 0;
let lastTouchY  = 0;

window.addEventListener('touchstart', (e) => {
  touchStartX = lastTouchX = e.touches[0].clientX;
  touchStartY = lastTouchY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  const dx = lastTouchX - e.touches[0].clientX;
  const dy = lastTouchY - e.touches[0].clientY;
  lastTouchX = e.touches[0].clientX;
  lastTouchY = e.touches[0].clientY;

  // Treat vertical swipe as horizontal navigation too
  const delta = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
  targetX = clamp(targetX + delta, 0, MAX_SCROLL());
}, { passive: true });

// ─── KEYBOARD NAVIGATION ─────────────────────
window.addEventListener('keydown', (e) => {
  const step = PANEL_WIDTH();
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    targetX = clamp(targetX + step, 0, MAX_SCROLL());
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    targetX = clamp(targetX - step, 0, MAX_SCROLL());
  }
});

// ─── JUMP TO PANEL ───────────────────────────
function scrollToPanel(index) {
  targetX = clamp(index * PANEL_WIDTH(), 0, MAX_SCROLL());
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

// ─── HANDLE RESIZE ───────────────────────────
window.addEventListener('resize', () => {
  // Re-clamp scroll position to new window size
  targetX  = clamp(targetX, 0, MAX_SCROLL());
  currentX = clamp(currentX, 0, MAX_SCROLL());
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
// Mark first panel visible immediately
panels[0].classList.add('visible');

// Kick off both animation loops
tick();
animateCursor();
