# Rebel Tech Oxford Website

React + Vite + Node.js website for Rebel Tech Oxford LLC.

## Stack

- React 18
- Vite
- Bootstrap 5.3
- Material UI buttons/forms
- Express / Node.js
- CRM API proxy
- Transparent Rebel Tech artwork
- Responsive video hero

## Local setup

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open http://localhost:5173

Production test:

```bash
npm run build
npm start
```

Open http://localhost:3000

## CRM integration

Copy `.env.example` to `.env` and provide:

- `REPAIRSHOPR_SUBDOMAIN`
- `REPAIRSHOPR_API_KEY`
- `REPAIRSHOPR_TICKET_FORM_ID`

The API key stays server-side and is never sent to the browser.

The exact field mapping for the New Ticket Form is centralized in `server/index.js`; verify the field names against the New Ticket Form configured in your RepairShopr account before going live.

## GoDaddy Node.js Hosting

Upload/deploy the project as a Node.js application. GoDaddy's Node.js hosting supports zipped source deployments and environment secrets. The application starts with:

```bash
npm start
```

Set the CRM integration secrets in GoDaddy rather than committing them to the project.

## Hero video

The hero uses free commercial-use networking footage from Coverr as a remote MP4 source. The source page is documented in `src/siteConfig.js`.

If you prefer to self-host the video, place an MP4 in `public/assets/` and change `siteConfig.video.mp4`.


## Contact email delivery

The public Contact page sends messages to `info@rebeltechoxford.com` through Brevo SMTP. The SMTP login is prefilled as `b58e03001@smtp-brevo.com`; the SMTP key is intentionally not included in this ZIP. Set `SMTP_PASS` in the GoDaddy Node.js environment.

Brevo's SMTP relay uses `smtp-relay.brevo.com`; port 587 with TLS is the recommended starting configuration. The `MAIL_FROM` sender must be a verified/authenticated Brevo sender/domain.

## Local development

Use `START-REBEL-TECH.bat` on Windows. It starts both processes:

- Vite frontend: http://localhost:5173
- Node/Express API: http://localhost:3000

Vite proxies `/api/*` to the Node API during development. This is important for the contact and RepairShopr forms; running only `npm run dev` will no longer be enough to test API-backed forms.

You can also run them manually in two terminals:

```text
npm run dev:server
npm run dev
```

The contact form always returns JSON on success and error, so the frontend won't fail with `Unexpected end of JSON input` if the API returns an error response.


## Local development

Use `START-REBEL-TECH.bat` or run `npm run dev`. The Node/Express server now hosts the Vite development middleware and the `/api/*` endpoints on the **same port (3000)**. This prevents the contact form from accidentally posting to Vite and receiving an HTML fallback page instead of JSON.

For local email testing, copy `.env.example` to `.env` and enter your Brevo SMTP key in `SMTP_PASS`. Never commit `.env`.


## Environment secrets

Use `.env.example` as the paste-in template. Do not commit a real `.env` file or API keys.

Required for the current website integrations:

- `REPAIRSHOPR_API_KEY` — your RepairShopr API key.
- `REPAIRSHOPR_TICKET_FORM_ID` — the ID of the RepairShopr New Ticket Form the website should submit to.
- `SMTP_PASS` — your Brevo SMTP key.

The RepairShopr subdomain is already set to `rebeltech`. The website uses the New Ticket Form API endpoint to create tickets. The server-side integration uses the configured CRM's lead and ticket-form endpoints; API credentials remain server-side. 

## Customer Check-In / CRM flow

The `/service-request` page is now a structured customer check-in. It captures contact information, customer type, need category, description, and preferred contact method. The server posts a lead to RepairShopr first. Requests that are eligible and have `REPAIRSHOPR_TICKET_FORM_ID` configured are also sent through the RepairShopr ticket form.

Scheduling is intentionally kept separate from intake. `REPAIRSHOPR_SCHEDULING_WIDGET_URL` is reserved for the future availability widget so future appointment selection can use RepairShopr's real availability rather than inventing slots on the website.

## Public Customer Check-In protection

The public `/service-request` flow is deliberately kept separate from the future `portal.rebeltechoxford.com` application. It is designed to create a RepairShopr lead only after the public request passes validation and bot protection.

The check-in now includes:

- Cloudflare Turnstile verification immediately before the RepairShopr API call. Turnstile tokens are validated server-side; the secret never reaches the browser.
- A hidden honeypot field for simple scripted submissions.
- Server-side request rate limiting.
- A short duplicate-submission guard to prevent accidental double submissions from creating repeated leads.
- No public RepairShopr API credentials. The browser only talks to this website's `/api/customer/check-in` endpoint.

For production, configure a Turnstile widget for `rebeltechoxford.com` (and `www.rebeltechoxford.com` if that hostname is allowed to serve the page), then set `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`, `TURNSTILE_ACTION`, and `TURNSTILE_HOSTNAMES` in the Node.js environment. Production check-ins fail closed if the server-side Turnstile secret is missing.

Cloudflare's current Turnstile documentation requires both the client-side widget and server-side Siteverify validation; tokens expire after five minutes and can only be used once.

## Current public-site scope

This ZIP intentionally focuses on `rebeltechoxford.com` and its public customer intake. The future `portal.rebeltechoxford.com` internal web application is not part of this build. Both can share the same RepairShopr-backed architecture later without exposing internal functionality on the public site.

## Public check-in flow
The public check-in intentionally starts with only two audience choices: **Personal / Residential** or **Business / Commercial**. Each follow-up service category is a single-purpose choice rather than a combined slash category. The separate internal customer portal is not part of this public-site build.


## Service-area and travel pricing

The public service-request form now validates the service address before Turnstile/submission. It uses the configured service origin, a 50-mile standard service radius, a 15-minute included-drive threshold, and a $2/mile extended-travel rate by default.

These settings live in `.env`:
- `SERVICE_BASE_ADDRESS`
- `SERVICE_RADIUS_MILES`
- `INCLUDED_DRIVE_MINUTES`
- `TRAVEL_RATE_PER_MILE`

The public `/api/service-area/check` endpoint geocodes the address and calculates driving distance/time. The final `/api/customer/check-in` submission independently recalculates the result server-side so client-side values cannot be trusted for pricing or eligibility.

The current website workflow intentionally creates a RepairShopr lead only. Online requests remain pending Rebel Tech review until the future FSM/portal approves the work and scheduling. The future on-site iPad workflow can use the same intake data model without this approval gate.

The routing/geocoding defaults are Nominatim and OSRM for prototyping. Before production traffic grows, move these requests behind an appropriate production routing/geocoding provider or proxy with a suitable usage policy.
