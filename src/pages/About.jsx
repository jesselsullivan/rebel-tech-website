import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { siteConfig as site } from '../siteConfig';

export default function About() {
  return (
    <section className="page">
      <div className="container about">
        <div className="eyebrow">ABOUT REBEL TECH</div>
        <h1>Local technology.<br /><span>Professional service.</span></h1>
        <p className="lead">Rebel Tech is an Oxford, Mississippi technology services business focused on low-voltage and network infrastructure, computer and phone repair, AV installation, smart-home integration, automation, and commercial and residential technology services.</p>
        <div className="about-van"><img src={site.assets.van} alt="Rebel Tech service van" /></div>
        <div className="row g-5 about-columns">
          <div className="col-md-6"><h2>Our approach</h2><p>We solve the problem in front of us, explain the options clearly, and build systems that are reliable and maintainable.</p></div>
          <div className="col-md-6"><h2>Connect. Repair. Install.</h2><p>Whether you need a network cable run, a device repaired, a display installed, or your home technology tied together, Rebel Tech is built to handle it.</p></div>
        </div>
        <Button component={Link} to="/service-request" variant="contained" className="mui-red-button">Start a Service Request</Button>
      </div>
    </section>
  );
}