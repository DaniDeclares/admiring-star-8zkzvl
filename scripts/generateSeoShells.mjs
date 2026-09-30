import fs from 'node:fs';
import path from 'node:path';

const origin='https://danideclares.com';
const routes={
 '/': ['DANI DECLARES LLC | Home, Property & Business Support in Atlanta','DANI DECLARES provides home cleaning, property, real estate, business, field and operational support across Metro Atlanta and regional South Carolina.','DANI DECLARES handles the execution for residents, property teams, real estate professionals and businesses.'],
 '/services':['Services in Atlanta & Regional South Carolina | DANI DECLARES','Explore home, property, real estate, business, event, field and operational services from DANI DECLARES.','Explore DANI DECLARES services and request the scope that fits your needs.'],
 '/resident-concierge':['Home Cleaning & Resident Concierge Services | DANI DECLARES','Home cleaning, household resets, organization and concierge support across Metro Atlanta.','Home cleaning, household resets, organization and concierge support.'],
 '/services/property':['Apartment Turnover & Property Support in Atlanta | DANI DECLARES','Unit turns, make-ready cleaning, field documentation, punch support and property readiness services for Atlanta-area property teams.','Apartment turnover, make-ready, field documentation and property readiness support.'],
 '/real-estate':['Real Estate Support | DANI DECLARES','Listing preparation, open-house support, field execution and administrative support for real estate professionals.','Execution support for real estate offices and brokerages.'],
 '/services/business-solutions':['Business Support | DANI DECLARES','Administrative, field, print, event and operational execution support for businesses.','Business support spanning administration, field execution, print, events and operations.'],
 '/industries/government':['Government & Institutional Support | DANI DECLARES','Facilities, administrative, field documentation, courier and program-logistics support for government and institutional buyers.','Government and institutional support capabilities.'],
 '/services/federal':['Federal Contracting Capabilities | DANI DECLARES','DANI DECLARES capabilities for federal facilities, administrative, field and program-support requirements.','Federal facilities, administrative, field and program-support capabilities.'],
 '/services/facility-visits':['Facility Visits & Field Documentation | DANI DECLARES','On-site facility visits, inspections, photo documentation and field support across the DANI DECLARES service area.','On-site facility visits and field documentation support.'],
 '/services/events':['Event Support | DANI DECLARES','Setup, takedown, staging and execution support for business, property and community events.','Event setup, takedown, staging and coordinated execution.'],
 '/services/print-studio':['Print & Production Support | DANI DECLARES','Business print, signage, apparel and production support through DANI DECLARES.','Print, signage, apparel and production support.'],
 '/request-service':['Request Service | DANI DECLARES','Tell DANI DECLARES what needs to be handled. We will confirm scope, timing, service fit and pricing before work begins.','Request service and tell us what needs to be handled.'],
 '/packages':['Service Packages | DANI DECLARES','Explore DANI DECLARES service packages and request a scope tailored to your needs.','Explore service packages and request a tailored scope.'],
 '/membership':['Membership | DANI DECLARES','Explore recurring DANI DECLARES support options for eligible customers.','Explore recurring support options.'],
 '/partner-network':['Provider Network | DANI DECLARES','Learn about the DANI DECLARES provider network and how qualified independent service providers can apply.','Qualified independent service providers can learn about the provider network.'],
 '/about':['About DANI DECLARES','Learn how DANI DECLARES handles mobile operations, execution and support for customers across Metro Atlanta and regional South Carolina.','DANI DECLARES is a mobile operations and execution company serving Metro Atlanta and regional South Carolina.'],
 '/contact':['Contact DANI DECLARES','Contact DANI DECLARES for service, business and general inquiries.','Contact DANI DECLARES for service and business inquiries.'],
 '/blog':['DANI DECLARES Blog','Practical updates, service information and operational insights from DANI DECLARES.','Practical updates and operational insights from DANI DECLARES.'],
 '/terms':['Terms | DANI DECLARES','Terms governing use of DANI DECLARES services and website.','Review the website and service terms.'],
 '/privacy':['Privacy Policy | DANI DECLARES','Read the DANI DECLARES privacy policy.','Read the privacy policy.'],
 '/service-areas/home-cleaning-atlanta-ga':['Home Cleaning & Household Support in Atlanta, GA | DANI DECLARES','Residential cleaning and household support coordinated around your scope, timing and access needs.','Home cleaning and household support across Atlanta and surrounding Metro Atlanta communities.'],
 '/service-areas/deep-cleaning-atlanta-ga':['Deep Cleaning & Home Reset in Atlanta, GA | DANI DECLARES','Detailed residential deep-cleaning and home-reset support for spaces that need more than routine maintenance.','Deep cleaning and home-reset support for detailed residential resets.'],
 '/service-areas/move-in-move-out-cleaning-atlanta-ga':['Move-In & Move-Out Cleaning in Atlanta, GA | DANI DECLARES','Move-in and move-out cleaning and reset support designed around property condition, access and readiness requirements.','Move-in and move-out cleaning and reset support.'],
 '/service-areas/apartment-turnover-atlanta-ga':['Apartment Turnover & Make-Ready Support in Atlanta, GA | DANI DECLARES','Turnover and make-ready support for property teams, including cleaning, field documentation and punch support.','Apartment turnover and make-ready support for Atlanta-area property teams.'],
 '/service-areas/mobile-notary-tucker-ga':['Mobile Notary Public Services in Tucker, GA | DANI DECLARES','Mobile notary support for scheduled and same-day requests in Tucker and surrounding Metro Atlanta communities.','Mobile notary support subject to availability and applicable commission requirements.']
};
const source=fs.readFileSync(path.join('build','index.html'),'utf8');
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const json=s=>JSON.stringify(s).replace(/</g,'\\u003c');
fs.mkdirSync(path.join('build','seo'),{recursive:true});
for(const [route,[title,description,copy]] of Object.entries(routes)){
 const canonical=origin+(route==='/'?'/':route);
 const isLanding=route.startsWith('/service-areas/');
 const business={"@context":"https://schema.org","@type":["LocalBusiness","ProfessionalService"],"@id":origin+"/#organization",name:"DANI DECLARES LLC",url:origin,telephone:"+14704857173",areaServed:["Metro Atlanta","Regional South Carolina"],sameAs:["https://www.google.com/maps/place/Dani+Declares+LLC/data=!4m2!3m1!1s0x0:0x89f6128572e1cc20"]};
 const schema=isLanding
  ? {
      ...business,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: title.replace(" | DANI DECLARES", ""),
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: title.replace(" | DANI DECLARES", ""),
              areaServed: route.includes("tucker") ? "Tucker, Georgia" : "Metro Atlanta, Georgia"
            }
          }
        ]
      }
    }
  : business;
 let html=source
  .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
   .replace(new RegExp('<meta name="description" content="[^"]*"\\s*/>'), `<meta name="description" content="${esc(description)}"/>`)
   .replace(new RegExp('<meta property="og:title" content="[^"]*"\\s*/>'), `<meta property="og:title" content="${esc(title)}"/>`)
   .replace(new RegExp('<meta property="og:description" content="[^"]*"\\s*/>'), `<meta property="og:description" content="${esc(description)}"/>`)
   .replace(new RegExp('<meta property="og:url" content="[^"]*"\\s*/>'), `<meta property="og:url" content="${canonical}"/>`)
  .replace('</head>',`<link rel="canonical" href="${canonical}"/><meta name="robots" content="index,follow"/><script type="application/ld+json">${json(schema)}</script></head>`)
  .replace('<div id="root"></div>',`<div id="root"><main><h1>${esc(title.replace(/ \| DANI DECLARES$/,''))}</h1><p>${esc(copy)}</p><p><a href="/request-service">Request service</a></p></main></div>`);
 const outputDir=route==='/' ? 'build' : path.join('build', route.replace(/^\\//,''));
 fs.mkdirSync(outputDir,{recursive:true});
 fs.writeFileSync(path.join(outputDir,'index.html'),html);
}
