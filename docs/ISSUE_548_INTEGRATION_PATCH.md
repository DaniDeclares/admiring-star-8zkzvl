# #548 governed service picker — page integration

The governed selector and tests now exist on this branch. The remaining page edit is intentionally bounded to three insertions in `src/pages/RequestServicePage.jsx`; no catalog, price, or service is hard-coded.

1. Import:
```js
import GovernedServicePicker from '../components/GovernedServicePicker';
```

2. Add the page callback beside `selectVariant`:
```js
const selectGovernedService=next=>{
 setSelected(next||null);
 setForm(f=>({...f,serviceId:next?.serviceId||'',frontDoorCode:next?.ch01FrontDoorCode||f.frontDoorCode}));
};
```

3. Immediately after the customer-type selector, render:
```jsx
<GovernedServicePicker
 services={services}
 channelType={form.channelType}
 frontDoorCode={form.frontDoorCode}
 selectedServiceId={form.serviceId}
 onSelect={selectGovernedService}
/>
```

The generic request path remains available because an empty picker selection keeps `serviceId=''`. The existing server-side `/api/verify-commercial-intent` POST remains authoritative before `pricingServiceId` is accepted by intake.
