import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles = {
  '/': 'Rebel Tech Oxford | Connect. Repair. Install.',
  '/services': 'Services | Rebel Tech Oxford',
  '/service-request': 'Request Service | Rebel Tech Oxford',
  '/contact': 'Contact | Rebel Tech Oxford',
  '/about': 'About | Rebel Tech Oxford'
};

export default function RouteManager() {
  const location = useLocation();
  const firstRender = useRef(true);

  useLayoutEffect(() => {
    document.title = routeTitles[location.pathname] || 'Rebel Tech Oxford | Tech Solutions That Work.';

    const scrollToTarget = () => {
      if (location.hash) {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) {
          const header = document.querySelector('.site-header');
          const offset = (header?.getBoundingClientRect().height || 0) + 18;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: Math.max(0, top), behavior: firstRender.current ? 'auto' : 'smooth' });
          firstRender.current = false;
          return true;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      firstRender.current = false;
      return false;
    };

    if (!scrollToTarget() && location.hash) {
      const frame = requestAnimationFrame(scrollToTarget);
      return () => cancelAnimationFrame(frame);
    }
  }, [location.pathname, location.hash]);

  return null;
}
