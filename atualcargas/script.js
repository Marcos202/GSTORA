/* ============================================================
   PITCH DECK — ATUAL CARGAS
   Slide Navigation & Animations Engine
   ============================================================ */

(function () {
  'use strict';

  // --- STATE ---
  let currentSlide = 1;
  const totalSlides = 8;
  let isTransitioning = false;
  let hudAnimationRan = false;

  // --- DOM REFS ---
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const currentSlideEl = document.getElementById('currentSlide');
  const totalSlidesEl = document.getElementById('totalSlides');
  const progressFill = document.getElementById('progressFill');
  const keyboardHint = document.getElementById('keyboardHint');

  // --- BLUEPRINT CANVAS (Slide 1) ---
  function initBlueprintCanvas() {
    const canvas = document.getElementById('blueprintCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    let angle = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function drawGrid() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(angle);

      const size = Math.max(canvas.width, canvas.height) * 1.5;
      const step = 80;
      const half = size / 2;

      ctx.strokeStyle = 'rgba(0, 188, 212, 0.07)';
      ctx.lineWidth = 0.5;

      // Grid lines
      for (let x = -half; x <= half; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, -half);
        ctx.lineTo(x, half);
        ctx.stroke();
      }
      for (let y = -half; y <= half; y += step) {
        ctx.beginPath();
        ctx.moveTo(-half, y);
        ctx.lineTo(half, y);
        ctx.stroke();
      }

      // Circles
      ctx.strokeStyle = 'rgba(0, 188, 212, 0.04)';
      for (let r = step; r < half; r += step * 2) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center crosshair
      ctx.strokeStyle = 'rgba(0, 188, 212, 0.12)';
      ctx.lineWidth = 1;
      const ch = 30;
      ctx.beginPath();
      ctx.moveTo(-ch, 0);
      ctx.lineTo(ch, 0);
      ctx.moveTo(0, -ch);
      ctx.lineTo(0, ch);
      ctx.stroke();

      ctx.restore();
      angle += 0.0003;
      animFrame = requestAnimationFrame(drawGrid);
    }

    drawGrid();
  }

  // --- SLIDE NAVIGATION ---
  function goToSlide(n) {
    if (isTransitioning || n < 1 || n > totalSlides || n === currentSlide) return;
    isTransitioning = true;

    const dir = n > currentSlide ? 1 : -1;
    const nextEl = document.getElementById(`slide-${n}`);

    // 1) Reset ALL slides: remove active class, clear ALL inline styles, hide via CSS
    slides.forEach((s) => {
      s.classList.remove('slide--active');
      s.classList.remove('slide--exit-left');
      s.style.cssText = '';  // Nuclear reset of ALL inline styles
    });

    // 2) Set the incoming slide's starting position (off-screen)
    nextEl.style.transition = 'none';
    nextEl.style.opacity = '0';
    nextEl.style.visibility = 'visible';
    nextEl.style.transform = dir > 0 ? 'translateX(60px)' : 'translateX(-60px)';

    // 3) Force browser repaint so the starting position is rendered
    void nextEl.offsetWidth;

    // 4) Now enable transition and animate to final position
    nextEl.style.transition = '';
    nextEl.classList.add('slide--active');
    nextEl.style.opacity = '';
    nextEl.style.transform = '';

    // 5) Update state
    currentSlide = n;
    updateUI();
    animateSlideContent(n);

    // 6) Unlock after transition completes
    setTimeout(() => {
      // Final cleanup: remove any leftover inline styles from the active slide
      nextEl.style.cssText = '';
      isTransitioning = false;
    }, 800);
  }

  function updateUI() {
    currentSlideEl.textContent = String(currentSlide).padStart(2, '0');
    progressFill.style.width = `${(currentSlide / totalSlides) * 100}%`;
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
    hideHint();
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
    hideHint();
  }

  function hideHint() {
    keyboardHint.classList.add('keyboard-hint--hidden');
  }

  // --- ANIMATE SLIDE CONTENT ---
  function animateSlideContent(slideNum) {
    const slide = document.getElementById(`slide-${slideNum}`);
    const items = slide.querySelectorAll('.animate-in');

    items.forEach((el) => {
      el.classList.remove('animate-in--visible');
    });

    items.forEach((el) => {
      const delay = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => {
        el.classList.add('animate-in--visible');
      }, 150 + delay);
    });

    // Special: Slide 3 HUD animation
    if (slideNum === 3 && !hudAnimationRan) {
      runHudAnimation();
      hudAnimationRan = true;
    } else if (slideNum === 3) {
      // Instantly show all steps if already animated
      const steps = slide.querySelectorAll('.hud-step');
      steps.forEach(s => s.classList.add('hud-step--active'));
      document.getElementById('hudFill').style.width = '100%';
    }
  }

  // --- HUD PROGRESS ANIMATION (Slide 3) ---
  function runHudAnimation() {
    const fill = document.getElementById('hudFill');
    const steps = document.querySelectorAll('.hud-step');
    const totalSteps = steps.length;

    let i = 0;
    function animateStep() {
      if (i >= totalSteps) return;
      const pct = ((i + 1) / totalSteps) * 100;

      fill.style.width = `${pct}%`;
      steps[i].classList.add('hud-step--active');

      i++;
      setTimeout(animateStep, 600);
    }

    setTimeout(animateStep, 800);
  }

  // --- TERRAIN ANIMATION (Slide 4) ---
  function initTerrainControls() {
    const btns = document.querySelectorAll('.terrain-btn');
    const phases = {
      1: document.getElementById('phase1'),
      2: document.getElementById('phase2'),
      3: document.getElementById('phase3'),
    };

    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const phase = parseInt(btn.dataset.phase, 10);

        // Update buttons
        btns.forEach((b) => b.classList.remove('terrain-btn--active'));
        btn.classList.add('terrain-btn--active');

        // Update phases
        Object.values(phases).forEach((p) => p.classList.add('terrain-phase--hidden'));
        phases[phase].classList.remove('terrain-phase--hidden');
      });
    });
  }

  // --- EVENT LISTENERS ---
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    }
  });

  // Touch/swipe support — direction-aware to not block iOS vertical scroll
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoved = false;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    touchMoved = false;
  }, { passive: true });

  document.addEventListener('touchmove', () => {
    touchMoved = true;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!touchMoved) return; // tap, not swipe

    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Only trigger slide change if the gesture is predominantly horizontal
    // (X displacement > 2× Y displacement) and exceeds the threshold
    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 2) {
      if (diffX > 0) nextSlide();
      else prevSlide();
    }
    // Otherwise, do nothing — let iOS handle the vertical scroll natively
  }, { passive: true });

  // Mouse wheel
  let wheelTimeout;
  document.addEventListener('wheel', (e) => {
    if (wheelTimeout) return;
    wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 800);
    if (e.deltaY > 0) nextSlide();
    else if (e.deltaY < 0) prevSlide();
  }, { passive: true });

  // --- INIT ---
  function init() {
    totalSlidesEl.textContent = String(totalSlides).padStart(2, '0');
    updateUI();
    initBlueprintCanvas();
    initTerrainControls();

    // Animate first slide
    setTimeout(() => {
      animateSlideContent(1);
    }, 300);

    // Hide hint after some time
    setTimeout(hideHint, 6000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
