import { NavLink, Route, Routes } from 'react-router-dom';
import { siteConfig as site } from './siteConfig';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceRequest from './pages/ServiceRequest';
import Contact from './pages/Contact';
import About from './pages/About';

function Header() {
  return <header className="site-header">
    <div className="container nav-wrap">
      <NavLink className="brand" to="/" aria-label="Rebel Tech home">
        <img src={site.assets.icon} alt="Rebel Tech" />
        <span>REBEL <b>TECH</b></span>
      </NavLink>
      <nav className="desktop-nav">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/services">Services</NavLink>
        <NavLink to="/service-request">Service Request</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>
      <div className="header-actions">
        <a className="phone-link" href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
        <NavLink className="btn btn-red" to="/service-request">Request Service</NavLink>
      </div>
      <details className="mobile-menu">
        <summary>☰</summary>
        <div className="mobile-menu-panel">
          <NavLink to="/" end>Home</NavLink><NavLink to="/services">Services</NavLink><NavLink to="/service-request">Service Request</NavLink><NavLink to="/about">About</NavLink><NavLink to="/contact">Contact</NavLink>
          <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
        </div>
      </details>
    </div>
  </header>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div><img className="footer-icon" src={site.assets.icon} alt="" /><h3>REBEL <span>TECH</span></h3><p>Technology solutions for homes and businesses in Oxford, Mississippi and surrounding areas.</p></div>
      <div><h4>Quick Links</h4><NavLink to="/services">Services</NavLink><NavLink to="/service-request">Service Request</NavLink><NavLink to="/about">About</NavLink><NavLink to="/contact">Contact</NavLink></div>
      <div><h4>Contact</h4><a href={`tel:${site.phone}`}>{site.phoneDisplay}</a><p>{site.city}<br />{site.serviceArea}</p><a href={site.repairShopr.portalUrl} target="_blank" rel="noreferrer">Customer Portal ↗</a></div>
    </div>
    <div className="footer-bottom"><span>{site.tagline}</span><span>© {new Date().getFullYear()} {site.businessName}</span></div>
  </footer>;
}

export default function App() {
  return <><Header /><main><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/services" element={<Services />} />
    <Route path="/service-request" element={<ServiceRequest />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/about" element={<About />} />
  </Routes></main><Footer /></>;
}
