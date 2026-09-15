import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { capture } from '../../lib/posthogAnalytics.js';

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    capture('page_view', {
      route: location.pathname,
      search: location.search || undefined,
    });
  }, [location.pathname, location.search]);

  return null;
}
