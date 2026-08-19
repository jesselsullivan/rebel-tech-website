import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { siteConfig as site } from '../siteConfig';
import SectionTitle from '../components/SectionTitle';
import ServiceCard from '../components/ServiceCard';

function AudienceDetail({ audience }) {
  return (
    <section id={audience.id} className="audience-detail">
      <div className="audience-detail-heading">
        <div className="service-icon">{audience.icon}</div>
        <div>
          <div className="eyebrow">{audience.eyebrow}</div>
          <h2>{audience.title}</h2>
        </div>
      </div>
      <p className="audience-detail-intro">{audience.text}</p>
      <div className="row g-3">
        {audience.details.map((detail, index) => (
          <div className="col-12 col-md-6" key={index}>
            <div className="detail-point"><span>✓</span><p>{detail}</p></div>
          </div>
        ))}
      </div>
      <Button component={Link} to="/service-request" variant="contained" className="mui-red-button">Talk To Rebel Tech →</Button>
    </section>
  );
}

export default function Services() {
  return (
    <section className="page">
      <div className="container">
        <SectionTitle
          eyebrow="REBEL TECH"
          title="Tech help for just about everyone."
          text="You do not have to know exactly what you need before you call. We work with businesses, residents, and anyone who needs technology to connect, work, or make life easier."
        />

        <div className="row g-4">
          {site.services.map(service => (
            <div className="col-12 col-md-6" key={service.title}>
              <ServiceCard service={service} />
            </div>
          ))}
        </div>

        <div className="audience-details">
          {site.audiences.map(audience => <AudienceDetail audience={audience} key={audience.id} />)}
        </div>

        <div className="cta-card mt-5">
          <div>
            <h2>Need something not listed?</h2>
            <p>Tell us what you're trying to accomplish—or what is broken—and we'll help figure out the right solution.</p>
          </div>
          <Button component={Link} to="/service-request" variant="contained" className="mui-red-button">Request Service</Button>
        </div>
      </div>
    </section>
  );
}
