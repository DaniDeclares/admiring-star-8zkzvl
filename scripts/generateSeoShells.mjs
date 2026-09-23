import fs from 'node:fs';
import path from 'node:path';

const origin='https://danideclares.com';
const routes={
 '/': ['DANI DECLARES LLC | Operations, Execution & Support','Mobile resident, property, real estate, business, event, field and institutional support across Metro Atlanta and regional South Carolina.','DANI DECLARES handles the execution for residents, property teams, real estate professionals, businesses, government and institutional clients.'],
 '/services':['Services | DANI DECLARES','Explore DANI DECLARES services for residents, property teams, real estate professionals, businesses and institutional clients.','Explore mobile and field services from DANI DECLARES, including household support, property operations, real estate support, business execution and institutional services.'],
 '/resident-concierge':['Resident Concierge | DANI DECLARES','Mobile resident support for household resets, organization, document support and everyday execution needs.','Resident and household support for cleaning, organization, document needs and everyday execution.'],
 '/services/property':['Property & Apartment Support | DANI DECLARES','Unit turns, field documentation, punch support, inspections and resident-experience services for property teams.','Property and apartment support including unit turns, field documentation, inspections, punch support and resident experience execution.'],
 '/real-estate':['Real Estate Support | DANI DECLARES','Listing preparation, open-house support, field execution and administrative support for real estate professionals.','Execution support for real estate offices and brokerages, including listing preparation, open-house support, field work and administration.'],
 '/services/business-solutions':['Business Support | DANI DECLARES','Administrative, field, print, event and operational execution support for businesses.','Business support spanning administration, field execution, print and production, events and operational projects.'],
 '/industries/government':['Government & Institutional Support | DANI DECLARES','Facilities, administrative, field documentation, courier and program-logistics support for government and institutional buyers.','Government and institutional capabilities include facilities support, administration, field documentation, courier and program logistics.'],
 '/services/federal':['Federal Contracting Capabilities | DANI DECLARES','DANI DECLARES capabilities for federal facilities, administrative, field and program-support requirements.','Federal contracting capabilities for facilities, administrative, field and program-support requirements.'],
 '/services/facility-visits':['Facility Visits & Field Documentation | DANI DECLARES','On-site facility visits, inspections, photo documentation and field support across the DANI DECLARES service area.','On-site facility visits, inspections, photo documentation and field execution support.'],
 '/services/events':['Event Support | DANI DECLARES','Setup, takedown, staging and execution support for business, property and community events.','Event execution support including setup, takedown, staging and coordinated field support.'],
 '/services/print-studio':['Print & Production Support | DANI DECLARES','Business print, signage, apparel and production support through DANI DECLARES.','Print and production support for business materials, signage, apparel and related execution.'],
 '/request-service':['Request Service | DANI DECLARES','Tell DANI DECLARES what needs to be handled. We will confirm scope, timing, service fit and pricing before work begins.','Request service from DANI DECLARES. Tell us what needs to be handled and we will confirm scope, timing, service fit and pricing.'],
 '/packages':['Service Packages | DANI DECLARES','Explore DANI DECLARES service packages and request a scope tailored to your needs.','Explore service packages and request a tailored scope from DANI DECLARES.'],
 '/membership':['Membership | DANI DECLARES','Explore recurring DANI DECLARES support options for eligible customers.','Explore recurring support options from DANI DECLARES.'],
 '/partner-network':['Provider Network | DANI DECLARES','Learn about the DANI DECLARES provider network and how qualified independent service providers can apply.','Qualified independent service providers can learn about the DANI DECLARES provider network and submit an inquiry.'],
 '/about':['About DANI DECLARES','Learn how DANI DECLARES handles mobile operations, execution and support for customers across Metro Atlanta and regional South Carolina.','DANI DECLARES is a mobile operations and execution company serving customers across Metro Atlanta and regional South Carolina.'],
 '/contact':['Contact DANI DECLARES','Contact DANI DECLARES for service, business and general inquiries.','Contact DANI DECLARES for service, business and general inquiries.'],
 '/blog':['DANI DECLARES Blog','Practical updates, service information and operational insights from DANI DECLARES.','Practical updates, service information and operational insights from DANI DECLARES.'],
 '/terms':['Terms | DANI DECLARES','Terms governing use of DANI DECLARES services and website.','Review the terms governing use of DANI DECLARES services and website.'],
 '/privacy':['Privacy Policy | DANI DECLARES','Read the DANI DECLARES privacy policy.','Read the DANI DECLARES privacy policy.']
};
const source=fs.readFileSync(path.join('build','index.html'),'utf8');
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
fs.mkdirSync(path.join('build','seo'),{recursive:true});
for(const [route,[title,description,copy]] of Object.entries(routes)){
 const canonical=origin+(route==='/'?'/':route);
 let html=source
  .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
  .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${esc(description)}"/>`)
  .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${esc(title)}"/>`)
  .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${esc(description)}"/>`)
  .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}"/>`)
  .replace('</head>',`<link rel="canonical" href="${canonical}"/></head>`)
  .replace('<div id="root"></div>',`<div id="root"><main><h1>${esc(title.replace(/ \| DANI DECLARES$/,''))}</h1><p>${esc(copy)}</p><p><a href="/request-service">Request service</a></p></main></div>`);
 const name=route==='/'?'home':route.slice(1).replaceAll('/','--');
 fs.writeFileSync(path.join('build','seo',name+'.html'),html);
}
