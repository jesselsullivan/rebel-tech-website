import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { siteConfig as site } from '../siteConfig';
import SectionTitle from '../components/SectionTitle';
import ServiceCard from '../components/ServiceCard';

export default function Services() {
  return (
    <section className="page">
      <div className="container">
        <SectionTitle eyebrow="REBEL TECH" title="Services" text="Technology services for homes, businesses, and everything in between." />
        <div className="row g-4">
          {site.services.map(service => (
            <div className="col-12 col-md-6" key={service.title}>
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
        <div className="cta-card mt-5">
          <div>
            <h2>Need something not listed?</h2>
            <p>Tell us what you're trying to accomplish and we'll help figure out the right solution.</p>
          </div>
          <Button component={Link} to="/service-request" variant="contained" className="mui-red-button">Request Service</Button>
        </div>
      </div>
    </section>
  );
}