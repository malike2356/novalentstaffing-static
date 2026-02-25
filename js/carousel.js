/**
 * Novalent Staffing - Carousel
 * Lightweight carousel with prev/next, dots, and auto-advance
 */
(function () {
  'use strict';

  var AUTOPLAY_MS = 5000;

  function initCarousel(el) {
    var slides = el.querySelectorAll('.carousel-slide');
    var dots = el.querySelectorAll('.carousel-dot');
    var prevBtn = el.querySelector('.carousel-prev');
    var nextBtn = el.querySelector('.carousel-next');
    var current = 0;
    var autoplayId;

    if (!slides || slides.length === 0) return;

    function show(i) {
      current = (i + slides.length) % slides.length;
      for (var j = 0; j < slides.length; j++) {
        slides[j].classList.toggle('active', j === current);
      }
      if (dots) {
        for (var k = 0; k < dots.length; k++) {
          dots[k].classList.toggle('active', k === current);
        }
      }
    }

    function next() {
      show(current + 1);
      resetAutoplay();
    }

    function prev() {
      show(current - 1);
      resetAutoplay();
    }

    function resetAutoplay() {
      clearInterval(autoplayId);
      autoplayId = setInterval(next, AUTOPLAY_MS);
    }

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (dots) {
      for (var d = 0; d < dots.length; d++) {
        (function (idx) {
          dots[idx].addEventListener('click', function () {
            show(idx);
            resetAutoplay();
          });
        })(d);
      }
    }

    show(0);
    autoplayId = setInterval(next, AUTOPLAY_MS);

    el.addEventListener('mouseenter', function () {
      clearInterval(autoplayId);
    });
    el.addEventListener('mouseleave', function () {
      autoplayId = setInterval(next, AUTOPLAY_MS);
    });
  }

  function init() {
    var carousels = document.querySelectorAll('.carousel[data-carousel]');
    for (var i = 0; i < carousels.length; i++) {
      initCarousel(carousels[i]);
    }
  }

  function runInit() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
  runInit();
})();
