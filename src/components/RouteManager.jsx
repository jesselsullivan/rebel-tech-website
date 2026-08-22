import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const routeMeta = {
  '/': {
    title: 'Rebel Tech Oxford | Connect. Repair. Install.',
    description: 'Rebel Tech Oxford provides networking, computer and phone repair, AV and smart-home installation, custom PCs and servers, and business technology services.'
  },
  '/services': {
    title: 'Technology Services in Oxford, MS | Rebel Tech',
    description: 'Explore Rebel Tech services in Oxford, Mississippi: network infrastructure, repairs, AV, smart-home integration, custom PCs, servers, and business hardware.'
  },
  '/service-request': {
    title: 'Customer Check-In | Rebel Tech Oxford',
    description: 'Start a service request with Rebel Tech for residential or business technology, repairs, networking, installations, custom PCs, servers, and more.'
  },
  '/contact': {
    title: 'Contact Rebel Tech Oxford | Technology Services',
    description: 'Contact Rebel Tech in Oxford, Mississippi for technology repairs, networking, installations, custom computers, business hardware, and other technology needs.'
  },
  '/about': {
    title: 'About Rebel Tech Oxford | Local Technology Services',
    description: 'Learn about Rebel Tech Oxford, a local technology services business providing professional networking, repair, installation, and business and residential technology support.'
  }
};

export default function RouteManager() {
  const location = useLocation();
  const firstRender = useRef(true);

  useLayoutEffect(() => {
    const meta = routeMeta[location.pathname] || {
      title: 'Rebel Tech Oxford | Technology Services',
      description: 'Professional technology services for homes and businesses in Oxford, Mississippi.'
    };
    document.title = meta.title;

    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    description.setAttribute('content', meta.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://rebeltechoxford.com${location.pathname === '/' ? '/' : location.pathname}`);

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
