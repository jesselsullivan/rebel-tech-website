import { useEffect, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { siteConfig as site } from '../siteConfig';
import SectionTitle from '../components/SectionTitle';

export default function ServiceRequest() {
  const [forms, setForms] = useState([]);
  const [formState, setFormState] = useState({ name:'', email:'', phone:'', service:'', description:'' });
  const [status, setStatus] = useState({type:'', message:''});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/repairshopr/forms')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setForms(d.forms || []))
      .catch(() => {});
  }, []);

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setStatus({type:'',message:''});
    try {
      const res = await fetch('/api/repairshopr/request', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          ...formState,
          subject: `Website Service Request — ${formState.service || 'General'}`,
          ticket_type: 'Website Service Request'
        })
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text || 'The server returned an invalid response.' }; }
      if (!res.ok) throw new Error(data.error || 'Unable to submit the request.');
      setStatus({type:'success',message:'Request received. Rebel Tech will follow up with you.'});
      setFormState({name:'',email:'',phone:'',service:'',description:''});
    } catch (err) {
      setStatus({type:'error',message:err.message});
    } finally { setLoading(false); }
  };

  return (
    <section className="page">
      <div className="container narrow">
        <SectionTitle eyebrow="CUSTOMER SERVICE" title="Request Service" text="Tell us what you need and we'll get the right information into the service queue." />
        <div className="portal-card">
          <div>
            <div className="eyebrow">REPAIRSHOPR CUSTOMER PORTAL</div>
            <h2>Already a customer?</h2>
            <p>View tickets, communicate with Rebel Tech, and keep up with your service history.</p>
          </div>
          <Button href={site.repairShopr.portalUrl} target="_blank" rel="noreferrer" variant="contained" className="mui-red-button">Open Customer Portal ↗</Button>
        </div>

        <div className="request-card">
          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <div className="eyebrow">NEW REQUEST</div>
              <h2>Let's get you connected.</h2>
              <p className="muted">Submit a repair, network, business technology, cabling, AV, POS, or smart-home request.</p>
            </div>
            {forms.length > 0 && <span className="api-badge">RepairShopr connected</span>}
          </div>

          <form onSubmit={submit} className="row g-3 mt-1">
            <div className="col-md-6"><label>Name<input required value={formState.name} onChange={e=>setFormState({...formState,name:e.target.value})} placeholder="Your name" /></label></div>
            <div className="col-md-6"><label>Email<input required type="email" value={formState.email} onChange={e=>setFormState({...formState,email:e.target.value})} placeholder="you@example.com" /></label></div>
            <div className="col-md-6"><label>Phone<input value={formState.phone} onChange={e=>setFormState({...formState,phone:e.target.value})} placeholder="(662) 281-2970" /></label></div>
            <div className="col-md-6"><label>Service Type<select value={formState.service} onChange={e=>setFormState({...formState,service:e.target.value})}><option value="">Select a service</option>{[...site.services, ...(site.businessServices || [])].map(s=><option key={s.title}>{s.title}</option>)}</select></label></div>
            <div className="col-12"><label>What do you need help with?<textarea required rows="6" value={formState.description} onChange={e=>setFormState({...formState,description:e.target.value})} placeholder="Tell us about the issue or project..." /></label></div>
            <div className="col-12 d-flex align-items-center gap-3 flex-wrap">
              <Button type="submit" variant="contained" disabled={loading} className="mui-red-button">{loading ? <CircularProgress size={20} color="inherit" /> : 'Submit Request →'}</Button>
              {status.message && <div className={status.type === 'success' ? 'form-success' : 'form-error'}>{status.message}</div>}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}