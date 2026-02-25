/**
 * Novalent Staffing - Recruitment & Booking Module
 * Job listings, applications, and staff requests
 * Uses localStorage for demo; wire to backend in production
 */

(function() {
  'use strict';

  var JOBS_PER_PAGE = 6;

  var INDUSTRY_LABELS = { retail: 'Retail', hospitality: 'Hospitality', healthcare: 'Healthcare', logistics: 'Logistics', events: 'Events', cleaning: 'Cleaning', security: 'Security', manufacturing: 'Manufacturing' };

  /* Sample jobs - cleaning, catering, bar, security, factory, Fareham roles */
  const SAMPLE_JOBS = [
    { id: 1, title: 'General Cleaner - Part Time', location: 'Portsmouth', type: 'Part-time', hours: '15 hrs/week', rate: '£12.60/hr', rateNum: 12.6, industry: 'cleaning', posted: '2026-02-22', company: 'Novalent Staffing', snippet: 'Part-time cleaners needed. Reliable, enthusiastic, committed to high standards. Morning 5am-9am or Evening 3pm-7pm shifts. Full training given.' },
    { id: 2, title: 'SIA Security Staff - Restaurant', location: 'Portsmouth (Commercial Road, City Centre)', type: 'Part-time', hours: 'Evenings & weekends', rate: '£12-13/hr', rateNum: 12.5, industry: 'security', posted: '2026-02-23', company: 'Novalent Staffing', snippet: 'SIA licensed door supervisor for restaurant in Portsmouth commercial area near city centre. Evenings and weekend shifts. Valid SIA licence required.' },
    { id: 3, title: 'Catering Assistant', location: 'Portsmouth', type: 'Part-time', hours: '15-25 hrs/week', rate: '£10.75-11.50/hr', rateNum: 11.25, industry: 'hospitality', posted: '2026-02-21', company: 'Novalent Staffing', snippet: 'Kitchen support and food prep. Weekday and weekend shifts. Ideal for flexible workers. Full training provided.' },
    { id: 4, title: 'Bar Tender', location: 'Southampton', type: 'Part-time', hours: 'Evenings & weekends', rate: '£11-12/hr', rateNum: 11.5, industry: 'hospitality', posted: '2026-02-20', company: 'Novalent Staffing', snippet: 'Bar staff for busy pub. Mixing drinks, serving customers. Flexible shifts. Experience preferred but training available.' },
    { id: 5, title: 'Catering Assistant', location: 'Fareham', type: 'Part-time', hours: 'Weekends', rate: '£10.50-11/hr', rateNum: 10.75, industry: 'hospitality', posted: '2026-02-19', company: 'Novalent Staffing', snippet: 'Weekend catering support for events and venues. Food prep, serving, clearing. Regular weekend work available.' },
    { id: 6, title: 'Factory Worker', location: 'Chichester', type: 'Part-time', hours: '20-30 hrs/week', rate: '£11.50-12.50/hr', rateNum: 12, industry: 'manufacturing', posted: '2026-02-23', company: 'Novalent Staffing', snippet: 'Production line and assembly work. Reliable, good with your hands. Full training provided. Shift patterns available.' },
    { id: 7, title: 'Warehouse Operative', location: 'Fareham', type: 'Temporary', hours: 'Flexible shifts', rate: '£10.50-11.50/hr', rateNum: 11, industry: 'logistics', posted: '2026-02-22', company: 'Novalent Staffing', snippet: 'Picking, packing and dispatch. Immediate start. Temp-to-perm opportunity for the right candidate.' },
    { id: 8, title: 'Care Support Worker', location: 'Fareham', type: 'Part-time', hours: '20-25 hrs/week', rate: '£11-12.50/hr', rateNum: 12, industry: 'healthcare', posted: '2026-02-21', company: 'Novalent Staffing', snippet: 'Support clients with daily activities. DBS required. Training provided. Flexible shifts to suit your lifestyle.' },
    { id: 9, title: 'Retail Assistant', location: 'Fareham', type: 'Part-time', hours: '15-20 hrs/week', rate: '£10.50-11.50/hr', rateNum: 11, industry: 'retail', posted: '2026-02-20', company: 'Novalent Staffing', snippet: 'Customer service, till work and stock replenishment. Weekday and weekend shifts available.' },
    { id: 10, title: 'Bar Tender', location: 'Portsmouth', type: 'Flexible', hours: 'Evenings & weekends', rate: '£11-12/hr', rateNum: 11.5, industry: 'hospitality', posted: '2026-02-22', company: 'Novalent Staffing', snippet: 'Bar staff for city centre venue. Mixing drinks, customer service. Flexible shifts to suit your schedule.' }
  ];

  const STORAGE_KEYS = {
    jobs: 'novalent_jobs',
    applications: 'novalent_applications',
    staffRequests: 'novalent_staff_requests',
    savedJobs: 'novalent_saved_jobs'
  };

  function getSavedJobIds() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.savedJobs);
      return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
  }
  function toggleSavedJob(id) {
    var ids = getSavedJobIds();
    var idx = ids.indexOf(id);
    if (idx >= 0) ids.splice(idx, 1);
    else ids.push(id);
    localStorage.setItem(STORAGE_KEYS.savedJobs, JSON.stringify(ids));
  }
  function isJobSaved(id) { return getSavedJobIds().indexOf(id) >= 0; }

  function getAppliedJobIds() {
    return getApplications().map(function(a) { return a.jobId; });
  }
  function hasAppliedToJob(id) { return getAppliedJobIds().indexOf(String(id)) >= 0; }

  function readUrlParams() {
    var p = {};
    try {
      var q = (window.location.search || '').slice(1);
      q.split('&').forEach(function(pair) {
        var kv = pair.split('=');
        if (kv[0] && kv[1]) p[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
      });
    } catch (e) {}
    return p;
  }
  function updateUrlParams(filters) {
    var params = [];
    if (filters.keyword) params.push('q=' + encodeURIComponent(filters.keyword));
    if (filters.location) params.push('loc=' + encodeURIComponent(filters.location));
    if (filters.industry) params.push('ind=' + encodeURIComponent(filters.industry));
    if (filters.type) params.push('type=' + encodeURIComponent(filters.type));
    var qs = params.length ? '?' + params.join('&') : '';
    var url = window.location.pathname + qs + (window.location.hash || '');
    if (url !== window.location.pathname + window.location.search + (window.location.hash || '')) {
      window.history.replaceState({}, '', url);
    }
  }

  function getJobs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.jobs);
      return stored ? JSON.parse(stored) : SAMPLE_JOBS;
    } catch (e) {
      return SAMPLE_JOBS;
    }
  }

  function saveJobs(jobs) {
    localStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(jobs));
  }

  function getApplications() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.applications);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveApplication(app) {
    const apps = getApplications();
    app.id = Date.now();
    app.submittedAt = new Date().toISOString();
    apps.push(app);
    localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(apps));
  }

  function getStaffRequests() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.staffRequests);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveStaffRequest(req) {
    const reqs = getStaffRequests();
    req.id = Date.now();
    req.submittedAt = new Date().toISOString();
    reqs.push(req);
    localStorage.setItem(STORAGE_KEYS.staffRequests, JSON.stringify(reqs));
  }

  // Public API
  window.NovalentRecruitment = {
    getJobs: getJobs,
    getJob: function(id) {
      return getJobs().find(function(j) { return String(j.id) === String(id); });
    },
    saveApplication: saveApplication,
    saveStaffRequest: saveStaffRequest,
    getApplications: getApplications,
    getStaffRequests: getStaffRequests
  };

  function formatPostedDate(dateStr) {
    var d = new Date(dateStr);
    var now = new Date();
    var diff = Math.floor((now - d) / (24 * 60 * 60 * 1000));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    if (diff < 7) return diff + ' days ago';
    if (diff < 14) return '1 week ago';
    return diff + ' days ago';
  }

  function getFilters() {
    var keyword = (document.getElementById('searchKeyword') && document.getElementById('searchKeyword').value) || '';
    var location = (document.getElementById('searchLocation') && document.getElementById('searchLocation').value) || '';
    var industry = (document.getElementById('filterIndustry') && document.getElementById('filterIndustry').value) || '';
    var type = '';
    var activeChip = document.querySelector('.filter-chips .chip.active');
    if (activeChip && activeChip.dataset.type) type = activeChip.dataset.type;
    return { keyword: keyword.trim().toLowerCase(), location: location, industry: industry, type: type };
  }

  function getSortValue() {
    var sel = document.getElementById('sortJobs');
    return (sel && sel.value) || 'date';
  }

  function filterAndSortJobs() {
    var filters = getFilters();
    var sortBy = getSortValue();
    var jobs = getJobs();

    if (filters.keyword) {
      jobs = jobs.filter(function(j) {
        var txt = (j.title + ' ' + (j.hours || '') + ' ' + (j.industry || '')).toLowerCase();
        return txt.indexOf(filters.keyword) >= 0;
      });
    }
    if (filters.location) {
      jobs = jobs.filter(function(j) { return j.location.toLowerCase().indexOf(filters.location.toLowerCase()) >= 0; });
    }
    if (filters.industry) {
      jobs = jobs.filter(function(j) { return j.industry && j.industry.toLowerCase() === filters.industry.toLowerCase(); });
    }
    if (filters.type) {
      jobs = jobs.filter(function(j) { return j.type && j.type.toLowerCase() === filters.type.toLowerCase(); });
    }

    if (sortBy === 'date') {
      jobs.sort(function(a, b) { return new Date(b.posted) - new Date(a.posted); });
    } else if (sortBy === 'salary') {
      jobs.sort(function(a, b) { return (b.rateNum || 0) - (a.rateNum || 0); });
    } else if (sortBy === 'salary-asc') {
      jobs.sort(function(a, b) { return (a.rateNum || 0) - (b.rateNum || 0); });
    } else if (sortBy === 'title') {
      jobs.sort(function(a, b) { return (a.title || '').localeCompare(b.title || ''); });
    }

    return jobs;
  }

  function renderJobs() {
    var container = document.getElementById('jobsList');
    var resultsEl = document.getElementById('resultsCount');
    var activeFiltersEl = document.getElementById('activeFilters');
    var loadMoreWrap = document.getElementById('loadMoreWrap');
    var loadMoreBtn = document.getElementById('loadMoreBtn');
    var savedJobsLink = document.getElementById('savedJobsLink');
    var savedJobsCount = document.getElementById('savedJobsCount');
    if (!container) return;

    var displayCount = JOBS_PER_PAGE;
    var currentView = 'list';

    function applyUrlParamsToForm(params) {
      if (params.q && (params.q = params.q.trim())) {
        var kw = document.getElementById('searchKeyword');
        if (kw) kw.value = params.q;
      }
      if (params.loc) {
        var loc = document.getElementById('searchLocation');
        if (loc) loc.value = params.loc;
      }
      if (params.ind) {
        var ind = document.getElementById('filterIndustry');
        if (ind) ind.value = params.ind;
      }
      if (params.type) {
        var chips = document.querySelectorAll('.filter-chips .chip');
        chips.forEach(function(c) {
          c.classList.toggle('active', (c.dataset.type || '') === params.type);
        });
      }
    }

    function updateSavedJobsBadge() {
      var n = getSavedJobIds().length;
      if (savedJobsCount) savedJobsCount.textContent = n;
      if (savedJobsLink) savedJobsLink.style.display = n > 0 ? 'inline-flex' : 'none';
    }

    function renderActiveFilters(filters) {
      if (!activeFiltersEl) return;
      var parts = [];
      if (filters.keyword) parts.push({ label: 'Keyword: ' + filters.keyword, key: 'keyword' });
      if (filters.location) parts.push({ label: filters.location, key: 'location' });
      if (filters.industry) parts.push({ label: INDUSTRY_LABELS[filters.industry] || filters.industry, key: 'industry' });
      if (filters.type) parts.push({ label: filters.type, key: 'type' });
      if (parts.length === 0) {
        activeFiltersEl.innerHTML = '';
        return;
      }
      activeFiltersEl.innerHTML = parts.map(function(p) {
        return '<span class="filter-tag">' + escapeHtml(p.label) + ' <button type="button" class="filter-tag-clear" data-clear="' + p.key + '" aria-label="Remove filter"><i class="fas fa-times"></i></button></span>';
      }).join('');

      activeFiltersEl.querySelectorAll('.filter-tag-clear').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var k = btn.dataset.clear;
          if (k === 'keyword') { var kw = document.getElementById('searchKeyword'); if (kw) kw.value = ''; }
          if (k === 'location') { var loc = document.getElementById('searchLocation'); if (loc) loc.value = ''; }
          if (k === 'industry') { var ind = document.getElementById('filterIndustry'); if (ind) ind.value = ''; }
          if (k === 'type') {
            document.querySelectorAll('.filter-chips .chip').forEach(function(c) {
              c.classList.toggle('active', !c.dataset.type);
            });
          }
          update();
        });
      });
    }

    function buildJobCard(job, opts) {
      opts = opts || {};
      var saved = isJobSaved(job.id);
      var applied = hasAppliedToJob(job.id);
      var posted = formatPostedDate(job.posted);
      var isNew = (new Date() - new Date(job.posted)) < 3 * 24 * 60 * 60 * 1000;
      var indLabel = job.industry && INDUSTRY_LABELS[job.industry] ? INDUSTRY_LABELS[job.industry] : '';
      var badges = [];
      if (isNew) badges.push('<span class="job-badge job-badge-new">New</span>');
      if (indLabel) badges.push('<span class="job-badge job-badge-industry">' + escapeHtml(indLabel) + '</span>');
      if (applied) badges.push('<span class="job-badge job-badge-applied"><i class="fas fa-check"></i> Applied</span>');

      var actionHtml = applied
        ? '<span class="btn btn-applied"><i class="fas fa-check"></i> Applied</span>'
        : '<a href="apply?id=' + job.id + '" class="btn btn-primary">Easy Apply</a>';

      return '<article class="job-card' + (opts.grid ? ' job-card-grid' : '') + '" data-id="' + job.id + '">' +
        '<div class="job-card-main">' +
        '<div class="job-card-header">' +
        '<h3><a href="apply?id=' + job.id + '">' + escapeHtml(job.title) + '</a></h3>' +
        '<button type="button" class="job-save-btn ' + (saved ? 'saved' : '') + '" aria-label="' + (saved ? 'Unsave' : 'Save') + ' job" title="' + (saved ? 'Unsave' : 'Save') + '"><i class="' + (saved ? 'fas' : 'far') + ' fa-bookmark"></i></button>' +
        '</div>' +
        (badges.length ? '<div class="job-badges">' + badges.join('') + '</div>' : '') +
        '<p class="job-company">' + escapeHtml(job.company || 'Novalent Staffing') + '</p>' +
        '<div class="job-meta">' +
        '<span><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(job.location) + '</span>' +
        '<span><i class="fas fa-briefcase"></i> ' + escapeHtml(job.type) + '</span>' +
        '<span class="job-rate"><i class="fas fa-pound-sign"></i> ' + escapeHtml(job.rate) + '</span>' +
        '<span class="job-posted">' + posted + '</span>' +
        '</div>' +
        (job.snippet ? '<p class="job-snippet">' + escapeHtml(job.snippet) + '</p>' : '') +
        '<p class="job-hours">' + escapeHtml(job.hours || '') + '</p>' +
        '</div>' +
        '<div class="job-card-actions">' + actionHtml + '</div>' +
        '</article>';
    }

    function update() {
      var filters = getFilters();
      updateUrlParams(filters);
      renderActiveFilters(filters);
      updateSavedJobsBadge();

      var jobs = filterAndSortJobs();

      if (resultsEl) resultsEl.textContent = jobs.length + ' job' + (jobs.length !== 1 ? 's' : '') + ' found';

      var toShow = jobs.slice(0, displayCount);
      var hasMore = jobs.length > displayCount;

      if (jobs.length === 0) {
        container.innerHTML = '<div class="empty-state">' +
          '<i class="fas fa-search"></i>' +
          '<h3>No jobs match your search</h3>' +
          '<p>Try adjusting your keywords, location, or filters.</p>' +
          '<button type="button" class="btn btn-outline-teal" id="clearFiltersBtn">Clear filters</button>' +
          '</div>';
        if (loadMoreWrap) loadMoreWrap.style.display = 'none';
        container.querySelector('#clearFiltersBtn') && container.querySelector('#clearFiltersBtn').addEventListener('click', function() {
          displayCount = JOBS_PER_PAGE;
          var kw = document.getElementById('searchKeyword'); if (kw) kw.value = '';
          var loc = document.getElementById('searchLocation'); if (loc) loc.value = '';
          var ind = document.getElementById('filterIndustry'); if (ind) ind.value = '';
          document.querySelectorAll('.filter-chips .chip').forEach(function(c) { c.classList.toggle('active', !c.dataset.type); });
          window.history.replaceState({}, '', window.location.pathname);
          update();
        });
        return;
      }

      var useGrid = currentView === 'grid';
      container.innerHTML = toShow.map(function(job) { return buildJobCard(job, { grid: useGrid }); }).join('');

      container.querySelectorAll('.job-save-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          var card = btn.closest('.job-card');
          if (!card) return;
          var id = parseInt(card.dataset.id, 10);
          toggleSavedJob(id);
          var icon = btn.querySelector('i');
          var nowSaved = isJobSaved(id);
          btn.classList.toggle('saved', nowSaved);
          icon.classList.toggle('far', !nowSaved);
          icon.classList.toggle('fas', nowSaved);
          updateSavedJobsBadge();
        });
      });

      if (loadMoreWrap) loadMoreWrap.style.display = hasMore ? 'block' : 'none';
      if (loadMoreBtn) {
        loadMoreBtn.onclick = function() {
          displayCount += JOBS_PER_PAGE;
          update();
        };
      }

      container.className = 'jobs-list jobs-view-' + currentView;
    }

    var params = readUrlParams();
    if (params.q || params.loc || params.ind || params.type) {
      applyUrlParamsToForm(params);
    }

    update();

    var keywordInput = document.getElementById('searchKeyword');
    var locationSelect = document.getElementById('searchLocation');
    var industrySelect = document.getElementById('filterIndustry');
    var sortSelect = document.getElementById('sortJobs');
    var btnSearch = document.getElementById('btnSearch');
    var chips = document.querySelectorAll('.filter-chips .chip');
    var viewBtns = document.querySelectorAll('.view-toggle .view-btn');

    function attach(elem, evt, fn) { if (elem) elem.addEventListener(evt, fn); }
    attach(keywordInput, 'input', update);
    attach(keywordInput, 'keypress', function(e) { if (e.key === 'Enter') update(); });
    attach(locationSelect, 'change', update);
    attach(industrySelect, 'change', update);
    attach(sortSelect, 'change', update);
    attach(btnSearch, 'click', update);

    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        chips.forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');
        update();
      });
    });

    var viewToggle = document.querySelector('.view-toggle');
    if (viewToggle) {
      viewToggle.addEventListener('click', function(e) {
        var btn = e.target.closest('.view-btn');
        if (!btn) return;
        currentView = btn.dataset.view || 'list';
        viewBtns.forEach(function(b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        update();
      });
    }

    savedJobsLink && savedJobsLink.addEventListener('click', function(e) {
      e.preventDefault();
      displayCount = 999;
      var kw = document.getElementById('searchKeyword'); if (kw) kw.value = '';
      var loc = document.getElementById('searchLocation'); if (loc) loc.value = '';
      var ind = document.getElementById('filterIndustry'); if (ind) ind.value = '';
      document.querySelectorAll('.filter-chips .chip').forEach(function(c) { c.classList.toggle('active', !c.dataset.type); });
      var savedIds = getSavedJobIds();
      var jobs = getJobs().filter(function(j) { return savedIds.indexOf(j.id) >= 0; });
      if (jobs.length === 0) { update(); return; }
      document.querySelectorAll('.filter-chips .chip').forEach(function(c) { c.classList.remove('active'); });
      container.innerHTML = jobs.map(function(job) { return buildJobCard(job, { grid: currentView === 'grid' }); }).join('');
      container.className = 'jobs-list jobs-view-' + currentView;
      resultsEl && (resultsEl.textContent = jobs.length + ' saved job' + (jobs.length !== 1 ? 's' : ''));
      activeFiltersEl && (activeFiltersEl.innerHTML = '');
      loadMoreWrap && (loadMoreWrap.style.display = 'none');
      container.querySelectorAll('.job-save-btn').forEach(function(b) {
        b.addEventListener('click', function(ev) {
          ev.preventDefault();
          var card = b.closest('.job-card');
          if (!card) return;
          var id = parseInt(card.dataset.id, 10);
          toggleSavedJob(id);
          var icon = b.querySelector('i');
          var nowSaved = isJobSaved(id);
          b.classList.toggle('saved', nowSaved);
          icon.classList.toggle('far', !nowSaved);
          icon.classList.toggle('fas', nowSaved);
          updateSavedJobsBadge();
          if (getSavedJobIds().length === 0) update();
        });
      });
    });
  }

  function escapeHtml(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderJobs);
  } else {
    renderJobs();
  }
})();
