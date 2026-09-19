// Shared between CommercialCatalogPage (parent-category cards) and
// ServiceCategoryPage (the breakdown a card links to) so the two pages group
// and label families identically instead of drifting apart over time.
export const FAMILY_ALIASES={'01A Home & Cleaning':'Home & Cleaning','HOME':'Home & Cleaning','01B Pet Care & Household Pet Support':'Pet Care','PET':'Pet Care','Pet Care':'Pet Care','01D Household Concierge':'Household Concierge','CONCIERGE':'Household Concierge','01E Move & Household Transition':'Move & Household Transition','MOVE':'Move & Household Transition','AUTOMOTIVE':'Mobile Automotive & Vehicle Care','Mobile Automotive & Vehicle Care':'Mobile Automotive & Vehicle Care','Administrative & Business Operations':'Administrative & Business Operations','BUSINESS ADMIN':'Administrative & Business Operations','Creative Design & Production':'Creative Design & Production','CREATIVE PRODUCTION':'Creative Design & Production','EVENT':'Events & Experiences','Experiences & Resident Programming':'Events & Experiences','REAL ESTATE':'Real Estate & Closing Support','Real Estate & Closing Support':'Real Estate & Closing Support','SEASONAL':'Seasonal & Holiday Home Services','Seasonal & Holiday Home Services':'Seasonal & Holiday Home Services','ADD-ONS':'Add-Ons','PACKAGES':'Packages & Bundles','RECURRING':'Recurring Services'};
export const familyLabel=(family='')=>FAMILY_ALIASES[family]||family.replace(/^\d+[A-Z]?\s+/,'').replace(/^\d+[A-Z]\s+/,'');
export const baseServiceName=(name='')=>name.replace(/\s+(1BR|2BR|3BR|4BR)$/i,'').replace(/\s+—\s+(30|60)\s*min$/i,'').replace(/\s+—\s+(7|14|30)\s*Days$/i,'');
export const priceValue=s=>Number(s?.baseCustomerPrice??s?.publicPriceLow??0);
export const priceLabelFor=s=>s?.publicPriceDisplay||(s?.baseCustomerPrice!=null?`Starting at $${Number(s.baseCustomerPrice).toFixed(2)}`:'Request a quote');
export const money=n=>`$${Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2})}`;
export const groupedServices=items=>{const map=new Map();items.forEach(s=>{const base=baseServiceName(s.name);if(!map.has(base))map.set(base,[]);map.get(base).push(s);});return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));};

// The nav dropdowns and the homepage "who we serve" cards both link here with
// ?audience=residents|property|real-estate|business|government promising a
// filtered view for that audience.
export const AUDIENCE_LABELS={residents:'Residents',property:'Property Management',government:'Government & Institutions','real-estate':'Real Estate',business:'Businesses'};
export const AUDIENCE_FAMILIES={
 residents:['Home & Cleaning','Household Concierge','Pet Care','Indoor Plant Care','Home Watch','Move & Household Transition','Laundry & Organization','Seasonal & Holiday Home Services','Mobile Automotive & Vehicle Care','Events & Experiences','Yard Sale / Liquidation','Packages & Bundles','Add-Ons','Recurring Services','Logistics, Courier & Asset Sourcing','Notary & Document Services'],
 property:['Property, Facilities & Field Operations'],
 'real-estate':['Real Estate & Closing Support','Notary & Document Services'],
 business:['Administrative & Business Operations','Business Development & Growth','Business Formation & Digital Infrastructure','Marketing, Content & Media Production','Creative Design & Production','Classes, Workshops & Training','Logistics, Courier & Asset Sourcing','Events & Experiences','Notary & Document Services'],
 government:['Government & Institutional Procurement','Notary & Document Services']
};

// Family labels contain spaces, "&", and commas -- turn them into a clean,
// stable URL segment so /services/category/:slug never has to carry raw text.
export const familySlug=(label='')=>label.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

export function groupServicesByFamily(services){
 const map=new Map();
 services.forEach(s=>{const key=familyLabel(s.family||'Services');if(!map.has(key))map.set(key,[]);map.get(key).push(s);});
 return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
}
