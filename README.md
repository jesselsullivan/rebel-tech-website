# Rebel Tech Oxford Website

React + Vite + Node.js website for Rebel Tech Oxford LLC.

## Stack

- React 18
- Vite
- Bootstrap 5.3
- Material UI buttons/forms
- Express / Node.js
- RepairShopr API proxy
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

## RepairShopr

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

Set the RepairShopr secrets in GoDaddy rather than committing them to the project.

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

The RepairShopr subdomain is already set to `rebeltech`. The website uses the New Ticket Form API endpoint to create tickets. RepairShopr's official API documentation confirms `GET /new_ticket_forms` and `POST /new_ticket_forms/{id}/process_form` for this workflow. 
