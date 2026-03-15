/**
 * Novalent Staffing – MIS API client for static HTML (and any other frontend)
 * Connects contact, quote, and application forms to the Novalent MIS API.
 * Requires CORS_ALLOWED_ORIGINS in the MIS .env to include this site's origin.
 * Base URL: set window.NOVALENT_MIS_API_BASE or use NOVALENT_LINKS.misApiBase from links-config.js
 */
(function () {
  'use strict';

  function getBaseUrl() {
    return (window.NOVALENT_MIS_API_BASE || (window.NOVALENT_LINKS && window.NOVALENT_LINKS.misApiBase) || '')
      .replace(/\/$/, '');
  }

  function apiUrl(path) {
    var base = getBaseUrl();
    if (!base) return null;
    return base + (path.indexOf('/') === 0 ? path : '/' + path);
  }

  function getJson(url, opts) {
    opts = opts || {};
    return fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      credentials: 'omit',
      cache: 'no-store'
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var err = new Error(data.message || 'Request failed');
          err.status = res.status;
          err.data = data;
          throw err;
        }
        return data;
      });
    });
  }

  function postJson(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      credentials: 'omit',
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var err = new Error(data.message || 'Request failed');
          err.status = res.status;
          err.data = data;
          err.errors = data.errors;
          throw err;
        }
        return data;
      });
    });
  }

  function postFormData(url, formData) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      credentials: 'omit',
      body: formData
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var err = new Error(data.message || 'Request failed');
          err.status = res.status;
          err.data = data;
          err.errors = data.errors;
          throw err;
        }
        return data;
      });
    });
  }

  window.NovalentMisApi = {
    getBaseUrl: getBaseUrl,
    isConfigured: function () { return !!getBaseUrl(); },

    getServices: function () {
      var url = apiUrl('api/v1/services');
      if (!url) return Promise.reject(new Error('MIS API base URL not set'));
      return getJson(url).then(function (r) { return r.data || []; });
    },

    getJobs: function (params) {
      var url = apiUrl('api/v1/jobs');
      if (!url) return Promise.reject(new Error('MIS API base URL not set'));
      if (params && (params.per_page || params.page)) {
        var q = [];
        if (params.per_page) q.push('per_page=' + encodeURIComponent(params.per_page));
        if (params.page) q.push('page=' + encodeURIComponent(params.page));
        if (q.length) url += (url.indexOf('?') >= 0 ? '&' : '?') + q.join('&');
      }
      url += (url.indexOf('?') >= 0 ? '&' : '?') + '_=' + Date.now();
      return getJson(url).then(function (r) {
        var list = r.data || [];
        return { data: list, meta: r.meta || {} };
      });
    },

    getJob: function (id) {
      var url = apiUrl('api/v1/jobs/' + encodeURIComponent(id));
      if (!url) return Promise.reject(new Error('MIS API base URL not set'));
      return getJson(url).then(function (r) { return r.data; });
    },

    /** Get branding/industry wording from MIS (company name, industry description, industries list). For aligning site copy with MIS. */
    getBranding: function () {
      var url = apiUrl('api/v1/public/branding');
      if (!url) return Promise.reject(new Error('MIS API base URL not set'));
      return getJson(url).then(function (r) { return r.data || {}; });
    },

    submitContact: function (payload) {
      var url = apiUrl('api/v1/contact');
      if (!url) return Promise.reject(new Error('MIS API base URL not set'));
      return postJson(url, {
        contact_name: payload.contact_name,
        contact_email: payload.contact_email,
        contact_phone: payload.contact_phone || null,
        message: payload.message,
        service_id: payload.service_id || null,
        enquiry: payload.enquiry || null
      });
    },

    submitQuote: function (payload) {
      var url = apiUrl('api/v1/quotes');
      if (!url) return Promise.reject(new Error('MIS API base URL not set'));
      return postJson(url, {
        contact_name: payload.contact_name,
        contact_email: payload.contact_email,
        contact_phone: payload.contact_phone || null,
        service_id: payload.service_id,
        address: payload.address,
        postcode: payload.postcode || null,
        requested_date: payload.requested_date || null,
        requested_time: payload.requested_time || null,
        budget_range: payload.budget_range || null,
        special_requirements: payload.special_requirements || null
      });
    },

    submitApplication: function (formOrFormData) {
      var url = apiUrl('api/v1/applications');
      if (!url) return Promise.reject(new Error('MIS API base URL not set'));
      var fd = formOrFormData instanceof FormData
        ? formOrFormData
        : (function () {
            var form = typeof formOrFormData === 'object' && formOrFormData && formOrFormData.nodeName === 'FORM'
              ? formOrFormData
              : document.getElementById('applyForm');
            if (!form) throw new Error('Apply form not found');
            return new FormData(form);
          })();
      return postFormData(url, fd);
    }
  };
})();
