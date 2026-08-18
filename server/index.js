import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

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
const baseUrl = `https://${SUBDOMAIN}.repairshopr.com/api/v1`;

app.use(express.json({ limit: '1mb' }));

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

app.post('/api/repairshopr/request', async (req,res) => {
  if (!API_KEY || !FORM_ID) {
    return res.status(503).json({
      error: 'RepairShopr is not configured yet. Add REPAIRSHOPR_API_KEY and REPAIRSHOPR_TICKET_FORM_ID to the GoDaddy environment secrets.'
    });
  }

  try {
    const body = req.body || {};
    const payload = {
      ...body,
      name: body.name || '',
      email: body.email || '',
      phone: body.phone || '',
      description: body.description || '',
      subject: body.subject || 'Website Request'
    };

    const data = await rsFetch(
      `/new_ticket_forms/${encodeURIComponent(FORM_ID)}/process_form`,
      { method:'POST', body:JSON.stringify(payload) }
    );

    return res.json({ ok:true, data });
  } catch (error) {
    return res.status(502).json({ error:error.message });
  }
});

const isProduction = process.argv.includes('--production') || process.env.NODE_ENV === 'production';

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