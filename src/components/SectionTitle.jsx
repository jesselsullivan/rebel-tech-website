export default function SectionTitle({ eyebrow, title, text, light=false }) {
  return (
    <div className={`section-title ${light ? 'light' : ''}`}>
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}