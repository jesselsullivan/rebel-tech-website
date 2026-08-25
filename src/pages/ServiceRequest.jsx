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

function ServiceAreaStatus({ result, customerType }) {
  if (!result) return null;

  if (result.status === 'checking') {
    return (
      <div className="service-area-status service-area-neutral" role="status" aria-live="polite">
        <strong>Checking this service address…</strong>
        <span>We’re confirming your location and travel information.</span>
      </div>
    );
  }

  if (result.status === 'error') {
    return (
      <div className="service-area-status service-area-neutral" role="status" aria-live="polite">
        <strong>We couldn't verify that address yet.</strong>
        <span>{result.message} Please check the address and try again.</span>
      </div>
    );
  }

  if (result.outsideRadius) {
    const businessMessage = customerType === 'business';
    const residentialMessage = customerType === 'residential';
    return (
      <div className="service-area-status service-area-red" role="status" aria-live="polite">
        <strong>
          {businessMessage
            ? 'This location is outside our standard service area.'
            : residentialMessage
              ? 'This address is outside our standard residential service area.'
              : 'This location is outside our standard service area.'}
        </strong>
        <span>
          {businessMessage
            ? 'We’d be happy to discuss your project and determine whether we can accommodate the location. You can still submit this request for review.'
            : residentialMessage
              ? 'We currently do not accept standard residential service requests at this location. Please contact us if you believe there are special circumstances we should consider.'
              : 'Select whether this is a residential or business request to see the appropriate next step.'}
        </span>
        {result.distanceMiles != null && <small>{result.distanceMiles} miles from our standard service-area origin.</small>}
      </div>
    );
  }

  if (result.extendedTravel) {
    return (
      <div className="service-area-status service-area-yellow" role="status" aria-live="polite">
        <strong>You’re within our standard service area.</strong>
        <span>
          This location requires additional travel, so an <b>${result.travelCharge}</b> extended-travel charge will apply to service at this address.
        </span>
        <small>{result.distanceMiles} road miles · approximately {result.driveMinutes} minutes by car.</small>
      </div>
    );
  }

  return (
    <div className="service-area-status service-area-green" role="status" aria-live="polite">
      <strong>You’re within our standard service area.</strong>
      <span>No additional travel charge applies to this location.</span>
      <small>{result.distanceMiles} road miles · approximately {result.driveMinutes} minutes by car.</small>
    </div>
  );
}

export default function ServiceRequest() {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
  const [formState, setFormState] = useState({
    firstName: '', lastName: '', business: '', email: '', phone: '',
    customerType: '', need: '', description: '', contactPreference: 'Either',
    address: '', website: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [serviceArea, setServiceArea] = useState(null);

  const selectedPath = paths[formState.customerType];

  const update = (field, value) => setFormState(current => ({ ...current, [field]: value }));

  useEffect(() => {
    const address = formState.address.trim();
    if (address.length < 8) {
      setServiceArea(null);
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setServiceArea({ status: 'checking' });
      try {
        const params = new URLSearchParams({ address });
        const res = await fetch(`/api/service-area/check?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'We could not verify that address.');
        if (!cancelled) setServiceArea(data);
      } catch (error) {
        if (!cancelled) setServiceArea({ status: 'error', message: error.message });
      }
    }, 650);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [formState.address]);

  const handleToken = useMemo(() => value => setTurnstileToken(value), []);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    if (!serviceArea || serviceArea.status !== 'ready') {
      setLoading(false);
      setStatus({ type: 'error', message: 'Please enter a valid service address and wait for the service-area check to finish.' });
      return;
    }

    if (serviceArea.outsideRadius && formState.customerType === 'residential') {
      setLoading(false);
      setStatus({ type: 'error', message: 'That residential address is outside our standard service area, so an online service request cannot be submitted for it.' });
      return;
    }

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
          serviceArea: {
            distanceMiles: serviceArea.distanceMiles,
            driveMinutes: serviceArea.driveMinutes,
            outsideRadius: serviceArea.outsideRadius,
            extendedTravel: serviceArea.extendedTravel,
            travelCharge: serviceArea.travelCharge
          },
          ticketEligible: false,
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
        message: data.message || 'Thanks — we have your request. Rebel Tech will review it and follow up about the next step.'
      });
      setFormState({
        firstName:'', lastName:'', business:'', email:'', phone:'', customerType:'',
        need:'', description:'', contactPreference:'Either', address:'', website:''
      });
      setServiceArea(null);
      setTurnstileToken('');
      setTurnstileResetKey(value => value + 1);
    } catch (err) {
      setTurnstileToken('');
      setTurnstileResetKey(value => value + 1);
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

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
              <p className="muted">This starts a request with Rebel Tech. We review every online request before it becomes a scheduled service job. No appointment is assumed by submitting this form.</p>
            </div>
            <span className="api-badge">Secure intake</span>
          </div>

          <form onSubmit={submit} className="row g-3 mt-1" autoComplete="on">
            <div className="col-md-6"><label>First Name<input required autoComplete="given-name" value={formState.firstName} onChange={e=>update('firstName',e.target.value)} placeholder="First name" /></label></div>
            <div className="col-md-6"><label>Last Name<input required autoComplete="family-name" value={formState.lastName} onChange={e=>update('lastName',e.target.value)} placeholder="Last name" /></label></div>
            <div className="col-md-6"><label>Business / Organization<input autoComplete="organization" value={formState.business} onChange={e=>update('business',e.target.value)} placeholder="Optional" /></label></div>
            <div className="col-md-6"><label>Phone<input required type="tel" autoComplete="tel" value={formState.phone} onChange={e=>update('phone',e.target.value)} placeholder="(662) 281-2970" /></label></div>
            <div className="col-md-6"><label>Email<input required type="email" autoComplete="email" value={formState.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com" /></label></div>

            <div className="col-12 checkin-divider"><h3>Where will the service take place?</h3><p className="muted">Enter the address where you need Rebel Tech to perform the work. We’ll check the service area before you submit anything.</p></div>
            <div className="col-12">
              <label>Service Address
                <input
                  required
                  autoComplete="street-address"
                  value={formState.address}
                  onChange={e=>update('address',e.target.value)}
                  placeholder="Street address, city, state ZIP"
                  aria-describedby="service-area-status"
                />
              </label>
            </div>
            <div id="service-area-status" className="col-12">
              <ServiceAreaStatus result={serviceArea} customerType={formState.customerType} />
            </div>

            <div className="col-12 checkin-divider"><h3>What kind of help do you need?</h3></div>
            <div className="col-12">
              <div className="checkin-choice-grid">
                {Object.entries(paths).map(([key, path]) => (
                  <button key={key} type="button" className={`checkin-choice ${formState.customerType === key ? 'selected' : ''}`} onClick={()=>{ update('customerType',key); }}>
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
              <strong>What happens after you submit?</strong>
              <span>Rebel Tech reviews the request, confirms the job is a good fit, and checks scheduling before turning it into a service ticket/appointment.</span>
            </div>

            <div className="col-12 checkin-security-wrap">
              <div className="eyebrow">ONE LAST STEP</div>
              <p>Before we send anything to our service system, we verify that this is a real customer request.</p>
              <TurnstileGate key={turnstileResetKey} siteKey={turnstileSiteKey} token={turnstileToken} onToken={handleToken} />
            </div>

            <div className="col-12 d-flex align-items-center gap-3 flex-wrap">
              <Button type="submit" variant="contained" disabled={loading || Boolean(turnstileSiteKey && !turnstileToken)} className="mui-red-button">
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Send Service Request →'}
              </Button>
              {status.message && <div className={status.type === 'success' ? 'form-success' : 'form-error'}>{status.message}</div>}
            </div>
          </form>
        </div>

        <div className="schedule-placeholder">
          <div className="eyebrow">WHAT HAPPENS NEXT</div>
          <h3>We review it, then we talk.</h3>
          <p>For now, every online request comes to Rebel Tech for review. We confirm that we can take on the work and that the schedule makes sense before it becomes a service ticket or appointment.</p>
        </div>
      </div>
    </section>
  );
}
