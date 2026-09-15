import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { capture } from '../../lib/posthogAnalytics.js';

const labelFor = (element) => {
  if (!element) return '';
  return (element.getAttribute('aria-label') || element.textContent || '').trim().slice(0, 120);
};

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    capture('page_view', {
      route: location.pathname,
      search: location.search || undefined,
    });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onClick = (event) => {
      const target = event.target instanceof Element ? event.target.closest('a,button,[role="button"]') : null;
      if (!target) return;
      const href = target.getAttribute('href') || '';
      const label = labelFor(target);
      const isCta = target.matches('a[href],button,[role="button"]') && (target.matches('a[href*="request"],a[href*="portal"],a[href*="providers"],button') || /apply|request|book|quote|checkout|contact|start|join|learn more|get started/i.test(label));
      if (!isCta) return;
      capture('cta_click', {
        route: location.pathname,
        target: href || target.tagName.toLowerCase(),
        label,
      });
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [location.pathname]);

  return null;
}
