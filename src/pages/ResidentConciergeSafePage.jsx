import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const PHONE = '14704857173';

const CATALOG = [
  { cat: 'snacks', label: 'Snacks', heading: 'Snack Delivery', sub: 'Build-your-own combos, delivered to your door with a secure building pin code.', items: [
    { id: 'snack-spicy', name: '"Hot & Cold" Spicy Combo', desc: '1 bag hot chips (Takis/Cheetos) + 1 ice-cold soda + 1 freeze pop.', variants: [{ label: '', price: 3 }] },
    { id: 'snack-sweet', name: '"Sweet & Salty" Pack', desc: "1 classic chip bag (Doritos/Lay's) + 1 full-size candy bar + 1 HUG barrel.", variants: [{ label: '', price: 3 }] },
    { id: 'snack-gamer', name: '"Gamer" Power Pack', desc: '1 bottled Gatorade + 2 individual chip bags + 1 full-size candy or chewy pack.', variants: [{ label: '', price: 5 }] },
    { id: 'snack-movie', name: '"Family Movie Night" Mega Bundle', desc: '4 chip bags + 4 ice-cold drinks + 4 full-size candies. Free delivery included.', variants: [{ label: '', price: 10 }] },
  ] },
  { cat: 'cleaning', label: 'Cleaning', heading: 'Cleaning, Deep Resets & Turnovers', sub: 'Base rates anchored to a standard 2-Bed / 2-Bath (up to 1,100 sq. ft.); pricing adjusts by footprint at booking.', items: [
    { id: 'clean-refresh', name: 'Resident Refresh — Standard Maintenance Clean', desc: 'Surface dusting, floor vacuuming, kitchen mopping, appliance polishing, trash staging.', variants: [{ label: '1-Bed / 1-Bath', price: 85 }, { label: '2-Bed / 2-Bath', price: 127.5 }, { label: '3-Bed / 2-Bath', price: 212.5 }, { label: '4-Bed / 3-Bath', price: 318.75 }] },
    { id: 'clean-deep', name: 'Deep Structural Reset', desc: 'Steam-injected grout & baseboard detailing, paired with HEPA air purifying runs.', variants: [{ label: '1-Bed / 1-Bath', price: 233.75 }, { label: '2-Bed / 2-Bath', price: 276.25 }, { label: '3-Bed / 2-Bath', price: 361.25 }, { label: '4-Bed / 3-Bath', price: 467.5 }] },
    { id: 'clean-moveout', name: 'Deposit Security Move-Out Turn', desc: 'Complete deep scrub of empty cabinets, drawers, appliances, and interior window glass.', variants: [{ label: '1-Bed / 1-Bath', price: 280.5 }, { label: '2-Bed / 2-Bath', price: 323 }, { label: '3-Bed / 2-Bath', price: 408 }, { label: '4-Bed / 3-Bath', price: 514.25 }], note: 'Severe pet mess or heavy soil: +$150.00 flat, applied before the resident discount.' },
  ] },
  { cat: 'laundry', label: 'Laundry & Home', heading: 'Valet Laundry & Home Organization', sub: '', items: [
    { id: 'laundry-valet', name: 'Valet Wash, Dry & Fold', desc: 'Sorting, premium laundering, machine drying, crisp folding in matching hampers. 2-basket minimum.', unit: '/ basket', variants: [{ label: '', price: 38.25 }] },
    { id: 'laundry-linen', name: 'Linen & Bedding Reset Loop', desc: 'Full strip, launder, mattress sanitization vacuuming, hospital-corner re-making.', unit: '/ bed', variants: [{ label: '', price: 29.75 }] },
    { id: 'org-closet', name: 'Closet & Wardrobe Optimization Matrix', desc: 'Closet editing, seasonal rotation, color-coordinated hanging. 3-hour minimum.', unit: '/ hr', variants: [{ label: '', price: 38.25 }] },
    { id: 'org-pantry', name: 'Culinary Pantry & Kitchen Cabinet Organization', desc: 'Expiration audits, shelf washing, bulk decanting. Up to 10 cabinets/shelves.', variants: [{ label: '', price: 127.5 }] },
    { id: 'org-estate', name: 'Estate Liquidation & Decluttering', desc: 'Hourly rate plus disposal fees. Availability may vary by state licensing.', unit: '/ hr', variants: [{ label: '', price: 55.25 }] },
  ] },
  { cat: 'memberships', label: 'Memberships', heading: 'Monthly Lifestyle Subscriptions', sub: 'Recurring plans billed monthly.', items: [
    { id: 'mem-b', name: 'Package B — Executive Home & Wardrobe Care', desc: 'Bi-weekly cleaning (2/mo), 2 laundry baskets/mo, 1 Linen Reset Loop.', unit: '/ mo', variants: [{ label: '1-Bed', price: 238 }, { label: '2-Bed', price: 263.5 }, { label: '3-Bed', price: 314.5 }, { label: '4-Bed', price: 365.5 }] },
    { id: 'mem-c', name: 'Package C — Ultimate Turnkey Household Care', desc: 'Weekly cleaning (4/mo), 4 laundry baskets/mo, 2 Reset Loops, quarterly Closet/Pantry Matrix.', unit: '/ mo', variants: [{ label: '1-Bed', price: 442 }, { label: '2-Bed', price: 467.5 }, { label: '3-Bed', price: 518.5 }, { label: '4-Bed', price: 569.5 }] },
    { id: 'mem-pet', name: 'Pampered Pet — Care & Cleaning Bundle', desc: '2 Resident Refresh visits/mo, 1 Pet Hair & Odor Extraction/mo, 4 midday dog walks/mo.', unit: '/ mo', note: 'Requires signed Pet Liability Waiver.', variants: [{ label: '1-Bed', price: 208.25 }, { label: '2-Bed', price: 233.75 }, { label: '3-Bed', price: 284.75 }, { label: '4-Bed', price: 335.75 }] },
    { id: 'mem-nomad', name: 'Digital Nomad — Co-Working & Reset Suite', desc: '1 Resident Refresh visit/mo, 2 laundry baskets/mo, 1 branded apparel or print-run credit/mo.', unit: '/ mo', variants: [{ label: '1-Bed', price: 153 }, { label: '2-Bed', price: 178.5 }, { label: '3-Bed', price: 229.5 }, { label: '4-Bed', price: 280.5 }] },
    { id: 'mem-move', name: 'On-The-Move — Roadside & Valet Package', desc: '1 Resident Refresh visit/mo, 2 priority roadside dispatches/mo, mobile tire plugs on-site.', unit: '/ mo', note: 'Valid for one registered vehicle.', variants: [{ label: '1-Bed', price: 131.75 }, { label: '2-Bed', price: 157.25 }, { label: '3-Bed', price: 208.25 }, { label: '4-Bed', price: 259.25 }] },
    { id: 'mem-deposit', name: 'Squeaky Clean Security Deposit — One-Time Flat', desc: 'Full deposit-protection package, one-time flat rate.', variants: [{ label: '1-Bed', price: 335.75 }, { label: '2-Bed', price: 361.25 }, { label: '3-Bed', price: 412.25 }, { label: '4-Bed', price: 463.25 }] },
  ] },
  { cat: 'notary', label: 'Notary', heading: 'Mobile Notary & Document Signings', sub: 'Georgia law caps the notarial act fee at $2.00; rates below include that statutory fee plus concierge intake, document administration, and witness services. Dani Declares LLC does not draft legal documents, provide legal advice, or determine which document a resident should use.', items: [
    { id: 'not-general', name: 'General Notary Work', desc: 'Per act, plus travel dispatch.', variants: [{ label: '', price: 10.2 }], note: '+ travel dispatch fee finalized at booking' },
    { id: 'not-loan', name: 'Mobile Loan Signings & Mortgage Closings', desc: '', variants: [{ label: '', price: 127.5 }] },
    { id: 'not-apostille', name: 'Apostille Document Authentication', desc: '', variants: [{ label: '', price: 148.75 }] },
    { id: 'not-poa', name: 'Power of Attorney & Healthcare Proxy — Notarization', desc: "Witnessing your signature on documents you provide; we don't draft or advise on content.", variants: [{ label: '', price: 29.75 }], note: '+ travel' },
    { id: 'not-emergency', name: 'Emergency Notarization Dispatch', desc: 'Advance directives & living wills — signature-witnessing dispatch only.', variants: [{ label: '', price: 80.75 }] },
    { id: 'not-family', name: 'Family Law & Custody Documents', desc: '', variants: [{ label: '', price: 63.75 }] },
    { id: 'not-title', name: 'Motor Vehicle Title Transfers', desc: '', variants: [{ label: '', price: 42.5 }] },
    { id: 'not-safe', name: 'Financial Safety Deposit Box Verification', desc: '', variants: [{ label: '', price: 106.25 }] },
    { id: 'not-affidavit', name: 'School, Residency & Financial Affidavits', desc: '', variants: [{ label: '', price: 38.25 }] },
    { id: 'not-witness', name: 'Witness Services', desc: '', unit: '/ witness', variants: [{ label: '', price: 42.5 }] },
  ] },
  { cat: 'merch', label: 'Merch', heading: 'Merch, Custom Logos & Smart Brand Tech', sub: '', items: [
    { id: 'merch-starter', name: 'Business Startup Launch Kit — Starter', desc: '', variants: [{ label: '', price: 67.15 }] },
    { id: 'merch-growth', name: 'Business Startup Launch Kit — Growth', desc: '', variants: [{ label: '', price: 126.65 }] },
    { id: 'merch-pro', name: 'Business Startup Launch Kit — Master Pro', desc: '', variants: [{ label: '', price: 211.65 }] },
    { id: 'merch-nfc', name: 'Black Smart Tap NFC Business Cards', desc: '', unit: 'each', variants: [{ label: '', price: 41.65 }] },
    { id: 'merch-stand', name: 'Smart Review Counter Stands', desc: '', unit: 'each', variants: [{ label: '', price: 41.65 }] },
  ] },
  { cat: 'events', label: 'Events', heading: 'Events & Holiday Staging', sub: '', items: [
    { id: 'event-full', name: 'Full Event Planning & Coordination', desc: 'Base fee plus 10% of event budget.', variants: [{ label: '', price: 552.5 }], note: '+ 10% of event budget, added at booking' },
    { id: 'event-staging', name: 'Private Life Event Staging', desc: '', variants: [{ label: '', price: 297.5 }] },
    { id: 'event-wedding', name: 'Destination & Community Wedding Logistics', desc: '', variants: [{ label: '', price: 1062.5 }] },
    { id: 'event-lights', name: 'Exterior Patio & Balcony Holiday Lighting', desc: 'Baseline package.', variants: [{ label: '', price: 382.5 }] },
    { id: 'event-interior', name: 'Full Interior Holiday Conversion', desc: 'Up to 1,200 sq. ft.', variants: [{ label: '', price: 1020 }], note: '"Up to" rate — final quote depends on footprint' },
  ] },
];

const css = `
.rc-page{min-height:100vh;padding-bottom:130px;background:#faf6f0;color:#231a1a;font-family:Inter,system-ui,sans-serif}.rc-page *{box-sizing:border-box}.rc-head{padding:26px 18px 20px;text-align:center;color:#fff;background:linear-gradient(180deg,#6b1426,#4a0d19);border-bottom:3px solid #a9824c}.rc-eye{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a9824c}.rc-head h1{font-family:'Playfair Display',Georgia,serif;margin:8px 0 4px;font-size:26px}.rc-head p{margin:0;font-size:13px}.rc-discount{max-width:640px;margin:14px auto 0;padding:12px 15px;background:#fffdfa;color:#231a1a;border:1px dashed #a9824c;border-radius:6px;font-size:12.5px}.rc-discount b{color:#6b1426}.rc-tabs{position:sticky;top:0;z-index:20;display:flex;overflow:auto;background:#fffdfa;border-bottom:1px solid #e4d9cc}.rc-tabs button{flex:0 0 auto;border:0;background:none;padding:14px;font-weight:700;color:#8a7a75;white-space:nowrap}.rc-tabs button.active{color:#6b1426;border-bottom:3px solid #6b1426}.rc-main{max-width:640px;margin:auto;padding:16px}.rc-heading{font-family:'Playfair Display',Georgia,serif;color:#6b1426;font-size:20px;font-weight:700}.rc-sub{font-size:12.5px;color:#7a6c66;line-height:1.5;margin:4px 0 14px}.rc-card{background:#fffdfa;border:1px solid #e4d9cc;border-radius:10px;padding:14px;margin-bottom:12px}.rc-name{font-weight:700;font-size:15px}.rc-desc{font-size:12px;color:#7a6c66;line-height:1.45;margin:4px 0 10px}.rc-row{display:flex;gap:10px;align-items:center;justify-content:space-between}.rc-select,.rc-form input,.rc-form select{width:100%;padding:9px;border:1px solid #e4d9cc;border-radius:6px;background:#faf6f0}.rc-price{font-family:'IBM Plex Mono',monospace;color:#6b1426;font-weight:700;white-space:nowrap}.rc-controls{display:flex;justify-content:flex-end;align-items:center;gap:8px;margin-top:10px}.rc-qty{width:30px;height:30px;border-radius:50%;border:1px solid #e4d9cc;background:#f3e7de;color:#6b1426;font-weight:700}.rc-add{border:0;border-radius:6px;padding:8px 16px;background:#6b1426;color:#fff;font-weight:700}.rc-note{font-size:11px;color:#a9824c;font-style:italic;margin-top:6px}.rc-bar{position:fixed;z-index:30;left:0;right:0;bottom:0;background:#fffdfa;border-top:1px solid #e4d9cc;padding:12px 16px}.rc-bar button{width:100%;max-width:640px;margin:auto;display:flex;justify-content:space-between;align-items:center;border:0;background:none}.rc-total{font-family:'IBM Plex Mono',monospace;font-size:18px;color:#6b1426;font-weight:700}.rc-count{display:block;text-align:left;font-size:12px;color:#7a6c66}.rc-view{color:#a9824c;font-size:12px;font-weight:700}.rc-overlay{position:fixed;inset:0;z-index:100;pointer-events:auto;background:rgba(35,26,26,.6);display:flex;align-items:flex-end;justify-content:center}.rc-ticket{position:relative;z-index:101;width:100%;max-width:640px;max-height:90vh;overflow:auto;background:#fffdfa;border-radius:16px 16px 0 0;padding:20px}.rc-line{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px dotted #e4d9cc}.rc-line-meta{font-size:11px;color:#8a7a75}.rc-remove{border:0;background:none;color:#b0453f;text-decoration:underline;font-size:11px}.rc-total-row{display:flex;justify-content:space-between;border-top:2px dashed #e4d9cc;margin-top:10px;padding-top:12px;color:#6b1426;font-weight:700}.rc-form{margin-top:14px}.rc-form label{display:block;margin:10px 0 5px;font-size:11px;font-weight:700;text-transform:uppercase}.rc-actions{display:flex;flex-direction:column;gap:8px;margin-top:16px}.rc-actions a,.rc-actions button{padding:13px;border-radius:8px;text-align:center;font-weight:700;text-decoration:none;border:0}.rc-wa{background:#25d366;color:#fff}.rc-sms{background:#6b1426;color:#fff}.rc-close{background:none;color:#8a7a75}.rc-disclosure{text-align:center;font-size:10.5px;color:#9b8d87;line-height:1.5;margin-top:14px}
`;

const money = (value) => `$${Number(value).toFixed(2)}`;

export default function ResidentConciergeSafePage() {
  const [category, setCategory] = useState(CATALOG[0].cat);
  const [cart, setCart] = useState({});
  const [qty, setQty] = useState({});
  const [variant, setVariant] = useState({});
  const [open, setOpen] = useState(false);
  const [resident, setResident] = useState('');
  const [payment, setPayment] = useState('Zelle');
  const [note, setNote] = useState('');

  const active = CATALOG.find((entry) => entry.cat === category) || CATALOG[0];
  const lines = Object.keys(cart).map((key) => ({ key, ...cart[key] }));
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const count = lines.reduce((sum, line) => sum + line.qty, 0);

  const add = (item) => {
    const index = Number(variant[item.id] || 0);
    const selected = item.variants[index] || item.variants[0];
    const amount = Math.max(1, Number(qty[item.id] || 1));
    const key = `${item.id}:${index}`;
    setCart((current) => ({ ...current, [key]: current[key] ? { ...current[key], qty: current[key].qty + amount } : { name: item.name, variantLabel: selected.label, price: selected.price, qty: amount, unit: item.unit || '', note: item.note || '' } }));
    setQty((current) => ({ ...current, [item.id]: 1 }));
  };

  const send = (channel) => {
    if (!count) return window.alert('Add at least one item before sending your ticket.');
    if (!resident.trim()) return window.alert('Please enter your name and unit number.');
    const items = lines.map((line) => `• ${line.qty}x ${line.name}${line.variantLabel || line.unit ? ` — ${[line.variantLabel, line.unit].filter(Boolean).join(' ')}` : ''} (${money(line.price * line.qty)})`).join('\n');
    const message = ['DANI DECLARES SERVICE TICKET', '=====================', `Name/Unit: ${resident.trim()}`, `Payment: ${payment}`, note.trim() ? `Notes: ${note.trim()}` : '', '=====================', `ITEMS:\n${items}`, `ESTIMATED TOTAL: ${money(total)}`].filter(Boolean).join('\n');
    const encoded = encodeURIComponent(message);
    window.location.href = channel === 'whatsapp' ? `https://wa.me/${PHONE}?text=${encoded}` : `sms:+${PHONE}?body=${encoded}`;
  };

  const ticket = open ? createPortal(
    <div className="rc-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="rc-ticket" role="dialog" aria-modal="true" aria-labelledby="rc-ticket-title">
        <div className="rc-eye">Dispatch Ticket</div><h2 id="rc-ticket-title">Your Service Request</h2>
        {!lines.length ? <p>No items yet — add something from the menu.</p> : lines.map((line) => <div className="rc-line" key={line.key}><div><strong>{line.qty} × {line.name}</strong>{(line.variantLabel || line.unit) && <div className="rc-line-meta">{[line.variantLabel, line.unit].filter(Boolean).join(' ')}</div>}{line.note && <div className="rc-line-meta">{line.note}</div>}<button className="rc-remove" type="button" onClick={() => setCart((current) => { const next = { ...current }; delete next[line.key]; return next; })}>Remove</button></div><span>{money(line.price * line.qty)}</span></div>)}
        <div className="rc-total-row"><span>Estimated Total</span><span>{money(total)}</span></div>
        <div className="rc-form"><label htmlFor="rc-name">Name &amp; Unit Number</label><input id="rc-name" value={resident} onChange={(event) => setResident(event.target.value)} placeholder="e.g. Jordan — Unit 214" /><label htmlFor="rc-payment">Preferred Payment Method</label><select id="rc-payment" value={payment} onChange={(event) => setPayment(event.target.value)}><option>Zelle</option><option>Venmo</option><option>Apple Pay</option><option>PayPal</option><option>Cash upon arrival</option></select><label htmlFor="rc-note">Notes for the field team</label><input id="rc-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Gate code, preferred time, etc." /></div>
        <div className="rc-actions"><a className="rc-wa" href="#whatsapp" onClick={(event) => { event.preventDefault(); send('whatsapp'); }}>📱 Send via WhatsApp</a><a className="rc-sms" href="#sms" onClick={(event) => { event.preventDefault(); send('sms'); }}>💬 Send via Text Message</a><button className="rc-close" type="button" onClick={() => setOpen(false)}>Keep Browsing</button></div>
        <div className="rc-disclosure">Rates shown are the standard Resident Rate. Items marked + travel or + event budget % are finalized at booking. Dani Declares LLC does not draft legal documents or provide legal advice for notary services.<br />Field office: (470) 485-7173 · admin@danideclares.com</div>
      </section>
    </div>, document.body) : null;

  return <div className="rc-page"><style>{css}</style><header className="rc-head"><div className="rc-eye">Field Office Dispatch</div><h1>Dani Declares LLC</h1><p>Resident Concierge Menu &amp; Service Requests</p><div className="rc-discount">Every item below already reflects your <b>15% Resident Discount</b>. Submit your ticket and our field office confirms scheduling by text.</div></header><nav className="rc-tabs" aria-label="Resident concierge categories">{CATALOG.map((entry) => <button type="button" key={entry.cat} className={entry.cat === category ? 'active' : ''} onClick={() => setCategory(entry.cat)}>{entry.label}</button>)}</nav><main className="rc-main"><div className="rc-heading">{active.heading}</div>{active.sub && <div className="rc-sub">{active.sub}</div>}{active.items.map((item) => { const selected = item.variants[Number(variant[item.id] || 0)] || item.variants[0]; return <article className="rc-card" key={item.id}><div className="rc-name">{item.name}</div>{item.desc && <div className="rc-desc">{item.desc}</div>}<div className="rc-row">{item.variants.length > 1 ? <select className="rc-select" value={Number(variant[item.id] || 0)} onChange={(event) => setVariant((current) => ({ ...current, [item.id]: Number(event.target.value) }))}>{item.variants.map((option, index) => <option value={index} key={`${item.id}-${index}`}>{option.label} — {money(option.price)}</option>)}</select> : <div className="rc-price">{money(selected.price)}{item.unit ? ` ${item.unit}` : ''}</div>}</div><div className="rc-controls"><button type="button" className="rc-qty" onClick={() => setQty((current) => ({ ...current, [item.id]: Math.max(1, (current[item.id] || 1) - 1) }))}>−</button><span>{qty[item.id] || 1}</span><button type="button" className="rc-qty" onClick={() => setQty((current) => ({ ...current, [item.id]: (current[item.id] || 1) + 1 }))}>+</button><button type="button" className="rc-add" onClick={() => add(item)}>Add</button></div>{item.note && <div className="rc-note">{item.note}</div>}</article>; })}</main><div className="rc-bar"><button type="button" onClick={() => setOpen(true)}><span><span className="rc-total">{money(total)}</span><span className="rc-count">{count ? `${count} item${count === 1 ? '' : 's'} on your ticket` : 'Your ticket is empty'}</span></span><span className="rc-view">View Ticket →</span></button></div>{ticket}</div>;
}
