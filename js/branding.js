/**
 * Novalent – branding from MIS (wording and industry terminology)
 * Fetches GET /api/v1/public/branding when misApiBase is set and exposes:
 *   window.NOVALENT_BRANDING = { company_name, industry_description, industries[], ... }
 * Optionally updates elements with data-branding="company_name" (or other key) so copy matches MIS.
 * Load after links-config.js and mis-api.js.
 */
(function () {
  'use strict';

  window.NOVALENT_BRANDING = null;

    function applyToElements(data) {
    if (!data || typeof data !== 'object') return;
    document.querySelectorAll('[data-branding]').forEach(function (el) {
      var key = el.getAttribute('data-branding');
      var value = data[key];
      if (value !== undefined && value !== null) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.value = value;
        } else {
          el.textContent = value;
        }
      }
      if ((key === 'company_phone' || key === 'company_address') && (!value || String(value).trim() === '')) {
        var li = el.closest('li');
        if (li) li.style.display = 'none';
      }
    });
    document.querySelectorAll('[data-branding-href]').forEach(function (el) {
      var key = el.getAttribute('data-branding-href');
      var value = data[key];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        var prefix = el.getAttribute('data-branding-href-prefix') || '';
        el.href = prefix + String(value).trim();
      }
      // Hide parent <li> when value is empty (e.g. optional phone in footer)
      if ((key === 'company_phone' || key === 'company_address') && (!value || String(value).trim() === '')) {
        var li = el.closest('li');
        if (li) li.style.display = 'none';
      }
    });
    var content = data.content;
    if (content && typeof content === 'object') {
      document.querySelectorAll('[data-content]').forEach(function (el) {
        var key = el.getAttribute('data-content');
        var value = content[key];
        if (value !== undefined && value !== null) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.value = value;
          } else {
            el.textContent = value;
          }
        }
      });
      document.querySelectorAll('[data-content-src]').forEach(function (el) {
        var key = el.getAttribute('data-content-src');
        var value = content[key];
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          var url = String(value).trim();
          if (el.tagName === 'IMG') {
            el.src = url;
          } else if (el.tagName === 'A') {
            el.href = url;
          } else {
            el.style.backgroundImage = 'url("' + url.replace(/"/g, '\\22') + '")';
          }
        }
      });
    }
  }

  function run() {
    if (!window.NovalentMisApi || !window.NovalentMisApi.isConfigured()) {
      var L = window.NOVALENT_LINKS;
      if (L) {
        applyToElements({
          company_email: L.contactEmail || '',
          company_short_name: L.companyName || '',
          company_name: L.companyName || '',
          company_address: L.companyAddress || '',
          company_phone: L.companyPhone || ''
        });
      }
      return;
    }
    window.NovalentMisApi.getBranding()
      .then(function (data) {
        window.NOVALENT_BRANDING = data;
        applyToElements(data);
      })
      .catch(function () {
        window.NOVALENT_BRANDING = null;
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  /** Single source for contact email: MIS branding when configured, else links-config fallback. */
  window.getNovalentContactEmail = function () {
    var B = window.NOVALENT_BRANDING;
    var L = window.NOVALENT_LINKS;
    if (B && B.company_email && String(B.company_email).trim()) return String(B.company_email).trim();
    if (L && L.contactEmail && String(L.contactEmail).trim()) return String(L.contactEmail).trim();
    return '';
  };
})();
