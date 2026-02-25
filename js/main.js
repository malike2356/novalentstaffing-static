/**
 * Novalent Staffing - Main JavaScript
 * Handles navigation, mobile menu, and header scroll behaviour
 */
(function() {
  'use strict';

  const header = document.getElementById('header');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');

  // Header scroll effect
  function onScroll() {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }

  // Mobile menu toggle
  function toggleMenu() {
    navLinks?.classList.toggle('active');
    navToggle?.setAttribute('aria-expanded', navLinks?.classList.contains('active'));
    document.body.style.overflow = navLinks?.classList.contains('active') ? 'hidden' : '';
  }

  // Close menu when clicking a link (mobile)
  function closeMenu() {
    navLinks?.classList.remove('active');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Event listeners
  window.addEventListener('scroll', onScroll, { passive: true });
  navToggle?.addEventListener('click', toggleMenu);

  navLinks?.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) closeMenu();
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMenu();
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (navLinks?.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !navToggle?.contains(e.target)) {
      closeMenu();
    }
  });

  // Initial scroll state
  onScroll();
})();
