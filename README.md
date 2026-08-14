# Rebel Tech Oxford — Website v2

React + Vite + Express website designed for GoDaddy Node.js Hosting.

## What is included
- Home, Services, Service Request, About, Contact pages
- Deep Oxford/Ole Miss-inspired navy (#061d49), white, gray, and Rebel Tech red palette
- Actual Rebel Tech hero artwork, icon, and service-van image supplied by the owner
- Responsive mobile navigation
- RepairShopr customer portal link: https://rebeltechoxford.repairshopr.com
- Server-side RepairShopr API integration scaffold
- Centralized editable business settings in `src/siteConfig.js`

## Run locally
```bash
npm install
npm run dev
```
Production test:
```bash
npm run build
npm start
```
Then open http://localhost:3000.

## GitHub
The repository root should contain `package.json` directly. Do not put the project inside another folder. Do not commit `node_modules`, `dist`, `.env`, or API keys.

## GoDaddy
GoDaddy Node.js Hosting requires a valid root `package.json` with a `start` script and an app that listens on `process.env.PORT`. This project is structured that way.

Recommended flow:
1. Create a private GitHub repo.
2. Upload the CONTENTS of this folder to the repository root.
3. Commit to `main`.
4. GoDaddy Node.js Hosting → Connect GitHub → choose repo → choose `main` → Import & Deploy.
5. Open the preview URL and test it.
6. Connect `rebeltechoxford.com` in GoDaddy Settings.
7. Publish when ready.

## RepairShopr setup — recommended first steps
You currently have the subdomain `rebeltechoxford.repairshopr.com` but no ticket workflow yet.

1. Log in to RepairShopr.
2. Create your customer/ticket intake workflow before exposing a direct ticket form.
3. Create a New Ticket Form with fields such as:
   - Customer name
   - Email
   - Phone
   - Service category
   - Problem/project description
   - Preferred contact method
   - Service location (optional)
   - Urgency/priority (optional)
4. Decide whether website submissions should automatically create a customer when one does not exist, or whether you want customers to use the portal first.
5. In RepairShopr API documentation, inspect the `GET /new_ticket_forms` and `POST /new_ticket_forms/{id}/process_form` endpoints for your account and verify the exact field names/payload for your form.
6. Put the resulting form ID into GoDaddy's environment secret `REPAIRSHOPR_TICKET_FORM_ID`.
7. Put the API key into GoDaddy's secret `REPAIRSHOPR_API_KEY`. NEVER commit the key to GitHub.

The API integration is deliberately conservative until the form exists. The site can already send customers to the RepairShopr portal now; direct ticket submission should be enabled only after the form fields are verified.

## Brand assets
- `public/assets/rebel-tech-hero.jpg` — supplied hero artwork
- `public/assets/rebel-tech-icon.png` — supplied RT icon
- `public/assets/rebel-tech-van.jpg` — supplied van photo

## Easy edits
Edit `src/siteConfig.js` for phone, city, service area, RepairShopr portal, form ID, and service descriptions.
