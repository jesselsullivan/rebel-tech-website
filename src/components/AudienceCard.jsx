import { Link } from 'react-router-dom';

export default function AudienceCard({ audience }) {
  return (
    <article className="audience-card h-100">
      <div className="service-icon">{audience.icon}</div>
      <div className="eyebrow">{audience.eyebrow}</div>
      <h3>{audience.title}</h3>
      <p>{audience.text}</p>
      <Link to={`/services#${audience.id}`} className="service-link">{audience.learnMore} <span>→</span></Link>
    </article>
  );
}
