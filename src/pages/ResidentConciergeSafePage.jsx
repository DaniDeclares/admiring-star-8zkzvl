import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const PHONE = '14704857173';
const VENMO_URL = 'https://venmo.com/DaniDeclaresLLC';
const PAYPAL_URL = 'https://www.paypal.biz/DaniDeclaresLLC';
const ZELLE = 'danigirljw@icloud.com';

const SIZES = ['1-Bed / 1-Bath', '2-Bed / 2-Bath', '3-Bed / 2-Bath', '4-Bed / 3-Bath'];

const CATALOG = [
  { cat:'snacks', label:'Snacks', heading:'Neighborhood Snacks', sub:'Doorstep delivery to your unit. Orders under $10 carry a $1 delivery fee; the Family Movie Night bundle includes delivery.', items:[
    {id:'snack-spicy',name:'"Hot & Cold" Spicy Combo',desc:'1 bag hot chips + 1 ice-cold soda + 1 freeze pop.',price:3},
    {id:'snack-sweet',name:'"Sweet & Salty" Pack',desc:'1 classic chip bag + 1 full-size candy bar + 1 HUG barrel.',price:3},
    {id:'snack-gamer',name:'"Gamer" Power Pack',desc:'1 bottled Gatorade + 2 individual chip bags + 1 full-size candy or chewy pack.',price:5},
    {id:'snack-movie',name:'"Family Movie Night" Mega Bundle',desc:'4 chip bags + 4 ice-cold drinks + 4 full-size candies. Free delivery included.',price:10},
  ]},
  { cat:'cleaning', label:'Cleaning', heading:'Cleaning, Deep Resets & Turnovers', sub:'Resident pricing is already applied. Choose the home size that matches your unit.', items:[
    {id:'clean-refresh',name:'Resident Refresh — Standard Maintenance Clean',desc:'Surface dusting, floor vacuuming, kitchen mopping, appliance polishing, trash staging.',variants:[85,127.5,212.5,318.75]},
    {id:'clean-deep',name:'Deep Structural Reset',desc:'Steam-injected grout & baseboard detailing with HEPA air-purifying runs.',variants:[233.75,276.25,361.25,467.5]},
    {id:'clean-moveout',name:'Deposit Security Move-Out Turn',desc:'Complete deep scrub of empty cabinets, drawers, appliances and interior window glass.',variants:[280.5,323,408,514.25],note:'Severe pet mess or Tier 2 heavy soil: +$150 flat.'},
  ]},
  { cat:'laundry', label:'Laundry & Home', heading:'Valet Laundry & Home Organization', items:[
    {id:'laundry-valet',name:'Valet Wash, Dry & Fold',desc:'Sorting, laundering, drying and crisp folding. 2-basket minimum.',price:38.25,unit:'/ basket'},
    {id:'laundry-linen',name:'Linen & Bedding Reset Loop',desc:'Full strip, launder, mattress sanitization vacuuming and re-making.',price:29.75,unit:'/ bed'},
    {id:'org-closet',name:'Closet & Wardrobe Optimization Matrix',desc:'Closet editing, seasonal rotation and color-coordinated hanging. 3-hour minimum.',price:38.25,unit:'/ hr'},
    {id:'org-pantry',name:'Culinary Pantry & Kitchen Cabinet Organization',desc:'Expiration audits, shelf washing and bulk decanting. Up to 10 cabinets/shelves.',price:127.5},
    {id:'org-estate',name:'Estate Liquidation & Decluttering',desc:'Hourly rate plus disposal fees.',price:55.25,unit:'/ hr'},
  ]},
  { cat:'memberships', label:'Memberships', heading:'Monthly Lifestyle Subscriptions', sub:'Recurring plans billed monthly, except the one-time deposit package.', items:[
    {id:'mem-b',name:'Package B — Executive Home & Wardrobe Care',desc:'Bi-weekly cleaning (2/mo), 2 laundry baskets/mo, 1 Linen Reset Loop.',variants:[238,263.5,314.5,365.5],unit:'/ mo'},
    {id:'mem-c',name:'Package C — Ultimate Turnkey Household Care',desc:'Weekly cleaning (4/mo), 4 laundry baskets/mo, 2 Reset Loops, quarterly Closet/Pantry session.',variants:[442,467.5,518.5,569.5],unit:'/ mo'},
    {id:'mem-pet',name:'Pampered Pet — Care & Cleaning Bundle',desc:'2 Resident Refresh visits/mo, 1 Pet Hair & Odor Extraction/mo, 4 midday dog walks/mo.',variants:[208.25,233.75,284.75,335.75],unit:'/ mo',note:'Requires signed Pet Liability Waiver.'},
    {id:'mem-nomad',name:'Digital Nomad — Co-Working & Reset Suite',desc:'1 Resident Refresh/mo, 2 laundry baskets/mo, 1 branded apparel or print-run credit/mo.',variants:[153,178.5,229.5,280.5],unit:'/ mo'},
    {id:'mem-move',name:'On-The-Move — Roadside & Valet Package',desc:'1 Resident Refresh/mo, 2 priority roadside dispatches/mo, mobile tire plugs on-site.',variants:[131.75,157.25,208.25,259.25],unit:'/ mo',note:'Valid for one registered vehicle.'},
    {id:'mem-deposit',name:'Squeaky Clean Security Deposit — One-Time Flat',desc:'One-time flat package.',variants:[335.75,361.25,412.25,463.25]},
  ]},
  { cat:'notary', label:'Notary', heading:'Mobile Notary & Document Signings', sub:'Notarization and witnessing only. Dani Declares LLC does not draft documents or provide legal advice.', items:[
    {id:'not-general',name:'General Notary Work',desc:'Per act, plus travel dispatch.',price:10.2,note:'+ travel dispatch finalized at booking.'},
    {id:'not-loan',name:'Mobile Loan Signings & Mortgage Closings',desc:'Flat rate.',price:127.5},
    {id:'not-apostille',name:'Apostille Document Authentication',price:148.75},
    {id:'not-poa',name:'Power of Attorney & Healthcare Proxy — Notarization',desc:'Signature witnessing on documents you provide; no drafting or legal advice.',price:29.75,note:'+ travel.'},
    {id:'not-emergency',name:'Emergency Notarization Dispatch',desc:'Advance directives & living wills — signature-witnessing dispatch only.',price:80.75},
    {id:'not-family',name:'Family Law & Custody Documents',price:63.75},
    {id:'not-title',name:'Motor Vehicle Title Transfers',price:42.5},
    {id:'not-safe',name:'Financial Safety Deposit Box Verification',price:106.25},
    {id:'not-affidavit',name:'School, Residency & Financial Affidavits',price:38.25},
    {id:'not-witness',name:'Witness Services',price:42.5,unit:'/ witness'},
  ]},
  { cat:'merch', label:'Merch', heading:'Merch, Custom Logos & Smart Brand Tech', sub:'Custom apparel and print runs are quoted separately.', items:[
    {id:'merch-starter',name:'Business Startup Launch Kit — Starter',price:67.15},
    {id:'merch-growth',name:'Business Startup Launch Kit — Growth',price:126.65},
    {id:'merch-pro',name:'Business Startup Launch Kit — Master Pro',price:211.65},
    {id:'merch-nfc',name:'Black Smart Tap NFC Business Cards',price:41.65,unit:'each'},
    {id:'merch-stand',name:'Smart Review Counter Stands',price:41.65,unit:'each'},
  ]},
  { cat:'events', label:'Events', heading:'Events & Holiday Staging', items:[
    {id:'event-full',name:'Full Event Planning & Coordination',desc:'Base fee plus 10% of event budget.',price:552.5,note:'+ 10% of event budget.'},
    {id:'event-staging',name:'Private Life Event Staging',price:297.5},
    {id:'event-wedding',name:'Destination & Community Wedding Logistics',price:1062.5},
    {id:'event-lights',name:'Exterior Patio & Balcony Holiday Lighting',desc:'Baseline package.',price:382.5},
    {id:'event-interior',name:'Full Interior Holiday Conversion',desc:'Up to 1,200 sq. ft.',price:1020,note:'Up to rate; final scope is confirmed at booking.'},
  ]},
];

export function calculateOrderTotals(cart = {}, options = {}) {
  const lines = Object.values(cart);
  const baseTotal = lines.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
  const snackSubtotal = lines.filter(x => x.category === 'snacks').reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
  const snackDelivery = lines.some(x => x.category === 'snacks') && !lines.some(x => x.itemId === 'snack-movie') && snackSubtotal < 10 ? 1 : 0;
  const moveOutSurcharge = lines.some(x => x.itemId === 'clean-moveout') && options.moveOutHeavySoil ? 150 : 0;
  const hasBudgetItem = lines.some(x => x.itemId === 'event-full' || x.itemId === 'event-interior');
  const eventPlanningFee = hasBudgetItem && Number(options.eventBudget) > 0 ? Number(options.eventBudget) * 0.10 : 0;
  return { baseTotal, snackSubtotal, snackDelivery, moveOutSurcharge, eventPlanningFee, grandTotal: baseTotal + snackDelivery + moveOutSurcharge + eventPlanningFee };
}

const money = n => `$${Number(n || 0).toFixed(2)}`;

const css = `
.rc-page{min-height:100vh;background:#faf6f0;color:#251712;font-family:Inter,system-ui,sans-serif;padding-bottom:110px}.rc-page *{box-sizing:border-box}
.rc-head{color:#fff;text-align:center;padding:30px 18px 24px;background:linear-gradient(135deg,#4c0e1c,#6f172c,#832038);border-bottom:4px solid #c69a2e}.rc-eye{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#e7cf8f;font-weight:700}.rc-head h1{font-family:Georgia,serif;font-size:30px;margin:8px 0 4px}.rc-head p{font-size:14px;margin:0}.rc-discount{max-width:640px;margin:16px auto 0;padding:12px;background:#fffdf7;color:#251712;border:1px dashed #c69a2e;border-radius:10px;font-size:12.5px}.rc-discount b{color:#6f172c}
.rc-tabs{position:sticky;top:0;z-index:20;display:flex;overflow-x:auto;background:#fffdf7;border-bottom:1px solid #d9c79f}.rc-tabs button{flex:0 0 auto;border:0;background:none;padding:13px 14px;color:#5a463d;font-weight:700;white-space:nowrap}.rc-tabs button.active{color:#6f172c;border-bottom:3px solid #6f172c}
.rc-main{max-width:720px;margin:auto;padding:18px 16px}.rc-heading{font-family:Georgia,serif;font-size:22px;font-weight:700;color:#4c0e1c;margin-bottom:4px}.rc-sub{font-size:12.5px;color:#5a463d;line-height:1.5;margin-bottom:14px}.rc-card{background:#fffdf7;border:1px solid #d9c79f;border-radius:12px;padding:15px;margin-bottom:12px;box-shadow:0 2px 8px rgba(76,14,28,.05)}.rc-name{font-weight:800;font-size:15px}.rc-desc{font-size:12px;color:#5a463d;line-height:1.45;margin:5px 0 10px}.rc-row{display:flex;gap:10px;align-items:center;justify-content:space-between}.rc-select,.rc-form input,.rc-form select{width:100%;padding:9px;border:1px solid #d9c79f;border-radius:8px;background:#fbf6ea;color:#251712}.rc-price{font-family:Georgia,serif;color:#6f172c;font-size:17px;font-weight:700;white-space:nowrap}.rc-controls{display:flex;justify-content:flex-end;align-items:center;gap:8px;margin-top:10px}.rc-qty{width:31px;height:31px;border-radius:50%;border:1px solid #d9c79f;background:#f4ecd8;color:#6f172c;font-weight:800}.rc-add{border:0;border-radius:8px;padding:9px 17px;background:#6f172c;color:#fff;font-weight:800}.rc-note{font-size:11px;color:#a9824c;font-style:italic;margin-top:7px}
.rc-bar{position:fixed;z-index:30;left:0;right:0;bottom:0;background:#fffdf7;border-top:1px solid #d9c79f;padding:11px 16px}.rc-bar button{width:100%;max-width:720px;margin:auto;display:flex;align-items:center;justify-content:space-between;border:0;background:none}.rc-total{font-family:Georgia,serif;font-size:19px;color:#4c0e1c;font-weight:800}.rc-count{display:block;text-align:left;font-size:11px;color:#5a463d}.rc-view{color:#6f172c;font-size:12px;font-weight:800}
.rc-overlay{position:fixed;inset:0;z-index:100;background:rgba(37,23,18,.65);display:flex;align-items:flex-end;justify-content:center}.rc-ticket{width:100%;max-width:650px;max-height:92vh;overflow:auto;background:#fffdf7;border-radius:18px 18px 0 0;padding:20px}.rc-ticket h2{font-family:Georgia,serif;color:#4c0e1c;margin:4px 0 15px}.rc-line{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px dotted #d9c79f}.rc-line-meta{font-size:11px;color:#5a463d;margin-top:3px}.rc-remove{border:0;background:none;color:#a9463f;text-decoration:underline;font-size:11px;padding:4px 0}.rc-total-row,.rc-fee-row{display:flex;justify-content:space-between}.rc-total-row{border-top:2px dashed #d9c79f;margin-top:12px;padding-top:12px;color:#4c0e1c;font-weight:800}.rc-fee-row{font-size:12px;color:#5a463d;padding-top:5px}.rc-modifier{margin-top:14px;padding:12px;border:1px dashed #d9c79f;border-radius:9px;background:#f4ecd8}.rc-modifier label{display:flex;gap:8px;margin-top:8px;font-size:12px}.rc-form{margin-top:14px}.rc-form label{display:block;margin:10px 0 5px;font-size:11px;font-weight:800;text-transform:uppercase;color:#6f172c}.rc-actions{display:grid;gap:8px;margin-top:16px}.rc-actions a,.rc-actions button{padding:13px;border-radius:9px;text-align:center;font-weight:800;text-decoration:none;border:0}.rc-pay{background:#c69a2e;color:#4c0e1c}.rc-wa{background:#25d366;color:#fff}.rc-sms{background:#6f172c;color:#fff}.rc-close{background:#f4ecd8;color:#5a463d}.rc-disclosure{text-align:center;font-size:10.5px;color:#8a7a75;line-height:1.5;margin-top:14px}
`;

export default function ResidentConciergeSafePage() {
  const [category,setCategory]=useState('snacks');
  const [cart,setCart]=useState({});
  const [qty,setQty]=useState({});
  const [variant,setVariant]=useState({});
  const [open,setOpen]=useState(false);
  const [resident,setResident]=useState('');
  const [payment,setPayment]=useState('Venmo');
  const [note,setNote]=useState('');
  const [moveOutHeavySoil,setMoveOutHeavySoil]=useState(false);
  const [eventBudget,setEventBudget]=useState('');

  const active=CATALOG.find(x=>x.cat===category)||CATALOG[0];
  const lines=useMemo(()=>Object.entries(cart).map(([key,value])=>({key,...value})),[cart]);
  const totals=calculateOrderTotals(cart,{moveOutHeavySoil,eventBudget});
  const count=lines.reduce((s,x)=>s+x.qty,0);
  const hasMoveOutItem=lines.some(x=>x.itemId==='clean-moveout');
  const hasBudgetItem=lines.some(x=>x.itemId==='event-full'||x.itemId==='event-interior');

  const add=(item)=>{
    const idx=Number(variant[item.id]||0);
    const selected=item.variants ? {price:item.variants[idx],label:SIZES[idx]} : {price:item.price,label:''};
    const amount=Math.max(1,Number(qty[item.id]||1));
    const key=`${item.id}:${idx}`;
    setCart(current=>({...current,[key]:current[key]?{...current[key],qty:current[key].qty+amount}:{itemId:item.id,category:item.cat,name:item.name,variantLabel:selected.label,price:selected.price,qty:amount,unit:item.unit||'',note:item.note||''}}));
    setQty(current=>({...current,[item.id]:1}));
  };
  const remove=(key)=>setCart(current=>{const next={...current};delete next[key];return next;});
  const buildMessage=()=>{
    const itemLines=lines.map(x=>`• ${x.qty}x ${x.name}${x.variantLabel?` [${x.variantLabel}]`:x.unit?` [${x.unit.trim()}]`:''} (${money(x.price*x.qty)})`).join('\n');
    const modifiers=[totals.snackDelivery?`• Snack Delivery Fee: ${money(totals.snackDelivery)}`:'',totals.moveOutSurcharge?`• Heavy-Soil Move-Out Surcharge: ${money(totals.moveOutSurcharge)}`:'',totals.eventPlanningFee?`• Event Coordination Fee (10%): ${money(totals.eventPlanningFee)}`:''].filter(Boolean);
    return ['DANI DECLARES CONCIERGE TICKET','==============================',`Resident: ${resident.trim()}`,`Payment Method: ${payment}`,note.trim()?`Notes: ${note.trim()}`:'','------------------------------','ITEMS:',itemLines,modifiers.length?`MODIFIERS:\n${modifiers.join('\n')}`:'','==============================',`ESTIMATED GRAND TOTAL: ${money(totals.grandTotal)}`,'------------------------------','Dani Declares LLC — field service order. Notary services are notarization/witnessing only; no legal advice or document drafting.'].filter(Boolean).join('\n');
  };
  const send=(channel)=>{
    if(!count)return window.alert('Add at least one item before checkout.');
    if(!resident.trim())return window.alert('Enter your name and unit number first.');
    if(hasBudgetItem && Number(eventBudget)<=0)return window.alert('Enter the event budget so the 10% coordination fee can be calculated.');
    const body=encodeURIComponent(buildMessage());
    window.location.href=channel==='whatsapp'?`https://wa.me/${PHONE}?text=${body}`:`sms:+${PHONE}?body=${body}`;
  };
  const copyZelle=async()=>{try{await navigator.clipboard.writeText(ZELLE);window.alert('Zelle address copied.')}catch{window.alert(ZELLE)}};

  const ticket=open?createPortal(<div className="rc-overlay" onClick={e=>e.target===e.currentTarget&&setOpen(false)}><section className="rc-ticket" role="dialog" aria-modal="true" aria-labelledby="rc-ticket-title">
    <div className="rc-eye">Field Service Ticket</div><h2 id="rc-ticket-title">Review Your Order</h2>
    {!lines.length?<p>Your ticket is empty.</p>:lines.map(x=><div className="rc-line" key={x.key}><div><strong>{x.qty} × {x.name}</strong>{(x.variantLabel||x.unit)&&<div className="rc-line-meta">{[x.variantLabel,x.unit].filter(Boolean).join(' ')}</div>}{x.note&&<div className="rc-line-meta">{x.note}</div>}<button className="rc-remove" onClick={()=>remove(x.key)}>Remove</button></div><span>{money(x.price*x.qty)}</span></div>)}
    {hasMoveOutItem&&<div className="rc-modifier"><strong>Move-Out Condition</strong><label><input type="checkbox" checked={moveOutHeavySoil} onChange={e=>setMoveOutHeavySoil(e.target.checked)}/> Severe pet mess / heavy soil (+$150.00)</label></div>}
    {hasBudgetItem&&<div className="rc-modifier"><strong>Project Budget</strong><div className="rc-line-meta">Event planning or interior holiday conversion uses 10% of the entered budget.</div><input type="number" min="0" step="0.01" value={eventBudget} onChange={e=>setEventBudget(e.target.value)} placeholder="e.g. 2500"/></div>}
    <div className="rc-total-row"><span>Base Subtotal</span><span>{money(totals.baseTotal)}</span></div>{totals.snackDelivery>0&&<div className="rc-fee-row"><span>Snack delivery</span><span>{money(totals.snackDelivery)}</span></div>}{totals.moveOutSurcharge>0&&<div className="rc-fee-row"><span>Heavy-soil surcharge</span><span>{money(totals.moveOutSurcharge)}</span></div>}{totals.eventPlanningFee>0&&<div className="rc-fee-row"><span>10% coordination fee</span><span>{money(totals.eventPlanningFee)}</span></div>}<div className="rc-total-row"><span>Estimated Grand Total</span><span>{money(totals.grandTotal)}</span></div>
    <div className="rc-form"><label htmlFor="resident-name">Resident Name & Unit</label><input id="resident-name" value={resident} onChange={e=>setResident(e.target.value)} placeholder="Alex — Unit 412"/><label htmlFor="payment">Payment Method</label><select id="payment" value={payment} onChange={e=>setPayment(e.target.value)}><option>Venmo</option><option>PayPal</option><option>Zelle</option><option>Cash upon arrival</option></select><label htmlFor="note">Field Team Notes</label><input id="note" value={note} onChange={e=>setNote(e.target.value)} placeholder="Gate code, preferred time, etc."/></div>
    <div className="rc-actions">{payment==='Venmo'&&<a className="rc-pay" href={`${VENMO_URL}?txn=pay&amount=${totals.grandTotal.toFixed(2)}`} target="_blank" rel="noreferrer">Pay {money(totals.grandTotal)} with Venmo</a>}{payment==='PayPal'&&<a className="rc-pay" href={`${PAYPAL_URL}/${totals.grandTotal.toFixed(2)}`} target="_blank" rel="noreferrer">Pay {money(totals.grandTotal)} with PayPal</a>}{payment==='Zelle'&&<button className="rc-pay" onClick={copyZelle}>Copy Zelle: {ZELLE}</button>}<a className="rc-wa" href="#whatsapp" onClick={e=>{e.preventDefault();send('whatsapp')}}>Send Ticket via WhatsApp</a><a className="rc-sms" href="#sms" onClick={e=>{e.preventDefault();send('sms')}}>Send Ticket via Text Message</a><button className="rc-close" onClick={()=>setOpen(false)}>Keep Browsing</button></div>
    <div className="rc-disclosure">Prices shown are Resident Rates and are not discounted again. Travel, variable project scope, and quoted work are finalized at booking. Dani Declares LLC does not draft legal documents or provide legal advice.<br/>(470) 485-7173 · admin@danideclares.com</div>
  </section></div>,document.body):null;

  return <div className="rc-page"><style>{css}</style><header className="rc-head"><div className="rc-eye">Dani Declares LLC · Resident Concierge</div><h1>We Pull Up. You Stay on Track.</h1><p>Snacks, cleaning, laundry, notary & more — order it, we deliver it.</p><div className="rc-discount">Welcome Packet Benefit: <b>15% Resident Pricing is already built into these rates.</b> No extra discount is applied at checkout.</div></header><nav className="rc-tabs" aria-label="Resident concierge categories">{CATALOG.map(x=><button key={x.cat} className={x.cat===category?'active':''} onClick={()=>setCategory(x.cat)}>{x.label}</button>)}</nav><main className="rc-main"><div className="rc-heading">{active.heading}</div>{active.sub&&<div className="rc-sub">{active.sub}</div>}{active.items.map(item=>{const idx=Number(variant[item.id]||0);const selected=item.variants?{price:item.variants[idx]}:{price:item.price};return <article className="rc-card" key={item.id}><div className="rc-name">{item.name}</div>{item.desc&&<div className="rc-desc">{item.desc}</div>}<div className="rc-row">{item.variants?<select className="rc-select" value={idx} onChange={e=>setVariant(v=>({...v,[item.id]:Number(e.target.value)}))}>{item.variants.map((p,i)=><option key={i} value={i}>{SIZES[i]} — {money(p)}{item.unit||''}</option>)}</select>:<div className="rc-price">{money(selected.price)}{item.unit?` ${item.unit}`:''}</div>}</div><div className="rc-controls"><button className="rc-qty" onClick={()=>setQty(q=>({...q,[item.id]:Math.max(1,(q[item.id]||1)-1)}))}>−</button><span>{qty[item.id]||1}</span><button className="rc-qty" onClick={()=>setQty(q=>({...q,[item.id]:(q[item.id]||1)+1}))}>+</button><button className="rc-add" onClick={()=>add(item)}>Add</button></div>{item.note&&<div className="rc-note">{item.note}</div>}</article>})}</main><div className="rc-bar"><button onClick={()=>setOpen(true)}><span><span className="rc-total">{money(totals.grandTotal)}</span><span className="rc-count">{count?`${count} item${count===1?'':'s'} on your ticket`:'Your ticket is empty'}</span></span><span className="rc-view">Review & Order →</span></button></div>{ticket}</div>;
}
