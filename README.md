# Novalent Staffing – Marketing Website

Static marketing website for Novalent Staffing Ltd, a Portsmouth-based recruitment agency specialising in flexible, part-time staffing solutions.

## Stack

- **HTML5** – Semantic markup
- **CSS3** – Custom design (Hirxpert-inspired)
- **JavaScript** – Navigation, mobile menu, scroll effects

## Structure

```
static/
├── index.html          # Homepage
├── about.html          # About us
├── services.html       # Services
├── for-employers.html  # For employers
├── for-jobseekers.html # For job seekers
├── contact.html        # Contact form
├── css/
│   └── style.css       # Main styles
├── js/
│   └── main.js         # Core scripts
└── assets/
    └── images/         # Local images (optional)
```

## Local Development

Serve locally:

```bash
# Python 3
python3 -m http.server 8000

# PHP
php -S localhost:8000

# Node (npx)
npx serve .
```

Then open `http://localhost:8000`.

## Security (pre-host)

- **`.htaccess`** – HTTP security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.), directory listing disabled, blocks `.bak`, `.sql`, `.log`, `.htpasswd`
- **Forms** – Honeypot, 5s timing check, Cloudflare Turnstile captcha, spam keyword filter, `maxlength` on inputs
- **Turnstile** – Uses test key `1x00000000000000000000AA` (always passes). For production: get a site key from [Cloudflare Dashboard](https://dash.cloudflare.com/) → Turnstile, replace in apply.html, contact.html, request-staff.html
- **Admin** – For public placeholder, consider excluding `admin/` or protecting with basic auth

## Design

- **Theme:** Hirxpert-inspired (professional HR/recruitment)
- **Colours:** Navy (#0f172a), white, accent blue (#0ea5e9)
- **Fonts:** Plus Jakarta Sans, DM Sans (Google Fonts)
- **Images:** Unsplash (stock imagery, free to use)

## Deploy (pull from GitHub)

Use GitHub as staging. On the server:

```bash
cd /home1/n15dzk3l/novalentstaffing.com
git pull origin main
```

First-time setup on server: clone into the document root:

```bash
cd /home1/n15dzk3l
git clone https://github.com/malike2356/novalentstaffing-static.git novalentstaffing.com
```

## Contact Form

The contact form currently shows an alert on submit. For production, wire it to:

- A PHP backend (e.g. `contact.php`)
- Formspree, Netlify Forms, or similar
- Your CRM or email API
