# Novalent Staffing – Marketing site

Static marketing website for Novalent Staffing Ltd (Portsmouth). Recruitment, services, contact, request staff, jobs list, and apply. No backend of its own; it uses the Novalent MIS public API when configured.

## Stack

- HTML5, CSS3, JavaScript. No build step; serve as static files.

## Structure

- **index.html** – Homepage
- **about.html**, **services.html**, **for-employers.html**, **for-jobseekers.html**
- **contact.html** – Contact form (submits to MIS when `misApiBase` is set)
- **request-staff.html** – Quote request (MIS)
- **jobs.html** – Job listings (MIS `GET /api/v1/jobs`)
- **apply.html** – Job application (MIS `POST /api/v1/applications`)
- **css/**, **js/**, **assets/**

## Config

- **js/links-config.js** – Set `misApiBase` to the MIS API base URL (e.g. `http://localhost:8080/novalent/mis/api/public`) so jobs, contact, quote, and apply use the MIS. Leave empty for fallback (sample job, no form submission to MIS).

## Local run

Serve via LAMPP: `http://localhost:8080/novalent/novalentstaffing/`  
Or: `php -S localhost:8000`, `python3 -m http.server 8000`, or `npx serve .`

## Security

- `.htaccess`: security headers, directory listing off.
- Forms: honeypot, timing check, Cloudflare Turnstile (test key in repo; replace for production), spam filter.

## Deploy

This directory is the git repo for the static site. Push to GitHub (`novalentstaffing-static`); deploy with `./deploy_novalent.sh static` from the novalent root. See parent **doc/DEPLOY.md**.
