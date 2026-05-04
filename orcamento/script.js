(function () {
    'use strict';

    // --- STATE ---
    let currentSlide = 1;
    const totalSlides = 8;
    let isTransitioning = false;

    // --- DOM REFS ---
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentSlideEl = document.getElementById('currentSlide');
    const progressFill = document.getElementById('progressFill');
    const keyboardHint = document.getElementById('keyboardHint');

    // --- SLIDE NAVIGATION ---
    function goToSlide(n) {
        if (isTransitioning || n < 1 || n > totalSlides || n === currentSlide) return;
        isTransitioning = true;

        const dir = n > currentSlide ? 1 : -1;
        const nextEl = document.getElementById(`slide-${n}`);

        // Reset ALL slides
        slides.forEach((s) => {
            s.classList.remove('slide--active');
            s.style.cssText = '';
        });

        // Set incoming slide starting position
        nextEl.style.transition = 'none';
        nextEl.style.opacity = '0';
        nextEl.style.visibility = 'visible';
        nextEl.style.transform = dir > 0 ? 'translateX(60px)' : 'translateX(-60px)';

        // Force repaint
        void nextEl.offsetWidth;

        // Animate
        nextEl.style.transition = '';
        nextEl.classList.add('slide--active');
        nextEl.style.opacity = '';
        nextEl.style.transform = '';

        currentSlide = n;
        updateUI();
        animateSlideContent(n);

        // Unlock
        setTimeout(() => {
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
        if (keyboardHint) {
            keyboardHint.classList.add('keyboard-hint--hidden');
        }
    }

    // --- ANIMATE CONTENT ---
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
    }

    // --- EVENT LISTENERS ---
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        }
    });

    // Touch support
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
        if (!touchMoved) return;

        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 2) {
            if (diffX > 0) nextSlide();
            else prevSlide();
        }
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
        updateUI();

        setTimeout(() => {
            animateSlideContent(1);
        }, 300);

        setTimeout(hideHint, 6000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
