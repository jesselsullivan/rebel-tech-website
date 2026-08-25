import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { siteConfig as site } from '../siteConfig';
import SectionTitle from '../components/SectionTitle';

export default function Contact() {
  const [state,setState]=useState({name:'',email:'',phone:'',description:''});
  const [status,setStatus]=useState({type:'',message:''});
  const [loading,setLoading]=useState(false);

  const submit=async e=>{
    e.preventDefault(); setLoading(true); setStatus({type:'',message:''});
    try{
      const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:state.name,email:state.email,phone:state.phone,message:state.description})});
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text || 'The server returned an invalid response.' }; }
      if(!res.ok) throw new Error(data.error||'Unable to send message.');
      setStatus({type:'success',message:'Thanks! Your message has been sent.'}); setState({name:'',email:'',phone:'',description:''});
    }catch(err){setStatus({type:'error',message:err.message});}finally{setLoading(false);}
  };

  return <section className="page">
    <div className="container">
      <SectionTitle eyebrow="GET IN TOUCH" title="Contact Rebel Tech" text="Have a question, project, or repair? Give us a call or send a message." />
      <div className="row g-4 contact-grid">
        <div className="col-lg-5"><div className="contact-info"><h2>Let's talk tech.</h2><p>For the fastest response, call or start a service request.</p><a className="big-phone" href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
          <div className="info-row"><b>Email</b><a href={`mailto:${site.email}`}>{site.email}</a></div>
          <div className="info-row"><b>Facebook</b><a href={site.facebook} target="_blank" rel="noreferrer">Rebel Tech on Facebook ↗</a></div>
          <div className="info-row"><b>Location</b><span>{site.city}<br />{site.serviceArea}</span></div><div className="info-row"><b>Hours</b><span>Mon–Fri: 9 AM–4 PM<br />Saturday: 9 AM–2 PM<br />Sunday: Closed</span></div><div className="info-row"><b>Customer Portal</b><a href={site.customerPortal.url} target="_blank" rel="noreferrer">Open Customer Portal ↗</a></div></div></div>
        <div className="col-lg-7"><form className="contact-form" onSubmit={submit}><h2>Send a Message</h2><div className="row g-3"><div className="col-md-6"><label>Name<input required value={state.name} onChange={e=>setState({...state,name:e.target.value})}/></label></div><div className="col-md-6"><label>Email<input required type="email" value={state.email} onChange={e=>setState({...state,email:e.target.value})}/></label></div><div className="col-md-6"><label>Phone<input value={state.phone} onChange={e=>setState({...state,phone:e.target.value})}/></label></div><div className="col-12"><label>Message<textarea required rows="6" value={state.description} onChange={e=>setState({...state,description:e.target.value})}/></label></div></div><Button type="submit" variant="contained" disabled={loading} className="mui-red-button">{loading?<CircularProgress size={20} color="inherit"/>:'Send Message'}</Button>{status.message&&<div className={status.type==='success'?'form-success':'form-error'}>{status.message}</div>}</form></div>
      </div>
    </div>
  </section>;
}