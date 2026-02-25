/**
 * Novalent Staffing – build nav and footer from links-config.js
 * Single source of truth; run after links-config.js, before main.js.
 */
(function() {
  'use strict';

  const L = window.NOVALENT_LINKS;
  if (!L) return;

  const path = (window.location.pathname || '').replace(/\/$/, '');
  const isForJobseekers = /for-jobseekers\.html?$/.test(path);
  const primaryCtaHref = isForJobseekers ? L.jobs : L.requestStaff;
  const primaryCtaText = isForJobseekers ? 'Browse Jobs' : 'Request Staff';

  const variant = document.body.getAttribute('data-nav-variant') || 'full';

  const navItems = variant === 'condensed'
    ? [
        { href: L.home, text: 'Home' },
        { href: L.jobs, text: 'Jobs' },
        { href: L.forJobseekers, text: 'For Job Seekers' },
        { href: L.contact, text: 'Contact' },
      ]
    : [
        { href: L.home, text: 'Home' },
        { href: L.about, text: 'About' },
        { href: L.services, text: 'Services' },
        { href: L.jobs, text: 'Jobs' },
        { href: L.forEmployers, text: 'For Employers' },
        { href: L.forJobseekers, text: 'For Job Seekers' },
        { href: L.contact, text: 'Contact' },
      ];

  const navLinksHtml = navItems.map(function(item) {
    return '<li><a href="' + item.href + '">' + item.text + '</a></li>';
  }).join('') + '<li><a href="' + primaryCtaHref + '" class="btn btn-primary">' + primaryCtaText + '</a></li>';

  const headerHtml =
    '<header class="header" id="header">' +
    '  <div class="container">' +
    '    <nav class="nav">' +
    '      <a href="' + L.home + '" class="logo">Nova<span>lent</span> Staffing</a>' +
    '      <ul class="nav-links" id="navLinks">' + navLinksHtml + '</ul>' +
    '      <button class="nav-toggle" id="navToggle" aria-label="Menu"><span></span><span></span><span></span></button>' +
    '    </nav>' +
    '  </div>' +
    '</header>';

  const footerHtml =
    '<footer class="footer">' +
    '  <div class="container">' +
    '    <div class="footer-grid">' +
    '      <div class="footer-brand">' +
    '        <div class="logo">Nova<span>lent</span> Staffing</div>' +
    '        <p>Hampshire\'s trusted recruitment agency for flexible, part-time staffing solutions.</p>' +
    '      </div>' +
    '      <div><h4>Quick Links</h4><ul>' +
    '        <li><a href="' + L.about + '">About</a></li>' +
    '        <li><a href="' + L.services + '">Services</a></li>' +
    '        <li><a href="' + L.jobs + '">Jobs</a></li>' +
    '        <li><a href="' + L.forEmployers + '">For Employers</a></li>' +
    '        <li><a href="' + L.forJobseekers + '">For Job Seekers</a></li>' +
    '        <li><a href="' + L.requestStaff + '">Request Staff</a></li>' +
    '        <li><a href="' + L.contact + '">Contact</a></li>' +
    '      </ul></div>' +
    '      <div><h4>Services</h4><ul>' +
    '        <li><a href="' + L.servicesPartTime + '">Part-Time Staffing</a></li>' +
    '        <li><a href="' + L.servicesTemporary + '">Temporary Staffing</a></li>' +
    '        <li><a href="' + L.servicesFullTime + '">Full-Time Placements</a></li>' +
    '      </ul></div>' +
    '      <div><h4>Contact</h4><ul>' +
    '        <li><a href="' + L.email + '">info@novalentstaffing.com</a></li>' +
    '        <li>Portsmouth &amp; Hampshire, UK</li>' +
    '      </ul></div>' +
    '    </div>' +
    '    <div class="footer-bottom"><p>&copy; 2026 Novalent Staffing Ltd. All rights reserved.</p></div>' +
    '  </div>' +
    '</footer>';

  const headerPlaceholder = document.getElementById('nav-header-placeholder');
  const footerPlaceholder = document.getElementById('nav-footer-placeholder');

  if (headerPlaceholder) {
    headerPlaceholder.outerHTML = headerHtml;
  }
  if (footerPlaceholder) {
    footerPlaceholder.outerHTML = footerHtml;
  }
})();
