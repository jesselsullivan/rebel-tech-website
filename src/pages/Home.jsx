import { Link } from 'react-router-dom';
import { siteConfig as site } from '../siteConfig';
import SectionTitle from '../components/SectionTitle';

export default function Home() {
  return <>
    <section className="hero">
      <div className="hero-art"><img src={site.assets.hero} alt="Rebel Tech technology and Oxford, Mississippi branding" /></div>
      <div className="hero-copy">
        <div className="eyebrow">OXFORD, MISSISSIPPI</div>
        <h1>CONNECT.<br />REPAIR.<br /><span>INSTALL.</span></h1>
        <p>Technology solutions that work for your home and business.</p>
        <div className="hero-buttons"><Link className="btn btn-red" to="/service-request">Request Service</Link><Link className="btn btn-outline" to="/services">View Services</Link></div>
        <div className="hero-meta"><a href={`tel:${site.phone}`}>☎ {site.phoneDisplay}</a><span>⌖ {site.city}</span></div>
      </div>
    </section>

    <section className="trust-strip"><div>✓ LOCAL &amp; RELIABLE</div><div>✓ COMMERCIAL &amp; RESIDENTIAL</div><div>✓ QUALITY WORK</div><div>✓ FAST RESPONSE</div></section>

    <section className="section"><div className="container"><SectionTitle eyebrow="WHAT WE DO" title="Our Services" text="From structured cabling to device repair and smart-home technology, Rebel Tech brings the pieces together." /><div className="service-grid">{site.services.map(s => <article className="service-card" key={s.title}><div className="service-icon">{s.icon}</div><h3>{s.title}</h3><p>{s.text}</p><Link to="/services">Learn More →</Link></article>)}</div></div></section>

    <section className="navy-section"><div className="container split"><div><div className="eyebrow">WHY REBEL TECH?</div><h2>Technology done right.</h2><p>We focus on practical, dependable technology solutions—not unnecessary complexity.</p><ul className="check-list"><li>Professional installations</li><li>Honest, transparent service</li><li>Quality products and workmanship</li><li>Local Oxford, Mississippi business</li></ul><Link className="btn btn-red" to="/about">About Rebel Tech</Link></div><img className="van-image" src={site.assets.van} alt="Rebel Tech service van" /></div></section>

    <section className="section area-section"><div className="container area-box"><div><div className="eyebrow">LOCAL SERVICE</div><h2>Oxford &amp; surrounding areas</h2><p>Based in Oxford, Mississippi, Rebel Tech serves residential and commercial customers throughout the surrounding area.</p></div><Link className="btn btn-navy" to="/contact">Get In Touch</Link></div></section>
  </>;
}
