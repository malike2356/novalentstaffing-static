/**
 * Novalent Staffing - Form security for static site
 * Honeypot, timing, captcha, and spam checks
 */
(function () {
  'use strict';

  var SPAM_PATTERNS = [
    /\b(viagra|cialis|casino|lottery|prize|click here|buy now|act now)\b/i,
    /\b(crypto|bitcoin|invest now|make money fast)\b/i,
    /\b(nigerian prince|wire transfer|send money now)\b/i,
    /(https?:\/\/[^\s]+){3,}/,  /* 3+ links */
    /<script|javascript:|on\w+=/i,
    /(\w)\1{10,}/  /* 10+ repeated chars */
  ];

  window.NovalentFormSecurity = {
    MIN_SUBMIT_SECONDS: 5,
    formLoadTime: Date.now(),

    check: function (form) {
      var hp = form.querySelector('[name="website_url"]');
      if (hp && hp.value && hp.value.trim().length > 0) return false;

      var elapsed = (Date.now() - this.formLoadTime) / 1000;
      if (elapsed < this.MIN_SUBMIT_SECONDS) return false;

      var turnstileContainer = form.querySelector('.cf-turnstile');
      if (turnstileContainer) {
        var resp = form.querySelector('[name="cf-turnstile-response"]');
        if (!resp || !resp.value || resp.value.length < 10) return false;
      }

      var textFields = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
      var i, j, val;
      for (i = 0; i < textFields.length; i++) {
        val = (textFields[i].value || '').trim();
        if (!val) continue;
        for (j = 0; j < SPAM_PATTERNS.length; j++) {
          if (SPAM_PATTERNS[j].test(val)) return false;
        }
      }
      return true;
    },

    showError: function (msg) {
      alert(msg || 'Please complete the security check and try again.');
    }
  };
})();
