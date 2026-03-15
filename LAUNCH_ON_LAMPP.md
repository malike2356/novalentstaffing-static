# Launch Novalent marketing site on LAMPP

1. **Start LAMPP** (in a terminal):
   ```bash
   sudo /opt/lampp/lampp start
   ```

2. **Open in browser** (LAMPP on port **8080**):
   - **Marketing site:** http://localhost:8080/novalent/novalentstaffing.com/
   - **MIS (backend + admin):** http://localhost:8080/novalent/mis/api/public/
   - **MIS login:** http://localhost:8080/novalent/mis/api/public/login — then go to **/admin** for the dashboard (jobs, applications, quotes, etc.)
   - **Deprecated admin (redirects to MIS):** http://localhost:8080/novalent/admin.novalentstaffing.com/

3. **Wording and industry terminology**
   - Set **Company name** and **Industry** in the MIS: **System → System Configuration** (Company Information, Business type).
   - **Edit marketing site copy and images** (no code): **System → Marketing site content (CMS)** when the **marketing_site_content** feature is enabled. Content is grouped by section (Home, About, Contact, Jobs, etc.); fields are pre-filled with current site text. Save and use “View marketing site to see your changes” to confirm.
   - With **misApiBase** set in `js/links-config.js`, the site fetches **GET /api/v1/public/branding** and uses it for:
     - **Header and footer company name** (from MIS company short name / company name).
     - **window.NOVALENT_BRANDING** (company_name, industry_description, industries[], etc.) for any custom script or `data-branding="key"` elements.
   - **Single source of truth:** Contact email, phone, address, and hero text come from MIS branding or **links-config.js** fallbacks; other page copy is editable in Marketing site content (CMS). See **INTEGRATION.md** for the full map.

For a full map of how each site form and page connects to the MIS (jobs, applications, pipeline, quotes, contact, branding), see **INTEGRATION.md** in this directory.

To stop LAMPP: `sudo /opt/lampp/lampp stop`
