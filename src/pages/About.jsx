import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { siteConfig as site } from '../siteConfig';
import { useRef } from 'react';

const portfolio = [
  { title: 'Network Infrastructure', text: 'Structured cabling, rack builds, Wi-Fi, and network design.', image: '/assets/portfolio/portfolio-1.jpg' },
  { title: 'Home Theater & AV', text: 'Clean audio/video installations built around how you actually use the space.', image: '/assets/portfolio/portfolio-2.jpg' },
  { title: 'Wi-Fi Solutions', text: 'Reliable wireless coverage designed for the whole property.', image: '/assets/portfolio/portfolio-3.jpg' },
  { title: 'Security & Cameras', text: 'Smart surveillance, access control, and connected security technology.', image: '/assets/portfolio/portfolio-4.jpg' },
  { title: 'Smart Home Integration', text: 'Bring lighting, climate, entertainment, and devices together.', image: '/assets/portfolio/portfolio-5.jpg' },
  { title: 'Business Technology', text: 'Workstations, infrastructure, displays, and technology systems that keep business moving.', image: '/assets/portfolio/portfolio-6.jpg' }
];

export default function About() {
  const carouselRef = useRef(null);
  const scroll = (direction) => carouselRef.current?.scrollBy({ left: direction * 360, behavior: 'smooth' });

  return (
    <section className="page">
      <div className="container about">
        <div className="eyebrow">ABOUT REBEL TECH</div>
        <h1>Local technology.<br /><span>Professional service.</span></h1>
        <p className="lead">Rebel Tech is an Oxford, Mississippi technology services business focused on low-voltage and network infrastructure, computer and phone repair, AV installation, smart-home integration, automation, and commercial and residential technology services.</p>

        <div className="about-portfolio">
          <div className="about-portfolio-heading">
            <div>
              <div className="eyebrow">WHAT WE DO</div>
              <h2>Technology work, done right.</h2>
              <p className="muted">A look at the kinds of systems, installations, and repairs Rebel Tech can help with.</p>
            </div>
            <div className="portfolio-controls" aria-label="Portfolio carousel controls">
              <button type="button" onClick={() => scroll(-1)} aria-label="Previous projects">‹</button>
              <button type="button" onClick={() => scroll(1)} aria-label="Next projects">›</button>
            </div>
          </div>

          <div className="about-portfolio-track" ref={carouselRef}>
            {portfolio.map((item) => (
              <article className="portfolio-card" key={item.title}>
                <div className="portfolio-image-wrap">
                  <img src={item.image} alt="" loading="lazy" />
                  <span className="portfolio-concept">Representative example</span>
                </div>
                <div className="portfolio-card-body">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="row g-5 about-columns">
          <div className="col-md-6"><h2>Our approach</h2><p>We solve the problem in front of us, explain the options clearly, and build systems that are reliable and maintainable.</p></div>
          <div className="col-md-6"><h2>Connect. Repair. Install.</h2><p>Whether you need a network cable run, a device repaired, a display installed, or your home technology tied together, Rebel Tech is built to handle it.</p></div>
        </div>
        <Button component={Link} to="/service-request" variant="contained" className="mui-red-button">Start a Service Request</Button>
      </div>
    </section>
  );
}
