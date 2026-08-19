import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { siteConfig as site } from './siteConfig';
import Brand from './components/Brand';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceRequest from './pages/ServiceRequest';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';
import RouteManager from './components/RouteManager';

function Header() {
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    if (menuRef.current) menuRef.current.open = false;
  }, [location.pathname]);

  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Brand />
        <nav className="desktop-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        <div className="header-actions">
          <a className="phone-link" href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
          <NavLink className="btn btn-red" to="/service-request">Request Service</NavLink>
        </div>
        <details ref={menuRef} className="mobile-menu">
          <summary>☰</summary>
          <div className="mobile-menu-panel">
            <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
            <NavLink to="/services" onClick={closeMenu}>Services</NavLink>
            <NavLink to="/about" onClick={closeMenu}>About</NavLink>
            <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
            <a href={`tel:${site.phone}`} onClick={closeMenu}>{site.phoneDisplay}</a>
          </div>
        </details>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Brand compact />
          <p>Technology solutions for homes and businesses in Oxford, Mississippi and surrounding areas.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </div>
        <div>
          <h4>Contact</h4>
          <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
          <p>{site.city}<br />{site.serviceArea}</p>
          <div className="footer-hours">
            <strong>Hours</strong>
            <span>Mon–Fri: 9 AM–4 PM</span>
            <span>Saturday: 9 AM–2 PM</span>
            <span>Sunday: Closed</span>
          </div>
          <a href={site.repairShopr.portalUrl} target="_blank" rel="noreferrer">Customer Portal ↗</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{site.tagline}</span>
        <span>© {new Date().getFullYear()} {site.businessName}</span>
      </div>
    </footer>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <>
      <Header />
      <RouteManager />
      <main key={location.pathname} className="route-transition">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/service-request" element={<ServiceRequest />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}