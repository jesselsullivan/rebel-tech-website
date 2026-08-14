export default function SectionTitle({ eyebrow, title, text }) {
  return <div className="section-title"><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}
