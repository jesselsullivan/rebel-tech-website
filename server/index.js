import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const SUBDOMAIN = process.env.REPAIRSHOPR_SUBDOMAIN || 'rebeltechoxford';
const API_KEY = process.env.REPAIRSHOPR_API_KEY || '';
const FORM_ID = process.env.REPAIRSHOPR_TICKET_FORM_ID || '';
const baseUrl = `https://${SUBDOMAIN}.repairshopr.com/api/v1`;

app.use(express.json({ limit: '1mb' }));

async function rsFetch(endpoint, options = {}) {
  if (!API_KEY) throw new Error('RepairShopr API key is not configured.');
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY, ...(options.headers || {}) }
  });
  const text = await response.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!response.ok) throw new Error(data.message || data.error || `RepairShopr returned ${response.status}`);
  return data;
}

app.get('/api/health', (_req,res)=>res.json({ok:true, repairShoprConfigured:Boolean(API_KEY && FORM_ID)}));

app.get('/api/repairshopr/forms', async (_req,res)=>{
  if (!API_KEY) return res.json({configured:false, forms:[]});
  try { const data = await rsFetch('/new_ticket_forms'); return res.json({configured:Boolean(FORM_ID), forms:data.new_ticket_forms || data.forms || data || []}); }
  catch (error) { return res.status(502).json({configured:false, forms:[], error:error.message}); }
});

app.post('/api/repairshopr/request', async (req,res)=>{
  if (!API_KEY || !FORM_ID) return res.status(503).json({error:'RepairShopr ticket form is not configured yet.'});
  try {
    // IMPORTANT: the exact payload is intentionally centralized here. After you create
    // the New Ticket Form in RepairShopr, verify its field names in your account's API docs.
    const payload = { ...req.body };
    const data = await rsFetch(`/new_ticket_forms/${encodeURIComponent(FORM_ID)}/process_form`, { method:'POST', body:JSON.stringify(payload) });
    res.json({ok:true,data});
  } catch (error) { res.status(502).json({error:error.message}); }
});

const dist = path.join(__dirname, '..', 'dist');
app.use(express.static(dist));
app.get('*', (_req,res)=>res.sendFile(path.join(dist,'index.html')));
app.listen(PORT, ()=>console.log(`Rebel Tech server listening on port ${PORT}`));
