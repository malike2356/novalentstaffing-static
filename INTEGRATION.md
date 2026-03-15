# Frontend–MIS integration

This document describes the **complete integration** between the Novalent marketing site (this static site) and the Novalent MIS (Management Information System). It covers every user-facing flow and where data lands in the MIS, including the **recruitment workflow**.

## Overview

When the MIS API base URL is set in `js/links-config.js` (`misApiBase`), the site uses the MIS as the single source of truth for:

- **Jobs** (published only) → Jobs page and Apply page
- **Branding** (company name, industry) → Header, footer, and any `data-branding` elements
- **Contact form** → Creates a lead/contact in the MIS
- **Request Staff form** → Creates a quote request in Sales & CRM → Quotes
- **Job applications** → HR → Applications and Pipeline; optional temperament test; applicant can track status

---

## 1. Jobs and recruitment

### Jobs list

- **Source:** MIS `GET /api/v1/jobs` (published jobs only).
- **Used on:** `jobs.html` via `js/jobs.js` → `NovalentRecruitment.getJobs()` (which uses `NovalentMisApi.getJobs()` when MIS is configured).
- **Fallback:** If MIS is not set or the request fails, one sample job is shown from `localStorage` key `novalent_jobs_fallback`.

### Apply for a job

- **Entry:** User clicks “Easy Apply” or “Apply” on a job → `apply.html?id=<job_id>`.
- **Job detail:** Job title/location come from MIS `GET /api/v1/jobs/{id}` (or from in-memory list when already loaded).
- **Submit:** Form is sent as `FormData` to MIS `POST /api/v1/applications` with: `job_id`, `first_name`, `last_name`, `email`, `phone`, `address` (location), `availability`, `previous_experience`, `cv_file`, `keep_on_file_consent`.
- **MIS side:** Creates a `StaffApplication` with `status = applied`, stores CV under `storage/app/public/cvs/`, sends optional admin notification email, and can trigger webhooks.

### After apply – recruitment workflow

1. **Thank-you on site:** The apply page shows “Application received” and two optional links (when MIS is configured):
   - **Track your application:** Opens the MIS application status page (see below). The URL is returned in the API response as `status_view_url`.
   - **Temperament assessment:** Optional short assessment on the MIS; link is `temperament_redirect_url` in the response.

2. **In the MIS – recruitment pipeline:**
   - **HR → Job Postings:** Manage and publish jobs.
   - **HR → Applications:** All applications; filter by job, status.
   - **HR → Pipeline:** Applications by stage: Applied → Reviewing → Interview → Onboarding → Approved / Rejected.
   - Staff can move applications between stages, schedule interviews (interview choose link), add feedback, and approve or reject.

3. **Applicant status view (MIS):**
   - After apply, the applicant can use the “View application status” link (or the link from status update emails).
   - URL: MIS base `/application/status?token=<application_view_token>`.
   - Shows current status (Applied, Reviewing, Interview, etc.) and, when relevant, rejection reason or next steps.

4. **Temperament test (MIS):**
   - Optional; linked from the thank-you page after apply.
   - Stored against the application; used for matching and pipeline context.

End-to-end recruitment flow: **Site jobs list → Apply form → MIS Application → (optional) Temperament → MIS Pipeline → Status view / emails.**

---

## 2. Contact form

- **Page:** `contact.html`.
- **Submit:** MIS `POST /api/v1/contact` with `contact_name`, `contact_email`, `contact_phone`, `message`, optional `enquiry` (employer / jobseeker / general), and optional `service_id` (when the Service dropdown is shown and a service is selected; services are loaded from MIS when configured).
- **MIS:** Creates a lead (source = contact) with enquiry type stored. Visible in **CRM → Leads** or **CRM → Contact form**. Admins are notified (in-app and optional email). The submitter receives an **auto-reply email** (“We’ve received your message… we typically respond within 24–48 hours”) unless the send fails (logged, lead is still created).
- **Editable in CMS:** Contact hero/section text and the “response time” note (e.g. “We typically respond within 24–48 hours”) via **System → Marketing site content → Contact**.

---

## 3. Request Staff (employers)

- **Page:** `request-staff.html` (linked from “For Employers” and main CTAs).
- **Services:** When MIS is configured, the “Service” dropdown is filled from MIS `GET /api/v1/services` (from System Configuration).
- **Submit:** MIS `POST /api/v1/quotes` with contact details, `service_id`, address, dates, and `special_requirements`.
- **MIS:** Creates a **Quote Request** (source = quote). Visible under **Sales & CRM → Quotes**. Staff can create a quotation, send it, and turn it into a contract. The quote show page includes “Special requirements” (company, role type, industry, job title, start date, duration, hours, number of staff, requirements, notes). **Duplicate check:** if the same email already submitted a quote in the last hour, the API returns a friendly message and does not create a second record. The submitter receives an **auto-reply email** (“We’ve received your staffing request… we typically respond within 24–48 hours”).

---

## 4. Branding

- **Endpoint:** MIS `GET /api/v1/public/branding`.
- **Used by:** `js/branding.js`; sets `window.NOVALENT_BRANDING` and fills elements with `data-branding="<key>"` (e.g. `company_short_name`, `company_name`, `company_email`, `company_phone`, `company_address`, `industry_description`, `industries`, `site_hero_title`, `site_hero_subtitle`).
- **Links:** Use `data-branding-href="company_email"` and `data-branding-href-prefix="mailto:"` (or `tel:` for phone) so the element’s `href` is set from branding.
- **When MIS is not configured:** `branding.js` applies fallbacks from `js/links-config.js` (`contactEmail`, `companyName`, `companyAddress`, `companyPhone`) so the footer and contact details still show. **Single source:** MIS branding when configured; otherwise `links-config.js`.
- **Config in MIS:** System → System Configuration (Company name, short name, industry, address, phone, email, hero title/subtitle). Single source of truth for business name and contact details on the site.

---

## 5. Controlling static text and images from the MIS (no code changes)

You can change **any** static copy and **images/media** on the marketing site from the MIS without editing HTML or code. The CMS is available when the **marketing_site_content** feature flag is enabled (System → Feature management).

### Text

1. **In the MIS:** Go to **System → Marketing site content (CMS)** (`/admin/system/site-content`).
2. Open the **section** (e.g. Home, About, Footer) and find the **named field** (e.g. “Hero title”, “Footer tagline”). Fields are **pre-filled with the current site text** so you see what is live. Enter or change text as needed; leave a field blank to keep the current text on the site.
3. **On the static site:** Each field in the CMS corresponds to a `data-content="key"` element; the key is fixed in the CMS and not shown to editors.
4. Click **Save all**, then use **View marketing site to see your changes** to confirm.

### Images and media

1. **In the MIS:** In **Marketing site content** (System → Marketing site content), open the relevant **section** (e.g. Home, About). Image placements are **named fields** like “Hero / carousel image (first slide)” and “Team section image (first slide)”. For each image field you can:
   - **Paste an image URL** in the text box (e.g. `https://example.com/image.jpg`), or  
   - **Upload an image** using the file input below. The file is stored in the MIS (`storage/app/public/site-content/`) and the API returns a full URL. Max 5 MB; JPEG, PNG, GIF, WebP.
2. **On the static site:** Use **`data-content-src="key"`** on the element:
   - **`<img data-content-src="hero_image">`** → the image `src` is set from the MIS (e.g. home carousel first slide).
   - **`<img data-content-src="about_team_image">`** → team section first slide on the About page.
   - **`<a data-content-src="key">`** → the link `href` is set.
   - **Any other element** (e.g. `<div data-content-src="key">`) → the element’s `background-image` is set to the URL.

Use **`data-branding="…"`** for the fixed branding fields (company name, hero title, **company_email**, **company_address**, **company_phone**, etc.). Use **`data-content="key"`** for text and **`data-content-src="key"`** for images/links/backgrounds you define in Marketing site content. After the attributes are in the HTML once, you can change all copy and images from the MIS without code changes.

**Content keys in use (optional in CMS; HTML fallback if missing):**  
Home: hero, why choose, 3 service cards, 4 stats, industries (heading + 4 cards), how we work (heading + 4 steps), find your path (2 cards), our values (heading + 3 testimonials), CTA.  
About: hero, mission/vision/why started, team intro + image, **team member 1 & 2 (name, role, bio)**, 6 value cards (title + description), CTA.  
Contact: hero, section heading/intro, **response time note**.  
Jobs: hero and section text.  
Services: hero, core heading/intro, 3 core service cards (title + description + pricing), additional services (heading + 3 cards), industries (heading + 4 cards), CTA.  
For employers: hero, section intro, 6 cards, process (heading + 4 steps), pricing (heading + 3 cards), CTA.  
For job seekers: hero, section intro, 3 cards, benefits heading + 3 cards, requirements heading + intro, CTA.  
Request staff: hero title/subtitle, section heading/intro.  
Footer: `footer_tagline`.  
Images: `hero_image`, `about_team_image`.  
All keys are listed in MIS `config/site_content_placements.php` and `config/site_content_defaults.php`.

---

## 6. Configuration

### Static site

- **`js/links-config.js`:** Set `misApiBase` to the MIS base URL (e.g. `http://localhost:8080/novalent/mis/api/public` for LAMPP, or the live MIS URL). No trailing slash. **Single fallbacks when MIS is not used:** `contactEmail`, `companyName`, `companyAddress`, `companyPhone` (contact and footer copy). The `email` key is derived as `mailto:` + `contactEmail`; do not hardcode mailto addresses elsewhere. If `misApiBase` is empty, jobs use the fallback job, forms use `getNovalentContactEmail()` (from these fallbacks), and branding is applied from links-config.

### MIS

- **CORS:** In MIS `.env`, set `CORS_ALLOWED_ORIGINS` to include the site origin (e.g. `http://localhost:8080` for LAMPP) so the browser can call the API. If CORS is missing or wrong, form submissions (contact, quote, apply) will fail in the browser.
- **System Configuration:** Company name, industry, services (for quote and contact forms), and optional settings (e.g. admin notification email for new applications, contact form notification email).

### Production checklist

- **Turnstile:** The contact, apply, and request-staff forms use Cloudflare Turnstile with a **test key** (`1x00000000000000000000AA`) that always passes. For production, replace with a real site key from [Cloudflare Dashboard](https://dash.cloudflare.com/) → Turnstile in each form’s `data-sitekey` and script.
- **CORS:** Ensure `CORS_ALLOWED_ORIGINS` includes your live marketing site origin (e.g. `https://novalentstaffing.co.uk`).

---

## 7. Summary table

| User action        | Page / flow      | MIS API / route              | MIS location / result                    |
|--------------------|------------------|-------------------------------|------------------------------------------|
| View jobs          | jobs.html        | GET /api/v1/jobs             | HR → Job Postings (published only)      |
| Apply for job      | apply.html       | POST /api/v1/applications    | HR → Applications, Pipeline              |
| Track application  | Link from apply  | — (MIS page)                 | /application/status?token=               |
| Temperament        | Link from apply  | — (MIS page)                 | Stored on application                    |
| Contact            | contact.html     | POST /api/v1/contact         | Leads / contact                          |
| Request staff      | request-staff.html | POST /api/v1/quotes        | Sales & CRM → Quotes                     |
| Company name / copy| All (header/footer) | GET /api/v1/public/branding | System Configuration                      |

This is the full frontend–MIS integration and recruitment workflow supported by the current setup.
