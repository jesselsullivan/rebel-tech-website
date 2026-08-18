import { Link } from 'react-router-dom';

export default function ServiceCard({ service }) {
  return (
    <article className="service-card h-100">
      <div className="service-icon">{service.icon}</div>
      <h3>{service.title}</h3>
      <p>{service.text}</p>
      <Link to="/services" className="service-link">Learn More <span>→</span></Link>
    </article>
  );
}