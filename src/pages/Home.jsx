import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { siteConfig as site } from '../siteConfig';
import SectionTitle from '../components/SectionTitle';
import AudienceCard from '../components/AudienceCard';
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
            text="Whether you are building a business, fixing a device, or trying to make your technology work together, Rebel Tech can help."
          />
          <div className="row g-4">
            {site.audiences.map(audience => (
              <div className="col-12 col-lg-4" key={audience.id}>
                <AudienceCard audience={audience} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section scope-section">
        <div className="container">
          <div className="scope-box">
            <div>
              <div className="eyebrow">TECH DISTRESS?</div>
              <h2>Not sure where your problem fits?</h2>
              <p>That's okay. You do not need to know the right technical term or pick the perfect service. Tell us what is going on and we will help figure out the right solution.</p>
            </div>
            <Button component={Link} to="/service-request" variant="contained" className="mui-red-button">Tell Us What's Going On →</Button>
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
