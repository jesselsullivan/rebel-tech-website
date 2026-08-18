import { Link } from 'react-router-dom';
import { siteConfig as site } from '../siteConfig';

export default function Brand({ compact=false }) {
  return (
    <Link className={`brand ${compact ? 'brand-compact' : ''}`} to="/" aria-label="Rebel Tech home">
      <img src={site.assets.icon} alt="" />
      <span>REBEL <b>TECH</b></span>
    </Link>
  );
}