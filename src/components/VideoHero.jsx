import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { siteConfig as site } from '../siteConfig';

export default function VideoHero() {
  return (
    <section className="hero">
      <video className="hero-video" autoPlay muted loop playsInline preload="metadata" poster={site.assets.hero} aria-hidden="true">
        <source src={site.video.mp4} type="video/mp4" />
      </video>
      <div className="hero-video-fallback" />
      <div className="hero-overlay" />
      <div className="container hero-inner">
        <div className="hero-art">
          <img src={site.assets.hero} alt="Rebel Tech Oxford technology services" />
        </div>
        <div className="hero-copy">
          <div className="mobile-hero-brand" aria-label="Rebel Tech">
            <span>REBEL</span> <b>TECH</b>
          </div>
          <div className="eyebrow">OXFORD, MISSISSIPPI • COMMERCIAL & RESIDENTIAL</div>
          <h1>TECH SOLUTIONS<br /><span>THAT WORK.</span></h1>
          <p>From networks to devices to smart spaces—we keep you connected.</p>
          <div className="hero-actions">
            <Button component={Link} to="/service-request" variant="contained" className="mui-red-button">
              Request Service →
            </Button>
            <Button component={Link} to="/services" variant="outlined" className="mui-outline-button">
              Our Services
            </Button>
          </div>
          <div className="hero-meta">
            <a href={`tel:${site.phone}`}>☎ {site.phoneDisplay}</a>
            <span>⌖ {site.city}</span>
          </div>
        </div>
      </div>
    </section>
  );
}