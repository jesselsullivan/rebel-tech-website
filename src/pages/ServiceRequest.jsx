import { useEffect, useState } from 'react';
import { siteConfig as site } from '../siteConfig';
import SectionTitle from '../components/SectionTitle';

export default function ServiceRequest(){
  const [forms,setForms]=useState([]); const [status,setStatus]=useState('');
  useEffect(()=>{fetch('/api/repairshopr/forms').then(r=>r.json()).then(d=>setForms(d.forms||[])).catch(()=>{});},[]);
  return <section className="page"><div className="container narrow"><SectionTitle eyebrow="CUSTOMER SERVICE" title="Request Service" text="Start a service request online or sign in to your Rebel Tech customer portal."/>
    <div className="portal-card"><div><div className="eyebrow">REPAIRSHOPR CUSTOMER PORTAL</div><h2>Already a customer?</h2><p>Use the portal to view tickets, communicate with Rebel Tech, and keep up with your service history.</p></div><a className="btn btn-red" href={site.repairShopr.portalUrl} target="_blank" rel="noreferrer">Open Customer Portal ↗</a></div>
    <div className="request-card"><h2>New Service Request</h2><p className="muted">The website is ready for a RepairShopr New Ticket Form. Once you create one in RepairShopr, add its form ID to the site's configuration and this page can be wired directly to it.</p>{forms.length>0 ? <p className="success">RepairShopr form connection detected. Available forms: {forms.map(f=>f.name||f.id).join(', ')}</p> : <p className="notice">No RepairShopr Ticket Form is configured yet. The customer portal above is ready to use now.</p>}<form onSubmit={e=>{e.preventDefault();setStatus('The direct ticket form is not enabled until a RepairShopr Ticket Form ID is configured. Please use the customer portal for now.')}}><label>Name<input required name="name" placeholder="Your name" /></label><label>Email<input required type="email" name="email" placeholder="you@example.com" /></label><label>Phone<input name="phone" placeholder="(662) 555-1234" /></label><label>What do you need help with?<textarea required name="description" rows="5" placeholder="Tell us about the issue or project..." /></label><button className="btn btn-red" type="submit">Continue Request</button></form>{status&&<p className="notice">{status}</p>}</div>
  </div></section>
}
