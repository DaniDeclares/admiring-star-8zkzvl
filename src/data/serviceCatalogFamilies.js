// Customer-facing service taxonomy for /services and its category pages.
//
// The catalog's real `service_family` values (19 distinct, verified live
// 2026-09-19) are internal/catalog taxonomy -- several are near-duplicates
// from a customer's point of view (e.g. Business Development & Growth vs.
// Business Formation & Digital Infrastructure both read as "help with my
// business"). BUCKETS groups the real families into a small set of doors a
// customer can actually choose between; the underlying families/SKUs are
// untouched and still drive pricing, fulfillment, and the request flow.
export const BUCKETS = [
 {key:'home-resident-concierge',label:'Home & Resident Concierge',tagline:'Practical support for your home and everyday life.',visualFamily:'Home & Cleaning',families:['01A Home & Cleaning','01B Pet Care & Household Pet Support','01C Indoor Plant Care','01D Household Concierge','01E Move & Household Transition','01F Seasonal & Holiday Home Services','Recurring Services']},
 {key:'business-admin-support',label:'Business & Administrative Support',tagline:'Keep the work behind the work moving.',visualFamily:'Administrative & Business Operations',families:['Administrative & Business Operations']},
 {key:'business-setup-growth-digital',label:'Business Setup, Growth & Digital',tagline:'Build, launch, organize, and grow your business.',visualFamily:'Business Formation & Digital Infrastructure',families:['Business Development & Growth','Business Formation & Digital Infrastructure']},
 {key:'marketing-creative-brand',label:'Marketing, Creative & Brand Production',tagline:'Turn your ideas into polished business materials.',visualFamily:'Creative Design & Production',families:['Creative Design & Production','Marketing, Content & Media Production']},
 {key:'events-experiences',label:'Events & Experiences',tagline:'Plan, coordinate, and execute memorable experiences.',visualFamily:'Events & Experiences',families:['Experiences & Resident Programming']},
 {key:'property-facilities',label:'Property & Facilities Operations',tagline:'Keep properties, units, and facilities moving.',visualFamily:'Property, Facilities & Field Operations',families:['Property, Facilities & Field Operations']},
 {key:'real-estate-closing',label:'Real Estate & Closing Support',tagline:'Administrative and field support for real estate professionals.',visualFamily:'Real Estate & Closing Support',families:['Real Estate & Closing Support']},
 {key:'logistics-mobile-field',label:'Logistics & Mobile Field Services',tagline:'When something needs to be picked up, delivered, sourced, or handled.',visualFamily:'Logistics, Courier & Asset Sourcing',families:['Logistics, Courier & Asset Sourcing','Mobile Automotive & Vehicle Care']},
 {key:'government-procurement',label:'Government, Procurement & Readiness',tagline:'Support for institutional purchasing and vendor readiness.',visualFamily:'Government & Institutional Procurement',families:['Government & Institutional Procurement']},
 {key:'classes-training',label:'Classes & Training',tagline:'Workshops and sessions to build real skills.',visualFamily:'Classes, Workshops & Training',families:['Classes, Workshops & Training']},
 // Not SELL_NOW yet (still FULFILLMENT_GATED as of 2026-09-19) -- included so
 // this becomes its own door automatically the moment it's activated,
 // without anyone having to remember to add it later. Since no service in
 // this bucket is in the live catalog feed yet, it simply won't render.
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
