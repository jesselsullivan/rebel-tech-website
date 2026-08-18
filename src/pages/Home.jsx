import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { siteConfig as site } from '../siteConfig';
import SectionTitle from '../components/SectionTitle';
import ServiceCard from '../components/ServiceCard';
import VideoHero from '../components/VideoHero';

export default function Home() {
  return (
    <>
      <VideoHero />

      <section className="trust-strip">
        <div>✓ LOCAL & RELIABLE</div>
        <div>✓ COMMERCIAL & RESIDENTIAL</div>
        <div>✓ QUALITY WORK</div>
        <div>✓ FAST RESPONSE</div>
      </section>

      <section className="section services-section">
        <div className="container">
          <SectionTitle
            eyebrow="WHAT WE DO"
            title="Technology, without the headache."
            text="From structured cabling to device repair and smart-home technology, Rebel Tech brings the pieces together."
          />
          <div className="row g-4">
            {site.services.map(service => (
              <div className="col-12 col-md-6 col-xl-3" key={service.title}>
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <div className="eyebrow">WHY REBEL TECH?</div>
              <h2>Professional technology.<br /><span>Local service.</span></h2>
              <p>We solve the problem in front of us, explain the options clearly, and build systems that are reliable and maintainable.</p>
              <ul className="check-list">
                <li>Professional installations</li>
                <li>Honest, transparent service</li>
                <li>Quality products and workmanship</li>
                <li>Local Oxford, Mississippi business</li>
              </ul>
              <Button component={Link} to="/about" variant="contained" className="mui-red-button">About Rebel Tech</Button>
            </div>
            <div className="col-lg-7">
              <div className="van-showcase">
                <img src={site.assets.van} alt="Rebel Tech Ford Transit service van" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="area-section">
        <div className="container">
          <div className="area-box">
            <div>
              <div className="eyebrow">LOCAL SERVICE</div>
              <h2>Oxford & surrounding areas</h2>
              <p>Based in Oxford, Mississippi, Rebel Tech serves residential and commercial customers throughout the surrounding area.</p>
            </div>
            <Button component={Link} to="/contact" variant="contained" className="mui-navy-button">Get In Touch</Button>
          </div>
        </div>
      </section>
    </>
  );
}