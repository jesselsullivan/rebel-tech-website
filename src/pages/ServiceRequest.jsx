import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { siteConfig as site } from '../siteConfig';
import SectionTitle from '../components/SectionTitle';

const paths = {
  residential: {
    label: 'Personal / Residential',
    options: [
      'Computer Repair', 'Phone Repair', 'Network / Wi-Fi',
      'TV & AV Installation', 'Smart Home', 'Low-Voltage Cabling', 'Something Else'
    ]
  },
  business: {
    label: 'Business / Commercial',
    options: [
      'Computer Repair', 'Network Infrastructure', 'Low-Voltage Cabling',
      'POS / Business Technology', 'AV Installation', 'Security / Access', 'Something Else'
    ]
  }
};

const quickTicketOptions = new Set([
  'Computer Repair', 'Phone Repair', 'Network / Wi-Fi',
  'TV & AV Installation', 'Smart Home', 'Something Else'
]);

function TurnstileGate({ siteKey, token, onToken }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return undefined;

    let cancelled = false;
    let attempts = 0;
    const render = () => {
      if (cancelled || !containerRef.current) return;
      if (window.turnstile?.render) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: 'customer_checkin',
          callback: onToken,
          'expired-callback': () => onToken(''),
          'error-callback': () => onToken('')
        });
        return;
      }
      if (attempts++ < 50) window.setTimeout(render, 200);
    };

    render();
    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, onToken]);


  if (!siteKey) {
    return (
      <div className="checkin-security-note">
        <strong>Bot protection is being configured.</strong>
        <span>Online check-in will be available once the secure verification service is enabled.</span>
      </div>
    );
  }

  return (
    <div className="checkin-security">
      <div ref={containerRef} />
      {!token && <span className="checkin-security-hint">Complete the verification above before submitting.</span>}
    </div>
  );
}

export default function ServiceRequest() {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
  const [formState, setFormState] = useState({
    firstName: '', lastName: '', business: '', email: '', phone: '',
    customerType: '', need: '', description: '', contactPreference: 'Either', website: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const selectedPath = paths[formState.customerType];
  const ticketEligible = useMemo(() => quickTicketOptions.has(formState.need), [formState.need]);

  const update = (field, value) => setFormState(current => ({ ...current, [field]: value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    if (turnstileSiteKey && !turnstileToken) {
      setLoading(false);
      setStatus({ type: 'error', message: 'Please complete the quick security check before submitting.' });
      return;
    }

    try {
      const res = await fetch('/api/customer/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          ticketEligible,
          turnstileToken,
          source: 'Website Check-In'
        })
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text || 'The server returned an invalid response.' }; }
      if (!res.ok) throw new Error(data.error || 'Unable to submit your check-in.');

      setStatus({
        type: 'success',
        message: data.ticketCreated
          ? 'You are checked in. Your request is now in the Rebel Tech service queue.'
          : 'You are checked in. We have your information and will follow up about the project.'
      });
      setFormState({ firstName:'', lastName:'', business:'', email:'', phone:'', customerType:'', need:'', description:'', contactPreference:'Either', website:'' });
      setTurnstileToken('');
      setTurnstileResetKey(value => value + 1);
    } catch (err) {
      setTurnstileToken('');
      setTurnstileResetKey(value => value + 1);
      setStatus({ type: 'error', message: err.message });
    } finally { setLoading(false); }
  };

  const handleToken = useMemo(() => value => setTurnstileToken(value), []);

  return (
    <section className="page">
      <div className="container narrow">
        <SectionTitle eyebrow="CUSTOMER CHECK-IN" title="Let's get you checked in." text="Tell us who you are and what you're trying to accomplish. You do not need to know the technical terms." />

        <div className="portal-card">
          <div>
            <div className="eyebrow">CUSTOMER PORTAL</div>
            <h2>Already a customer?</h2>
            <p>View your service requests, communicate with Rebel Tech, and keep up with your service history.</p>
          </div>
          <Button href={site.customerPortal.url} target="_blank" rel="noreferrer" variant="contained" className="mui-red-button">Open Customer Portal ↗</Button>
        </div>

        <div className="request-card">
          <div className="checkin-intro">
            <div>
              <div className="eyebrow">NEW CHECK-IN</div>
              <h2>Start with the basics.</h2>
              <p className="muted">This starts a request with Rebel Tech. We will review what you send us and contact you about the next step. No pricing or appointment is assumed by submitting this form.</p>
            </div>
            <span className="api-badge">Secure intake</span>
          </div>

          <form onSubmit={submit} className="row g-3 mt-1" autoComplete="on">
            <div className="col-md-6"><label>First Name<input required autoComplete="given-name" value={formState.firstName} onChange={e=>update('firstName',e.target.value)} placeholder="First name" /></label></div>
            <div className="col-md-6"><label>Last Name<input required autoComplete="family-name" value={formState.lastName} onChange={e=>update('lastName',e.target.value)} placeholder="Last name" /></label></div>
            <div className="col-md-6"><label>Business / Organization<input autoComplete="organization" value={formState.business} onChange={e=>update('business',e.target.value)} placeholder="Optional" /></label></div>
            <div className="col-md-6"><label>Phone<input required type="tel" autoComplete="tel" value={formState.phone} onChange={e=>update('phone',e.target.value)} placeholder="(662) 281-2970" /></label></div>
            <div className="col-md-6"><label>Email<input required type="email" autoComplete="email" value={formState.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com" /></label></div>

            <div className="col-12 checkin-divider"><h3>What kind of help do you need?</h3></div>
            <div className="col-12">
              <div className="checkin-choice-grid">
                {Object.entries(paths).map(([key, path]) => (
                  <button key={key} type="button" className={`checkin-choice ${formState.customerType === key ? 'selected' : ''}`} onClick={()=>{ update('customerType',key); update('need',''); }}>
                    <strong>{path.label}</strong>
                    <span>{key === 'residential' ? 'For you, your home, or personal technology' : 'For your business, office, or commercial property'}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedPath && <>
              <div className="col-12 checkin-divider"><h3>What do you need help with?</h3></div>
              <div className="col-12"><label>Choose one<select required value={formState.need} onChange={e=>update('need',e.target.value)}><option value="">Select what you need help with</option>{selectedPath.options.map(option=><option key={option}>{option}</option>)}</select></label></div>
            </>}

            <div className="col-12 checkin-divider"><h3>Tell us what you're trying to accomplish</h3><p className="muted">Don't worry about technical terms. Just tell us what's happening, what you have now, or what you'd like to improve.</p></div>
            <div className="col-12"><textarea required rows="6" maxLength="5000" value={formState.description} onChange={e=>update('description',e.target.value)} placeholder="Example: We are opening a new office and need Ethernet, Wi-Fi and cameras. Or: my computer is slow and keeps showing strange pop-ups." /></div>

            <div className="col-md-6"><label>Preferred Contact<select value={formState.contactPreference} onChange={e=>update('contactPreference',e.target.value)}><option>Either</option><option>Phone</option><option>Email</option></select></label></div>

            <input className="checkin-honeypot" tabIndex="-1" autoComplete="off" aria-hidden="true" value={formState.website} onChange={e=>update('website',e.target.value)} />

            <div className="col-12 checkin-next-step">
              <strong>{ticketEligible ? 'This looks like a straightforward service request.' : 'This looks like a project or consultation.'}</strong>
              <span>{ticketEligible ? 'We can send it into the Rebel Tech service queue after verification.' : 'We will save your project details so Rebel Tech can follow up and scope it properly.'}</span>
            </div>

            <div className="col-12 checkin-security-wrap">
              <div className="eyebrow">ONE LAST STEP</div>
              <p>Before we send anything to our service system, we verify that this is a real customer request.</p>
              <TurnstileGate key={turnstileResetKey} siteKey={turnstileSiteKey} token={turnstileToken} onToken={handleToken} />
            </div>

            <div className="col-12 d-flex align-items-center gap-3 flex-wrap">
              <Button type="submit" variant="contained" disabled={loading || Boolean(turnstileSiteKey && !turnstileToken)} className="mui-red-button">{loading ? <CircularProgress size={20} color="inherit" /> : 'Check In →'}</Button>
              {status.message && <div className={status.type === 'success' ? 'form-success' : 'form-error'}>{status.message}</div>}
            </div>
          </form>
        </div>

        <div className="schedule-placeholder">
          <div className="eyebrow">WHAT HAPPENS NEXT</div>
          <h3>We review it, then we talk.</h3>
          <p>For now, every request comes to Rebel Tech for review. Straightforward service requests can be routed into the service queue, while larger projects stay as leads so we can scope the work before talking price or scheduling. Online pricing and appointment scheduling can be added later without rebuilding this intake flow.</p>
        </div>
      </div>
    </section>
  );
}
