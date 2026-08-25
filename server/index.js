import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

const SUBDOMAIN = process.env.REPAIRSHOPR_SUBDOMAIN || 'rebeltech';
const API_KEY = process.env.REPAIRSHOPR_API_KEY || '';
const FORM_ID = process.env.REPAIRSHOPR_TICKET_FORM_ID || '';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER || 'b58e03001@smtp-brevo.com';
const SMTP_PASS = process.env.SMTP_PASS || '';
const MAIL_FROM = process.env.MAIL_FROM || 'info@rebeltechoxford.com';
const MAIL_TO = process.env.MAIL_TO || 'info@rebeltechoxford.com';
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || '';
const TURNSTILE_ACTION = process.env.TURNSTILE_ACTION || 'customer_checkin';
const TURNSTILE_HOSTNAMES = new Set((process.env.TURNSTILE_HOSTNAMES || 'rebeltechoxford.com,www.rebeltechoxford.com').split(',').map(v => v.trim().toLowerCase()).filter(Boolean));
const isProduction = process.argv.includes('--production') || process.env.NODE_ENV === 'production';

const rateBuckets = new Map();
const recentSubmissionHashes = new Map();

const SERVICE_BASE_ADDRESS = process.env.SERVICE_BASE_ADDRESS || '118 Glen Alden Cir, Oxford, MS 38655';
const SERVICE_RADIUS_MILES = Number(process.env.SERVICE_RADIUS_MILES || 50);
const INCLUDED_DRIVE_MINUTES = Number(process.env.INCLUDED_DRIVE_MINUTES || 15);
const TRAVEL_RATE_PER_MILE = Number(process.env.TRAVEL_RATE_PER_MILE || 2);
const GEOCODING_URL = process.env.GEOCODING_URL || 'https://nominatim.openstreetmap.org/search';
const ROUTING_URL = process.env.ROUTING_URL || 'https://router.project-osrm.org/route/v1/driving';
const GEOCODING_USER_AGENT = process.env.GEOCODING_USER_AGENT || 'Rebel-Tech-Oxford-Website/1.0 (info@rebeltechoxford.com)';
let serviceBaseCoordinates = null;
const addressCache = new Map();

function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRad = value => value * Math.PI / 180;
  const earthRadiusMiles = 3958.7613;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocodeAddress(address) {
  const cacheKey = address.trim().toLowerCase();
  const cached = addressCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.coordinates;

  const url = new URL(GEOCODING_URL);
  url.searchParams.set('q', address);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'us');

  const response = await fetch(url, {
    headers: {
      'User-Agent': GEOCODING_USER_AGENT,
      'Accept': 'application/json'
    }
  });
  if (!response.ok) throw new Error(`Address lookup returned ${response.status}.`);
  const results = await response.json();
  if (!Array.isArray(results) || !results.length) throw new Error('That address could not be located. Please enter the full street address, city, state, and ZIP code.');

  const coordinates = {
    lat: Number(results[0].lat),
    lon: Number(results[0].lon),
    displayName: String(results[0].display_name || address)
  };
  if (!Number.isFinite(coordinates.lat) || !Number.isFinite(coordinates.lon)) {
    throw new Error('That address could not be located. Please check the address and try again.');
  }

  addressCache.set(cacheKey, { coordinates, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
  return coordinates;
}

async function getServiceBaseCoordinates() {
  if (!serviceBaseCoordinates) {
    serviceBaseCoordinates = await geocodeAddress(SERVICE_BASE_ADDRESS);
  }
  return serviceBaseCoordinates;
}

async function calculateServiceArea(address) {
  const destination = await geocodeAddress(address);
  const base = await getServiceBaseCoordinates();
  const radiusDistanceMiles = haversineMiles(base.lat, base.lon, destination.lat, destination.lon);

  if (radiusDistanceMiles > SERVICE_RADIUS_MILES) {
    return {
      status: 'ready',
      outsideRadius: true,
      extendedTravel: false,
      distanceMiles: Number(radiusDistanceMiles.toFixed(1)),
      driveMinutes: null,
      travelCharge: 0,
      normalizedAddress: destination.displayName,
      rules: {
        radiusMiles: SERVICE_RADIUS_MILES,
        includedDriveMinutes: INCLUDED_DRIVE_MINUTES,
        travelRatePerMile: TRAVEL_RATE_PER_MILE
      }
    };
  }

  const routeUrl = `${ROUTING_URL}/${base.lon},${base.lat};${destination.lon},${destination.lat}?overview=false`;
  const routeResponse = await fetch(routeUrl, {
    headers: { 'User-Agent': GEOCODING_USER_AGENT, 'Accept': 'application/json' }
  });
  if (!routeResponse.ok) throw new Error(`Routing lookup returned ${routeResponse.status}.`);
  const routeData = await routeResponse.json();
  const route = routeData?.routes?.[0];
  if (!route) throw new Error('We could not calculate driving distance for that address. Please try again.');

  const roadMiles = Number((route.distance / 1609.344).toFixed(1));
  const driveMinutes = Math.max(1, Math.round(route.duration / 60));
  const extendedTravel = driveMinutes > INCLUDED_DRIVE_MINUTES;
  const travelCharge = extendedTravel
    ? Number((roadMiles * TRAVEL_RATE_PER_MILE).toFixed(2))
    : 0;

  return {
    status: 'ready',
    outsideRadius: false,
    extendedTravel,
    distanceMiles: roadMiles,
    radiusDistanceMiles: Number(radiusDistanceMiles.toFixed(1)),
    driveMinutes,
    travelCharge,
    normalizedAddress: destination.displayName,
    rules: {
      radiusMiles: SERVICE_RADIUS_MILES,
      includedDriveMinutes: INCLUDED_DRIVE_MINUTES,
      travelRatePerMile: TRAVEL_RATE_PER_MILE
    }
  };
}

app.get('/api/service-area/check', async (req, res) => {
  if (!rateLimit(req, 'service-area-check', 20, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many address checks. Please wait a few minutes and try again.' });
  }

  const address = clean(req.query.address, 300);
  if (!address || address.length < 8) {
    return res.status(400).json({ error: 'Please enter a complete service address.' });
  }

  try {
    return res.json(await calculateServiceArea(address));
  } catch (error) {
    console.error('Service-area check error:', error);
    return res.status(422).json({ error: error.message || 'We could not verify that service address.' });
  }
});

function getClientIp(req) {
  const cloudflareIp = String(req.headers['cf-connecting-ip'] || '').trim();
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return cloudflareIp || forwarded || String(req.socket.remoteAddress || 'unknown');
}

function rateLimit(req, key, max = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const bucketKey = `${key}:${getClientIp(req)}`;
  const bucket = rateBuckets.get(bucketKey) || { count: 0, resetAt: now + windowMs };
  if (now > bucket.resetAt) { bucket.count = 0; bucket.resetAt = now + windowMs; }
  bucket.count += 1;
  rateBuckets.set(bucketKey, bucket);
  return bucket.count <= max;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) if (now > bucket.resetAt) rateBuckets.delete(key);
  for (const [key, expiresAt] of recentSubmissionHashes) if (now > expiresAt) recentSubmissionHashes.delete(key);
}, 15 * 60 * 1000).unref();

async function verifyTurnstile(req, token) {
  if (!TURNSTILE_SECRET) {
    return isProduction ? { ok: false, reason: 'Turnstile is not configured.' } : { ok: true, skipped: true };
  }
  if (!token) return { ok: false, reason: 'Please complete the security check before submitting.' };

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: TURNSTILE_SECRET, response: token, remoteip: getClientIp(req) })
    });
    const result = await response.json();
    const hostname = String(result.hostname || '').toLowerCase();
    const validAction = result.action === TURNSTILE_ACTION;
    const validHostname = TURNSTILE_HOSTNAMES.has(hostname);
    if (!result.success || !validAction || !validHostname) {
      console.warn('Turnstile rejected check-in:', result['error-codes'] || result);
      return { ok: false, reason: 'The security check could not be verified. Please try again.' };
    }
    return { ok: true };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { ok: false, reason: 'The security check is temporarily unavailable. Please try again in a moment.' };
  }
}

const baseUrl = `https://${SUBDOMAIN}.repairshopr.com/api/v1`;

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const host = String(req.headers.host || '').split(':')[0].toLowerCase();
  if (host === 'www.rebeltechoxford.com') {
    return res.redirect(301, `https://rebeltechoxford.com${req.originalUrl}`);
  }
  next();
});


async function rsFetch(endpoint, options = {}) {
  if (!API_KEY) throw new Error('RepairShopr API key is not configured.');
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY,
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!response.ok) throw new Error(data.message || data.error || `RepairShopr returned ${response.status}`);
  return data;
}

app.get('/api/health', (_req,res) => res.json({
  ok: true,
  repairShoprConfigured: Boolean(API_KEY && FORM_ID)
}));

app.get('/api/repairshopr/forms', async (_req,res) => {
  if (!API_KEY) return res.json({ configured:false, forms:[] });
  try {
    const data = await rsFetch('/new_ticket_forms');
    return res.json({
      configured: Boolean(FORM_ID),
      forms: data.new_ticket_forms || data.forms || data || []
    });
  } catch (error) {
    return res.status(502).json({ configured:false, forms:[], error:error.message });
  }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>'\"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

app.post('/api/contact', async (req,res) => {
  const { name = '', email = '', phone = '', message = '' } = req.body || {};
  const cleanName = String(name).trim().slice(0, 120);
  const cleanEmail = String(email).trim().slice(0, 254);
  const cleanPhone = String(phone).trim().slice(0, 50);
  const cleanMessage = String(message).trim().slice(0, 5000);

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (!SMTP_PASS) {
    return res.status(503).json({ error: 'Email delivery is not configured yet. Please call Rebel Tech directly.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      requireTLS: SMTP_PORT === 587 && !SMTP_SECURE
    });

    await transporter.sendMail({
      from: `Rebel Tech Website <${MAIL_FROM}>`,
      to: MAIL_TO,
      replyTo: cleanEmail,
      subject: `New Website Contact — ${cleanName}`,
      text: [
        'New contact message from the Rebel Tech website',
        '',
        `Name: ${cleanName}`,
        `Email: ${cleanEmail}`,
        `Phone: ${cleanPhone || 'Not provided'}`,
        '',
        'Message:',
        cleanMessage
      ].join('\n'),
      html: `
        <h2>New Rebel Tech Website Contact</h2>
        <p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(cleanPhone || 'Not provided')}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(cleanMessage).replace(/\n/g, '<br />')}</p>
      `
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('Contact email error:', error);
    return res.status(502).json({ error: 'We could not send your message right now. Please call Rebel Tech directly.' });
  }
});

function clean(value, max = 5000) {
  return String(value ?? '').trim().slice(0, max);
}

function checkInDescription(body) {
  const travel = body.serviceArea || {};
  return [
    `Customer type: ${clean(body.customerType) || 'Not specified'}`,
    `Need: ${clean(body.need) || 'Not specified'}`,
    `Business / organization: ${clean(body.business) || 'Not provided'}`,
    `Service address: ${clean(body.address, 300) || 'Not provided'}`,
    `Service-area status: ${travel.outsideRadius ? 'Outside standard service area' : (travel.extendedTravel ? 'Extended travel' : 'Standard service area')}`,
    `Drive time: ${travel.driveMinutes != null ? `${travel.driveMinutes} minutes` : 'Not calculated'}`,
    `Road distance: ${travel.distanceMiles != null ? `${travel.distanceMiles} miles` : 'Not calculated'}`,
    `Travel charge: ${travel.travelCharge != null ? `$${Number(travel.travelCharge).toFixed(2)}` : '$0.00'}`,
    `Preferred contact: ${clean(body.contactPreference) || 'Either'}`,
    '',
    'Customer description:',
    clean(body.description)
  ].join('\n');
}

async function handleCustomerCheckIn(req, res) {

  if (!rateLimit(req, 'customer-check-in', 8, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many check-in attempts from this connection. Please wait a few minutes or call Rebel Tech directly.' });
  }

  if (!API_KEY) {
    return res.status(503).json({
      error: 'Online check-in is temporarily unavailable. Please call Rebel Tech directly or try again later.'
    });
  }

  const body = req.body || {};
  const firstName = clean(body.firstName, 80);
  const lastName = clean(body.lastName, 80);
  const businessName = clean(body.business, 160);
  const email = clean(body.email, 254);
  const phone = clean(body.phone, 50);
  const customerType = clean(body.customerType, 80);
  const need = clean(body.need, 160);
  const description = clean(body.description, 5000);
  const contactPreference = clean(body.contactPreference, 30) || 'Either';
  const address = clean(body.address, 300);
  const honeypot = clean(body.website, 120);

  if (honeypot) {
    return res.status(400).json({ error: 'We could not process that request.' });
  }

  const turnstile = await verifyTurnstile(req, clean(body.turnstileToken, 2048));
  if (!turnstile.ok) {
    return res.status(isProduction && !TURNSTILE_SECRET ? 503 : 403).json({ error: turnstile.reason });
  }

  if (!firstName || !lastName || !email || !phone || !customerType || !need || !address || !description) {
    return res.status(400).json({ error: 'Please complete your name, contact information, what you need help with, and a short description.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  let verifiedServiceArea;
  try {
    verifiedServiceArea = await calculateServiceArea(address);
  } catch (error) {
    return res.status(422).json({ error: error.message || 'We could not verify that service address.' });
  }

  if (verifiedServiceArea.outsideRadius && customerType === 'residential') {
    return res.status(422).json({ error: 'That residential address is outside our standard service area.' });
  }

  const submissionHash = crypto.createHash('sha256').update([email.toLowerCase(), phone.replace(/\D/g, ''), need.toLowerCase(), description.toLowerCase()].join('|')).digest('hex');
  if (recentSubmissionHashes.has(submissionHash)) {
    return res.status(409).json({ error: 'That request was already submitted. We have it and will follow up with you.' });
  }
  recentSubmissionHashes.set(submissionHash, Date.now() + 2 * 60 * 1000);

  // Never trust client-provided travel pricing. Use the server's fresh routing result.
  body.address = address;
  body.serviceArea = verifiedServiceArea;
  const ticketEligible = false; // Website requests remain leads until Rebel Tech approves the work.
  const subject = `${customerType} — ${need}`.slice(0, 180);
  const details = checkInDescription(body);

  try {
    // RepairShopr's Leads API is the source of truth for the initial sales/intake record.
    // from_check_in marks this as website check-in data; ticket_* fields keep the
    // qualification visible even when the request is not immediately ticketed.
    const leadPayload = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      business_name: businessName,
      from_check_in: true,
      status: 'new',
      ticket_subject: subject,
      ticket_description: details,
      ticket_problem_type: need,
      hidden_notes: `Website Check-In\nCustomer type: ${customerType}\nNeed: ${need}\nService address: ${address}\nService-area status: ${verifiedServiceArea.outsideRadius ? 'Outside standard service area' : (verifiedServiceArea.extendedTravel ? 'Extended travel' : 'Standard service area')}\nDrive time: ${verifiedServiceArea.driveMinutes != null ? `${verifiedServiceArea.driveMinutes} min` : 'Not calculated'}\nRoad distance: ${verifiedServiceArea.distanceMiles != null ? `${verifiedServiceArea.distanceMiles} mi` : 'Not calculated'}\nTravel charge: $${Number(verifiedServiceArea.travelCharge || 0).toFixed(2)}\nPreferred contact: ${contactPreference}`
    };

    const leadData = await rsFetch('/leads', {
      method: 'POST',
      body: JSON.stringify(leadPayload)
    });

    let ticketCreated = false;
    let ticketData = null;

    if (ticketEligible) {
      ticketData = await rsFetch(
        `/new_ticket_forms/${encodeURIComponent(FORM_ID)}/process_form`,
        {
          method: 'POST',
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            name: `${firstName} ${lastName}`,
            email,
            phone,
            business: businessName,
            business_name: businessName,
            service: need,
            subject: `Website Check-In — ${subject}`,
            ticket_type: 'Website Check-In',
            description: details,
            problem_type: need,
            source: 'Website Check-In'
          })
        }
      );
      ticketCreated = true;
    }

    return res.json({
      ok: true,
      ticketCreated: false,
      lead: leadData,
      ticket: null,
      serviceArea: verifiedServiceArea,
      message: 'Thanks — we have your request. Rebel Tech will review it, confirm that we can take on the work, and check scheduling before turning it into a service ticket or appointment.'
    });
  } catch (error) {
    console.error('RepairShopr check-in error:', error);
    console.error('Customer check-in integration error:', error);
    return res.status(502).json({ error: 'We could not complete your check-in right now. Please try again or call Rebel Tech directly.' });
  }
}

// Public-facing customer intake endpoint. The CRM provider remains an internal implementation detail.
app.post('/api/customer/check-in', handleCustomerCheckIn);

// Backward-compatible endpoint for the older request form.
app.post('/api/repairshopr/request', async (req,res) => {
  const body = req.body || {};
  const [firstName, ...rest] = clean(body.name, 160).split(/\s+/).filter(Boolean);
  const lastName = rest.join(' ');
  req.body = {
    firstName: firstName || 'Website',
    lastName: lastName || 'Customer',
    business: '',
    email: body.email,
    phone: body.phone,
    customerType: 'business',
    need: body.service || 'Other',
    description: body.description || body.message,
    address: body.address || SERVICE_BASE_ADDRESS,
    contactPreference: 'Either',
    ticketEligible: true,
    source: 'Legacy Website Request'
  };
  return handleCustomerCheckIn(req, res);
});

app.get('/customer-portal', (_req, res) => {
  res.redirect(302, `https://${SUBDOMAIN}.repairshopr.com`);
});

if (isProduction) {
  const dist = path.join(__dirname, '..', 'dist');
  app.use(express.static(dist));
  app.get('*', (_req,res) => res.sendFile(path.join(dist,'index.html')));
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
}

app.listen(PORT, () => console.log(`Rebel Tech server listening on http://localhost:${PORT} (${isProduction ? 'production' : 'development'})`));