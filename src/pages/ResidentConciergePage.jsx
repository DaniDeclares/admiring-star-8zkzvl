import React, { useMemo, useState } from 'react';

const BUSINESS_PHONE = '14704857173';

const CATALOG = [
  {
    cat: 'snacks',
    label: 'Snacks',
    heading: 'Snack Delivery',
    sub: 'Build-your-own combos, delivered to your door with a secure building pin code.',
    items: [
      { id: 'snack-spicy', name: '"Hot & Cold" Spicy Combo', desc: '1 bag hot chips (Takis/Cheetos) + 1 ice-cold soda + 1 freeze pop.', variants: [{ label: '', price: 3 }] },
      { id: 'snack-sweet', name: '"Sweet & Salty" Pack', desc: "1 classic chip bag (Doritos/Lay's) + 1 full-size candy bar + 1 HUG barrel.", variants: [{ label: '', price: 3 }] },
      { id: 'snack-gamer', name: '"Gamer" Power Pack', desc: '1 bottled Gatorade + 2 individual chip bags + 1 full-size candy or chewy pack.', variants: [{ label: '', price: 5 }] },
      { id: 'snack-movie', name: '"Family Movie Night" Mega Bundle', desc: '4 chip bags + 4 ice-cold drinks + 4 full-size candies. Free delivery included.', variants: [{ label: '', price: 10 }] },
    ],
  },
  {
    cat: 'cleaning',
    label: 'Cleaning',
    heading: 'Cleaning, Deep Resets & Turnovers',
    sub: 'Base rates anchored to a standard 2-Bed / 2-Bath (up to 1,100 sq. ft.); pricing adjusts by footprint at booking.',
    items: [
      { id: 'clean-refresh', name: 'Resident Refresh — Standard Maintenance Clean', desc: 'Surface dusting, floor vacuuming, kitchen mopping, appliance polishing, trash staging.', variants: [{ label: '1-Bed / 1-Bath', price: 85 }, { label: '2-Bed / 2-Bath', price: 127.5 }, { label: '3-Bed / 2-Bath', price: 212.5 }, { label: '4-Bed / 3-Bath', price: 318.75 }] },
      { id: 'clean-deep', name: 'Deep Structural Reset', desc: 'Steam-injected grout & baseboard detailing, paired with HEPA air purifying runs.', variants: [{ label: '1-Bed / 1-Bath', price: 233.75 }, { label: '2-Bed / 2-Bath', price: 276.25 }, { label: '3-Bed / 2-Bath', price: 361.25 }, { label: '4-Bed / 3-Bath', price: 467.5 }] },
      { id: 'clean-moveout', name: 'Deposit Security Move-Out Turn', desc: 'Complete deep scrub of empty cabinets, drawers, appliances, and interior window glass.', variants: [{ label: '1-Bed / 1-Bath', price: 280.5 }, { label: '2-Bed / 2-Bath', price: 323 }, { label: '3-Bed / 2-Bath', price: 408 }, { label: '4-Bed / 3-Bath', price: 514.25 }], note: 'Severe pet mess or heavy soil: +$150.00 flat, applied before the resident discount.' },
    ],
  },
  {
    cat: 'laundry',
    label: 'Laundry & Home',
    heading: 'Valet Laundry & Home Organization',
    sub: '',
    items: [
      { id: 'laundry-valet', name: 'Valet Wash, Dry & Fold', desc: 'Sorting, premium laundering, machine drying, crisp folding in matching hampers. 2-basket minimum.', unit: '/ basket', variants: [{ label: '', price: 38.25 }] },
      { id: 'laundry-linen', name: 'Linen & Bedding Reset Loop', desc: 'Full strip, launder, mattress sanitization vacuuming, hospital-corner re-making.', unit: '/ bed', variants: [{ label: '', price: 29.75 }] },
      { id: 'org-closet', name: 'Closet & Wardrobe Optimization Matrix', desc: 'Closet editing, seasonal rotation, color-coordinated hanging. 3-hour minimum.', unit: '/ hr', variants: [{ label: '', price: 38.25 }] },
      { id: 'org-pantry', name: 'Culinary Pantry & Kitchen Cabinet Organization', desc: 'Expiration audits, shelf washing, bulk decanting. Up to 10 cabinets/shelves.', variants: [{ label: '', price: 127.5 }] },
      { id: 'org-estate', name: 'Estate Liquidation & Decluttering', desc: 'Hourly rate plus disposal fees. Availability may vary by state licensing.', unit: '/ hr', variants: [{ label: '', price: 55.25 }] },
    ],
  },
  {
    cat: 'memberships',
    label: 'Memberships',
    heading: 'Monthly Lifestyle Subscriptions',
    sub: 'Recurring plans billed monthly.',
    items: [
      { id: 'mem-b', name: 'Package B — Executive Home & Wardrobe Care', desc: 'Bi-weekly cleaning (2/mo), 2 laundry baskets/mo, 1 Linen Reset Loop.', unit: '/ mo', variants: [{ label: '1-Bed', price: 238 }, { label: '2-Bed', price: 263.5 }, { label: '3-Bed', price: 314.5 }, { label: '4-Bed', price: 365.5 }] },
      { id: 'mem-c', name: 'Package C — Ultimate Turnkey Household Care', desc: 'Weekly cleaning (4/mo), 4 laundry baskets/mo, 2 Reset Loops, quarterly Closet/Pantry Matrix.', unit: '/ mo', variants: [{ label: '1-Bed', price: 442 }, { label: '2-Bed', price: 467.5 }, { label: '3-Bed', price: 518.5 }, { label: '4-Bed', price: 569.5 }] },
      { id: 'mem-pet', name: 'Pampered Pet — Care & Cleaning Bundle', desc: '2 Resident Refresh visits/mo, 1 Pet Hair & Odor Extraction/mo, 4 midday dog walks/mo.', unit: '/ mo', note: 'Requires signed Pet Liability Waiver.', variants: [{ label: '1-Bed', price: 208.25 }, { label: '2-Bed', price: 233.75 }, { label: '3-Bed', price: 284.75 }, { label: '4-Bed', price: 335.75 }] },
      { id: 'mem-nomad', name: 'Digital Nomad — Co-Working & Reset Suite', desc: '1 Resident Refresh visit/mo, 2 laundry baskets/mo, 1 branded apparel or print-run credit/mo.', unit: '/ mo', variants: [{ label: '1-Bed', price: 153 }, { label: '2-Bed', price: 178.5 }, { label: '3-Bed', price: 229.5 }, { label: '4-Bed', price: 280.5 }] },
      { id: 'mem-move', name: 'On-The-Move — Roadside & Valet Package', desc: '1 Resident Refresh visit/mo, 2 priority roadside dispatches/mo, mobile tire plugs on-site.', unit: '/ mo', note: 'Valid for one registered vehicle.', variants: [{ label: '1-Bed', price: 131.75 }, { label: '2-Bed', price: 157.25 }, { label: '3-Bed', price: 208.25 }, { label: '4-Bed', price: 259.25 }] },
      { id: 'mem-deposit', name: 'Squeaky Clean Security Deposit — One-Time Flat', desc: 'Full deposit-protection package, one-time flat rate.', variants: [{ label: '1-Bed', price: 335.75 }, { label: '2-Bed', price: 361.25 }, { label: '3-Bed', price: 412.25 }, { label: '4-Bed', price: 463.25 }] },
    ],
  },
  {
    cat: 'notary',
    label: 'Notary',
    heading: 'Mobile Notary & Document Signings',
    sub: 'Georgia law caps the notarial act fee at $2.00; rates below include that statutory fee plus concierge intake, document administration, and witness services. Dani Declares LLC does not draft legal documents, provide legal advice, or determine which document a resident should use.',
    items: [
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
    ],
  },
  {
    cat: 'merch',
    label: 'Merch',
    heading: 'Merch, Custom Logos & Smart Brand Tech',
    sub: '',
    items: [
      { id: 'merch-starter', name: 'Business Startup Launch Kit — Starter', desc: '', variants: [{ label: '', price: 67.15 }] },
      { id: 'merch-growth', name: 'Business Startup Launch Kit — Growth', desc: '', variants: [{ label: '', price: 126.65 }] },
      { id: 'merch-pro', name: 'Business Startup Launch Kit — Master Pro', desc: '', variants: [{ label: '', price: 211.65 }] },
      { id: 'merch-nfc', name: 'Black Smart Tap NFC Business Cards', desc: '', unit: 'each', variants: [{ label: '', price: 41.65 }] },
      { id: 'merch-stand', name: 'Smart Review Counter Stands', desc: '', unit: 'each', variants: [{ label: '', price: 41.65 }] },
    ],
  },
  {
    cat: 'events',
    label: 'Events',
    heading: 'Events & Holiday Staging',
    sub: '',
    items: [
      { id: 'event-full', name: 'Full Event Planning & Coordination', desc: 'Base fee plus 10% of event budget.', variants: [{ label: '', price: 552.5 }], note: '+ 10% of event budget, added at booking' },
      { id: 'event-staging', name: 'Private Life Event Staging', desc: '', variants: [{ label: '', price: 297.5 }] },
      { id: 'event-wedding', name: 'Destination & Community Wedding Logistics', desc: '', variants: [{ label: '', price: 1062.5 }] },
      { id: 'event-lights', name: 'Exterior Patio & Balcony Holiday Lighting', desc: 'Baseline package.', variants: [{ label: '', price: 382.5 }] },
      { id: 'event-interior', name: 'Full Interior Holiday Conversion', desc: 'Up to 1,200 sq. ft.', variants: [{ label: '', price: 1020 }], note: '"Up to" rate — final quote depends on footprint' },
    ],
  },
];

const STYLES = `
  .rd-page{--burgundy:#6b1426;--burgundy-dark:#4a0d19;--cream:#faf6f0;--paper:#fffdfa;--ink:#231a1a;--gold:#a9824c;--blush:#f3e7de;--line:#e4d9cc;min-height:100vh;background:var(--cream);color:var(--ink);padding-bottom:150px;font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .rd-page *{box-sizing:border-box}
  .rd-header{color:#fff;padding:26px 18px 20px;text-align:center;border-bottom:3px solid var(--gold);background:linear-gradient(180deg,var(--burgundy),var(--burgundy-dark))}
  .rd-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:8px}
  .rd-header h1{font-family:'Playfair Display',Georgia,serif;font-weight:800;font-size:26px;letter-spacing:.5px;margin:0}
  .rd-header p{font-size:13px;opacity:.85;margin:6px 0 0}
  .rd-discount{max-width:640px;margin:14px auto 0;padding:12px 15px;background:var(--paper);border:1px dashed var(--gold);border-radius:6px;font-size:12.5px;color:var(--ink);text-align:center}
  .rd-discount b{color:var(--burgundy)}
  .rd-tabs{position:sticky;top:0;z-index:20;background:var(--paper);border-bottom:1px solid var(--line);display:flex;overflow-x:auto;padding:0 8px;scrollbar-width:none}
  .rd-tabs::-webkit-scrollbar{display:none}
  .rd-tab{flex:0 0 auto;background:none;border:0;padding:14px 14px 12px;font-family:Inter,system-ui,sans-serif;font-weight:600;font-size:13px;color:#8a7a75;border-bottom:3px solid transparent;cursor:pointer;white-space:nowrap}
  .rd-tab.active{color:var(--burgundy);border-bottom-color:var(--burgundy)}
  .rd-container{max-width:640px;margin:0 auto;padding:16px}
  .rd-heading{font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:700;color:var(--burgundy);margin:6px 0 3px}
  .rd-sub{font-size:12.5px;color:#7a6c66;margin-bottom:14px;line-height:1.5}
  .rd-card{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:12px;box-shadow:0 1px 3px rgba(107,20,38,.05);transition:border-color .2s}
  .rd-name{font-weight:700;font-size:15px;margin-bottom:3px}
  .rd-desc{font-size:12px;color:#7a6c66;line-height:1.45;margin-bottom:10px}
  .rd-note{font-size:11px;color:var(--gold);font-style:italic;margin-top:6px}
  .rd-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
  .rd-select{flex:1 1 auto;min-width:150px;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;background:var(--cream);color:var(--ink)}
  .rd-price{font-family:'IBM Plex Mono',monospace;font-weight:600;color:var(--burgundy);font-size:15px;min-width:70px;text-align:right}
  .rd-controls{display:flex;align-items:center;gap:8px;margin-top:10px;justify-content:flex-end}
  .rd-qty{background:var(--blush);color:var(--burgundy);border:1px solid var(--line);width:30px;height:30px;border-radius:50%;font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .rd-qty-value{font-family:'IBM Plex Mono',monospace;font-weight:600;width:22px;text-align:center;font-size:14px}
  .rd-add{background:var(--burgundy);color:#fff;border:0;padding:8px 16px;border-radius:6px;font-size:12.5px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;cursor:pointer}
  .rd-bar{position:fixed;bottom:0;left:0;right:0;background:var(--paper);border-top:1px solid var(--line);box-shadow:0 -4px 14px rgba(107,20,38,.08);padding:12px 16px;z-index:30}
  .rd-summary{max-width:640px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;cursor:pointer}
  .rd-count{font-size:12px;color:#7a6c66}.rd-total{font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:18px;color:var(--burgundy)}
  .rd-view{font-size:12px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.5px}
  .rd-overlay{position:fixed;inset:0;background:rgba(35,26,26,.55);z-index:50;display:flex;align-items:flex-end;justify-content:center;padding:0}
  .rd-ticket{background:var(--paper);width:100%;max-width:640px;max-height:88vh;overflow-y:auto;border-radius:16px 16px 0 0;padding:20px 20px 24px;position:relative}
  .rd-handle{width:40px;height:4px;background:var(--line);border-radius:3px;margin:0 auto 14px}
  .rd-ticket-header{text-align:center;border-bottom:2px dashed var(--line);padding-bottom:14px;margin-bottom:14px}.rd-ticket-header h2{font-family:'Playfair Display',Georgia,serif;color:var(--burgundy);font-size:19px;margin:4px 0 0}
  .rd-line{display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px dotted var(--line);gap:10px}.rd-line-name{font-weight:600}.rd-line-meta{font-size:11px;color:#8a7a75}.rd-line-price{font-family:'IBM Plex Mono',monospace;white-space:nowrap}
  .rd-remove{background:none;border:0;color:#b0453f;font-size:11px;cursor:pointer;text-decoration:underline;margin-top:2px;padding:0}
  .rd-empty{text-align:center;color:#8a7a75;font-size:13px;padding:20px 0}
  .rd-ticket-total{display:flex;justify-content:space-between;font-weight:700;font-size:16px;color:var(--burgundy);padding-top:12px;margin-top:8px;border-top:2px dashed var(--line)}
  .rd-form{margin-top:16px}.rd-form label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--ink);margin:10px 0 5px}.rd-form input,.rd-form select{width:100%;padding:10px;border:1px solid var(--line);border-radius:6px;font-size:14px;background:var(--cream);color:var(--ink)}
  .rd-actions{margin-top:18px;display:flex;flex-direction:column;gap:8px}.rd-submit{border:0;padding:14px;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;text-align:center;color:#fff;text-decoration:none}.rd-whatsapp{background:#25d366}.rd-sms{background:var(--burgundy)}.rd-close{background:none;border:0;color:#8a7a75;font-size:13px;text-align:center;padding:8px;cursor:pointer}
  .rd-disclosure{font-size:10.5px;color:#9b8d87;text-align:center;margin-top:14px;line-height:1.5}
  @media (max-width:480px){.rd-container{padding:14px}.rd-tabs .rd-tab{padding-left:11px;padding-right:11px}.rd-ticket{padding-left:16px;padding-right:16px}}
`;

function fmt(value) {
  return `$${value.toFixed(2)}`;
}

export default function ResidentConciergePage() {
  const [activeCat, setActiveCat] = useState(CATALOG[0].cat);
  const [cart, setCart] = useState({});
  const [quantities, setQuantities] = useState({});
  const [variants, setVariants] = useState({});
  const [ticketOpen, setTicketOpen] = useState(false);
  const [resident, setResident] = useState('');
  const [payment, setPayment] = useState('Zelle');
  const [note, setNote] = useState('');

  const cartLines = useMemo(() => Object.entries(cart).map(([key, line]) => ({ key, ...line })), [cart]);
  const cartTotal = useMemo(() => cartLines.reduce((sum, line) => sum + line.price * line.qty, 0), [cartLines]);
  const cartCount = useMemo(() => cartLines.reduce((sum, line) => sum + line.qty, 0), [cartLines]);
  const activeCategory = CATALOG.find((category) => category.cat === activeCat) || CATALOG[0];

  const getQty = (id) => quantities[id] || 1;
  const getVariantIndex = (id) => variants[id] || 0;

  const stepQty = (id, delta) => {
    setQuantities((current) => ({ ...current, [id]: Math.max(1, (current[id] || 1) + delta) }));
  };

  const addToCart = (item) => {
    const variantIndex = getVariantIndex(item.id);
    const variant = item.variants[variantIndex];
    const qty = getQty(item.id);
    const key = `${item.id}::${variantIndex}`;

    setCart((current) => ({
      ...current,
      [key]: current[key]
        ? { ...current[key], qty: current[key].qty + qty }
        : { name: item.name, variantLabel: variant.label, price: variant.price, qty, unit: item.unit || '', note: item.note || '' },
    }));
    setQuantities((current) => ({ ...current, [item.id]: 1 }));
  };

  const removeFromCart = (key) => {
    setCart((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const showCategory = (cat) => {
    setActiveCat(cat);
    window.setTimeout(() => document.getElementById('resident-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const sendOrder = (channel) => {
    if (!cartCount) {
      window.alert('Add at least one item before sending your ticket.');
      return;
    }
    if (!resident.trim()) {
      window.alert('Please enter your name and unit number.');
      return;
    }

    let itemText = '';
    cartLines.forEach((line) => {
      const meta = [line.variantLabel, line.unit].filter(Boolean).join(' ');
      itemText += `• ${line.qty}x ${line.name}${meta ? ` — ${meta}` : ''} (${fmt(line.price * line.qty)})\n`;
      if (line.note) itemText += `  note: ${line.note}\n`;
    });

    let message = 'DANI DECLARES SERVICE TICKET\n=====================\n';
    message += `Name/Unit: ${resident.trim()}\n`;
    message += `Payment: ${payment}\n`;
    if (note.trim()) message += `Notes: ${note.trim()}\n`;
    message += `=====================\nITEMS:\n${itemText}\nESTIMATED TOTAL: ${fmt(cartTotal)}`;

    const encoded = encodeURIComponent(message);
    if (channel === 'whatsapp') {
      window.location.href = `https://wa.me/${BUSINESS_PHONE}?text=${encoded}`;
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const separator = isIOS ? '&' : '?';
      window.location.href = `sms:+${BUSINESS_PHONE}${separator}body=${encoded}`;
    }
  };

  return (
    <div className="rd-page">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap');${STYLES}`}</style>
      <header className="rd-header">
        <div className="rd-eyebrow">Field Office Dispatch</div>
        <h1>Dani Declares LLC</h1>
        <p>Resident Concierge Menu &amp; Service Requests</p>
        <div className="rd-discount">Every item below already reflects your <b>15% Resident Discount</b>. Submit your ticket and our field office confirms scheduling by text.</div>
      </header>

      <nav className="rd-tabs" aria-label="Resident concierge categories">
        {CATALOG.map((category) => (
          <button key={category.cat} type="button" className={`rd-tab ${activeCat === category.cat ? 'active' : ''}`} onClick={() => showCategory(category.cat)}>
            {category.label}
          </button>
        ))}
      </nav>

      <main className="rd-container" id="resident-catalog">
        <section>
          <div className="rd-heading">{activeCategory.heading}</div>
          {activeCategory.sub && <div className="rd-sub">{activeCategory.sub}</div>}
          {activeCategory.items.map((item) => {
            const hasVariants = item.variants.length > 1;
            const selectedVariant = item.variants[getVariantIndex(item.id)] || item.variants[0];
            return (
              <article className="rd-card" key={item.id}>
                <div className="rd-name">{item.name}</div>
                {item.desc && <div className="rd-desc">{item.desc}</div>}
                <div className="rd-row">
                  {hasVariants ? (
                    <select
                      className="rd-select"
                      aria-label={`${item.name} option`}
                      value={getVariantIndex(item.id)}
                      onChange={(event) => setVariants((current) => ({ ...current, [item.id]: Number(event.target.value) }))}
                    >
                      {item.variants.map((variant, index) => (
                        <option value={index} key={`${item.id}-${index}`}>
                          {variant.label} — {fmt(variant.price)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="rd-price">{fmt(selectedVariant.price)}{item.unit && <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, color: '#8a7a75', marginLeft: 4 }}>{item.unit}</span>}</div>
                  )}
                </div>
                <div className="rd-controls">
                  <button type="button" className="rd-qty" aria-label={`Decrease ${item.name} quantity`} onClick={() => stepQty(item.id, -1)}>−</button>
                  <span className="rd-qty-value">{getQty(item.id)}</span>
                  <button type="button" className="rd-qty" aria-label={`Increase ${item.name} quantity`} onClick={() => stepQty(item.id, 1)}>+</button>
                  <button type="button" className="rd-add" onClick={() => addToCart(item)}>Add</button>
                </div>
                {item.note && <div className="rd-note">{item.note}</div>}
              </article>
            );
          })}
        </section>
      </main>

      <div className="rd-bar">
        <button type="button" className="rd-summary" onClick={() => setTicketOpen(true)} aria-label="View service ticket">
          <span>
            <span className="rd-total">{fmt(cartTotal)}</span>
            <span className="rd-count" style={{ display: 'block' }}>{cartCount ? `${cartCount} item${cartCount > 1 ? 's' : ''} on your ticket` : 'Your ticket is empty'}</span>
          </span>
          <span className="rd-view">View Ticket →</span>
        </button>
      </div>

      {ticketOpen && (
        <div className="rd-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setTicketOpen(false); }}>
          <section className="rd-ticket" role="dialog" aria-modal="true" aria-labelledby="resident-ticket-title">
            <div className="rd-handle" />
            <div className="rd-ticket-header">
              <div className="rd-eyebrow">Dispatch Ticket</div>
              <h2 id="resident-ticket-title">Your Service Request</h2>
            </div>

            {cartLines.length === 0 ? (
              <div className="rd-empty">No items yet — add something from the menu.</div>
            ) : (
              cartLines.map((line) => {
                const meta = [line.variantLabel, line.unit].filter(Boolean).join(' ');
                return (
                  <div className="rd-line" key={line.key}>
                    <div>
                      <div className="rd-line-name">{line.qty} × {line.name}</div>
                      {meta && <div className="rd-line-meta">{meta}</div>}
                      {line.note && <div className="rd-line-meta">{line.note}</div>}
                      <button type="button" className="rd-remove" onClick={() => removeFromCart(line.key)}>Remove</button>
                    </div>
                    <div className="rd-line-price">{fmt(line.price * line.qty)}</div>
                  </div>
                );
              })
            )}

            <div className="rd-ticket-total"><span>Estimated Total</span><span>{fmt(cartTotal)}</span></div>

            <div className="rd-form">
              <label htmlFor="res-name">Name &amp; Unit Number</label>
              <input id="res-name" value={resident} onChange={(event) => setResident(event.target.value)} placeholder="e.g. Jordan — Unit 214" />
              <label htmlFor="pay-method">Preferred Payment Method</label>
              <select id="pay-method" value={payment} onChange={(event) => setPayment(event.target.value)}>
                <option>Zelle</option><option>Venmo</option><option>Apple Pay</option><option>PayPal</option><option>Cash upon arrival</option>
              </select>
              <label htmlFor="contact-note">Notes for the field team (optional)</label>
              <input id="contact-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Gate code, preferred time, etc." />
            </div>

            <div className="rd-actions">
              <a className="rd-submit rd-whatsapp" href="#send-whatsapp" onClick={(event) => { event.preventDefault(); sendOrder('whatsapp'); }}>📱 Send via WhatsApp</a>
              <a className="rd-submit rd-sms" href="#send-sms" onClick={(event) => { event.preventDefault(); sendOrder('sms'); }}>💬 Send via Text Message</a>
              <button type="button" className="rd-close" onClick={() => setTicketOpen(false)}>Keep Browsing</button>
            </div>

            <div className="rd-disclosure">
              Rates shown are the standard Resident Rate. Items marked "+ travel" or "+ event budget %" are estimates finalized at booking. Dani Declares LLC does not draft legal documents or provide legal advice for notary services.
              <br />Field office: (470) 485-7173 · admin@danideclares.com
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
