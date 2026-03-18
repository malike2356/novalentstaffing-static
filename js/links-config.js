/**
 * Novalent Staffing – single source of truth for all URLs
 * Update links here; nav and footer are built from this config.
 * Extensionless URLs; .htaccess rewrites /about -> about.html.
 *
 * MIS API base: used by js/mis-api.js for jobs, contact, quote, application.
 * On novalentstaffing.co.uk we use the live MIS; otherwise local.
 */
(function() {
  var isProduction = typeof window !== 'undefined' && window.location &&
    (window.location.hostname === 'novalentstaffing.co.uk' || window.location.hostname === 'www.novalentstaffing.co.uk');
  window.NOVALENT_LINKS = {
    home: '.',
    about: 'about',
    services: 'services',
    jobs: 'jobs',
    forEmployers: 'for-employers',
    forJobseekers: 'for-jobseekers',
    contact: 'contact',
    requestStaff: 'request-staff',
    apply: 'apply',
    /** @deprecated Use contactEmail + data-branding-href; derived as mailto: + contactEmail. */
    email: null,
    servicesPartTime: 'services#part-time',
    servicesTemporary: 'services#temporary',
    servicesFullTime: 'services#full-time',
    misApiBase: isProduction ? 'https://mis.novalentstaffing.co.uk' : 'http://localhost:8080/novalent/mis/api/public',
    /** Fallback when MIS not configured: contact email for mailto and display. */
    contactEmail: 'info@novalentstaffing.co.uk',
  /** Fallback when MIS not configured: company name (nav/footer). */
  companyName: 'Novalent Staffing',
  /** Fallback when MIS not configured: address line (footer). */
  companyAddress: 'Portsmouth & Hampshire, UK',
  /** Fallback when MIS not configured: phone (footer). */
  companyPhone: '',
  /** URL to the MIS CMS for marketing site content (derived from misApiBase). Only shown when misApiBase is set. */
  cmsUrl: null,
  };
}());
// Derive CMS URL from MIS API base (same origin, admin path)
if (window.NOVALENT_LINKS.misApiBase) {
  window.NOVALENT_LINKS.cmsUrl = window.NOVALENT_LINKS.misApiBase.replace(/\/$/, '') + '/admin/system/site-content';
}
// Single source for contact mailto (no hardcoding elsewhere)
if (window.NOVALENT_LINKS.contactEmail) {
  window.NOVALENT_LINKS.email = 'mailto:' + window.NOVALENT_LINKS.contactEmail;
}
