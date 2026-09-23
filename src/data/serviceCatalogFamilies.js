// Customer-facing service taxonomy for /services and its category pages.
//
// IMPORTANT: the live site's eligibility comes from
// dd_governed_service_offers.commercial_offer_status, NOT
// services.commercial_intent_status -- the two can and do drift apart. An
// earlier version of this file was built against the wrong field and only
// covered 19 families; the real live-eligible catalog (commercial_offer_status
// IN ('SELL_NOW','INTAKE_ONLY'), verified 2026-09-19) has 32 distinct
// service_family values, several divisions split across 2-7 near-duplicate
// family labels for genuinely distinct (not duplicate) services -- e.g.
// Division 04 alone spans 7 family values for 56 real services. BUCKETS maps
// all 32 into a small set of doors a customer can actually choose between;
// the underlying families/SKUs are untouched and still drive pricing,
// fulfillment, and the request flow. If dd_governed_service_offers gains a
// new family value later, it lands in OTHER_BUCKET below instead of
// silently vanishing -- that's the signal this list needs updating again.
export const BUCKETS = [
 {key:'home-resident-concierge',label:'Home & Resident Concierge',tagline:'Practical support for your home and everyday life.',visualFamily:'Home & Cleaning',families:['01A Home & Cleaning','01B Pet Care & Household Pet Support','01C Indoor Plant Care','01D Household Concierge','01E Move & Household Transition','01F Seasonal & Holiday Home Services','Recurring Services']},
 {key:'business-admin-support',label:'Business & Administrative Support',tagline:'Keep the work behind the work moving.',visualFamily:'Administrative & Business Operations',families:['Administrative & Business Operations','04A Administrative & Document Services','04A Business Operations Support','04A Document Preparation & Submission Support','04A Money, CRM & Follow-Up']},
 {key:'business-setup-growth-digital',label:'Business Setup, Growth & Digital',tagline:'Build, launch, organize, and grow your business.',visualFamily:'Business Formation & Digital Infrastructure',families:['Business Development & Growth','Business Formation & Digital Infrastructure','06A Website, Booking & Payments','04A R.E.A.C.H. Outside Company Buildouts']},
 {key:'marketing-creative-brand',label:'Marketing, Creative & Brand Production',tagline:'Turn your ideas into polished business materials.',visualFamily:'Creative Design & Production',families:['Creative Design & Production','Marketing, Content & Media Production','11A Merch & Brand Products']},
 {key:'events-experiences',label:'Events & Experiences',tagline:'Plan, coordinate, and execute memorable experiences.',visualFamily:'Events & Experiences',families:['Experiences & Resident Programming','Events & Experiences','10A Events & Community Support']},
 {key:'property-facilities',label:'Property & Facilities Operations',tagline:'Keep properties, units, and facilities moving.',visualFamily:'Property, Facilities & Field Operations',families:['Property, Facilities & Field Operations','02A Property Operations & Turnover Packages']},
 {key:'real-estate-closing',label:'Real Estate & Closing Support',tagline:'Administrative and field support for real estate professionals.',visualFamily:'Real Estate & Closing Support',families:['Real Estate & Closing Support']},
 {key:'logistics-mobile-field',label:'Logistics & Mobile Field Services',tagline:'When something needs to be picked up, delivered, sourced, or handled.',visualFamily:'Logistics, Courier & Asset Sourcing',families:['Logistics, Courier & Asset Sourcing','Mobile Automotive & Vehicle Care']},
 {key:'government-procurement',label:'Government, Procurement & Readiness',tagline:'Support for institutional purchasing and vendor readiness.',visualFamily:'Government & Institutional Procurement',families:['Government & Institutional Procurement','04A Government & Vendor Readiness']},
 {key:'classes-training',label:'Classes & Training',tagline:'Workshops and sessions to build real skills.',visualFamily:'Classes, Workshops & Training',families:['Classes, Workshops & Training']},
 {key:'notary-signing',label:'Notary & Signing Services',tagline:'Professional document signing and notary support.',visualFamily:'Real Estate & Closing Support',families:['05A Notary & Signing Services','Notary & Document Services']},
];

const FAMILY_TO_BUCKET=(()=>{const map=new Map();BUCKETS.forEach(b=>b.families.forEach(f=>map.set(f,b.key)));return map;})();
const BUCKET_BY_KEY=new Map(BUCKETS.map(b=>[b.key,b]));
// Any real family not yet mapped above lands here instead of silently
// disappearing, so a new service_family value shows up as a visible gap
// rather than vanishing from the public site.
const OTHER_BUCKET={key:'other-services',label:'Other Services',tagline:'Additional services.',visualFamily:'Administrative & Business Operations',families:[]};

export const baseServiceName=(name='')=>name.replace(/\s+(1BR|2BR|3BR|4BR)$/i,'').replace(/\s+—\s+(30|60)\s*min$/i,'').replace(/\s+—\s+(7|14|30)\s*Days$/i,'');
export const priceValue=s=>Number(s?.baseCustomerPrice??s?.publicPriceLow??0);
export const priceLabelFor=s=>s?.publicPriceDisplay||(s?.baseCustomerPrice!=null?`Starting at $${Number(s.baseCustomerPrice).toFixed(2)}`:'Request a quote');
export const money=n=>`$${Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2})}`;
export const groupedServices=items=>{const map=new Map();items.forEach(s=>{const base=baseServiceName(s.name);if(!map.has(base))map.set(base,[]);map.get(base).push(s);});return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));};

export function bucketForFamily(family){return BUCKET_BY_KEY.get(FAMILY_TO_BUCKET.get(family))||OTHER_BUCKET;}

// Groups the live catalog feed into buckets, in BUCKETS order, dropping any
// bucket with zero live services (this is what makes Notary & Signing
// Services -- and any future empty bucket -- invisible until it has real
// SELL_NOW services, with no manual toggle required).
export function groupServicesByBucket(services){
 const map=new Map();
 services.forEach(s=>{const bucket=bucketForFamily(s.family);if(!map.has(bucket.key))map.set(bucket.key,{bucket,items:[]});map.get(bucket.key).items.push(s);});
 return [...BUCKETS,OTHER_BUCKET].map(b=>map.get(b.key)).filter(Boolean);
}

export const bucketByKey=key=>BUCKET_BY_KEY.get(key)||(key===OTHER_BUCKET.key?OTHER_BUCKET:null);

// Division 01 (the Home & Resident Concierge bucket) spans 7 real
// service_family values covering very different jobs, so its category page
// splits it further into 5 human-centric "ecosystems". This is a display
// grouping only, over the same families used above -- the underlying
// service_family column is never touched.
export const HOME_ECOSYSTEMS=[
 {key:'deep-cleaning-surface-care',label:'Deep Cleaning & Surface Care',families:['01A Home & Cleaning']},
 {key:'pet-plant-care',label:'Pet & Plant Care',families:['01B Pet Care & Household Pet Support','01C Indoor Plant Care']},
 {key:'concierge-organization-errands',label:'Household Concierge, Organization & Errands',families:['01D Household Concierge']},
 {key:'moves-transitions',label:'Moves & Household Transitions',families:['01E Move & Household Transition']},
 {key:'seasonal-recurring-care',label:'Seasonal & Recurring Home Care',families:['01F Seasonal & Holiday Home Services','Recurring Services']},
];
const FAMILY_TO_ECOSYSTEM=(()=>{const map=new Map();HOME_ECOSYSTEMS.forEach(e=>e.families.forEach(f=>map.set(f,e.key)));return map;})();
const ECOSYSTEM_BY_KEY=new Map(HOME_ECOSYSTEMS.map(e=>[e.key,e]));
const OTHER_ECOSYSTEM={key:'other-home-services',label:'Other Home Services'};

export function groupServicesByEcosystem(items){
 const map=new Map();
 items.forEach(s=>{const key=FAMILY_TO_ECOSYSTEM.get(s.family)||OTHER_ECOSYSTEM.key;if(!map.has(key))map.set(key,{ecosystem:ECOSYSTEM_BY_KEY.get(key)||OTHER_ECOSYSTEM,items:[]});map.get(key).items.push(s);});
 return [...HOME_ECOSYSTEMS,OTHER_ECOSYSTEM].map(e=>map.get(e.key)).filter(Boolean);
}

// Which doors are relevant when someone arrives via a "Who We Serve" link
// (?audience=residents|property|real-estate|business|government). A
// curatorial judgment call, not a database fact -- revisit if it stops
// matching how people actually shop.
export const AUDIENCE_LABELS={residents:'Residents',property:'Property Management',government:'Government & Institutions','real-estate':'Real Estate',business:'Businesses'};
export const AUDIENCE_BUCKETS={
 residents:['home-resident-concierge','events-experiences','classes-training','logistics-mobile-field','notary-signing'],
 property:['property-facilities','logistics-mobile-field','home-resident-concierge'],
 'real-estate':['real-estate-closing','notary-signing','classes-training'],
 business:['business-admin-support','business-setup-growth-digital','marketing-creative-brand','classes-training','logistics-mobile-field','events-experiences'],
 government:['government-procurement','notary-signing','classes-training'],
};
