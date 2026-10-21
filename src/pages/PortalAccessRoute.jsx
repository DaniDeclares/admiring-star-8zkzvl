import React from 'react';
import { useLocation } from 'react-router-dom';
import PortalAccessPage from './PortalAccessPage.jsx';

// Different audiences and invitations must not inherit a previous signup form.
export default function PortalAccessRoute() {
  const { pathname, search } = useLocation();
  return <PortalAccessPage key={`${pathname}${search}`} />;
}
