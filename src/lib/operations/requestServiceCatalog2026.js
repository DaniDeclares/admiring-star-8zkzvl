// Request-page catalog selection stays downstream of the governed commercial catalog.
// This module does not create pricing or service authority; it only filters the
// already customer-visible catalog payload for the relationship the customer chose.

const CHANNELS_BY_DIVISION=Object.freeze({
 '01':['B2C','B2B_APT'],
 '02':['B2B_APT','B2B_RE','B2B','B2G'],
 '03':['B2B_RE','B2B_APT','B2B'],
 '04':['B2B','B2B_RE','B2B_APT','B2G'],
 '05':['B2C','B2B_APT','B2B_RE','B2G'],
 '06':['B2B','B2B_RE','B2G'],
 '07':['B2C','B2B_APT','B2B_RE','B2B','B2G'],
 '08':['B2B_RE','B2B','B2G'],
 '09':['B2C','B2B_APT','B2B_RE','B2B','B2G'],
 '10':['B2C','B2B_APT','B2B_RE','B2B'],
 '11':['B2C','B2B_APT','B2B_RE','B2B','B2G'],
 '12':['B2C','B2B_APT','B2B_RE','B2B','B2G'],
 '13':['B2B_APT','B2B_RE','B2B','B2G'],
});

export function requestCatalogServices(services=[],channelType='',frontDoorCode=''){
 return (services||[])
  .filter(service=>['SELL_NOW','INTAKE_ONLY'].includes(service?.commercialOfferStatus))
  .filter(service=>service?.releaseState==='LIVE_READY')
  .filter(service=>(CHANNELS_BY_DIVISION[String(service?.division||'').padStart(2,'0')]||[]).includes(channelType))
  .filter(service=>channelType!=='B2C'||!frontDoorCode||!service?.ch01FrontDoorCode||service.ch01FrontDoorCode===frontDoorCode)
  .sort((a,b)=>String(a?.family||'').localeCompare(String(b?.family||''))||String(a?.name||'').localeCompare(String(b?.name||'')));
}

export function selectRequestCatalogService(services=[],serviceId=''){
 return (services||[]).find(service=>service?.serviceId===serviceId)||null;
}
