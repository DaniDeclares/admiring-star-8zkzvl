/**
 * Narrow extension of existing /api/intake-webhook for unpriced, unbooked
 * outcome-first/general projects. Never resolves a service, eligibility,
 * price, commercial intent or booking on this route.
 */
export function validateGeneralProjectIntake(body={}) {
  if(body.requestMode!=='GENERAL_PROJECT')return {isGeneral:false,allowed:true};
  const forbidden=['serviceId','pricingServiceId','commercialIntent','requestedStartAt','frontDoorCode'];
  const conflicting=forbidden.filter(key=>body[key]!=null&&body[key]!==''&&body[key]!==false);
  if(conflicting.length)return {isGeneral:true,allowed:false,reason:'GENERAL_PROJECT_CANNOT_BYPASS_SERVICE_OR_BOOKING_GATES'};
  if(String(body.details||'').trim().length<12)
    return {isGeneral:true,allowed:false,reason:'Please briefly describe what you would like DANI to accomplish.'};
  const street=String(body.locationAddress||'').trim();
  const city=String(body.locationCity||'').trim();
  const state=String(body.locationState||'').trim().toUpperCase();
  const zip=String(body.locationZip||'').trim();
  if(street && (!city||!['GA','SC'].includes(state)||!/^[0-9]{5}(?:-[0-9]{4})?$/.test(zip)))
    return {isGeneral:true,allowed:false,reason:'If providing a street address, include city, GA/SC state and ZIP.'};
  if(state && !['GA','SC'].includes(state))
    return {isGeneral:true,allowed:false,reason:'Please select Georgia or South Carolina, or leave the location for later scoping.'};
  if(zip && !/^[0-9]{5}(?:-[0-9]{4})?$/.test(zip))
    return {isGeneral:true,allowed:false,reason:'Please enter a valid ZIP, or leave it for later scoping.'};
  return {isGeneral:true,allowed:true,locationAddress:street?[street,city,state,zip].join(', '):null};
}
