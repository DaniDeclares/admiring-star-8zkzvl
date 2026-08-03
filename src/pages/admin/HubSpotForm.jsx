// filename: src/components/HubSpotForm.jsx
import React, { useEffect } from 'react';

export default function HubSpotForm({ region = "na2", portalId = "242764935", formId = "d4cd290e-7766-4bf5-91a2-c1274ddd882e" }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//js.hsforms.net/forms/v2.js';
    script.async = true;
    script.onload = () => {
      if (window.hbspt) {
        window.hbspt.forms.create({
          region,
          portalId,
          formId,
          target: '#hubspot-form-container'
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [region, portalId, formId]);

  return <div id="hubspot-form-container" style={{ minHeight: '250px' }}></div>;
}
