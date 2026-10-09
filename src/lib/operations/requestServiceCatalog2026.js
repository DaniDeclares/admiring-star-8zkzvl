// Request-page catalog selection stays downstream of the governed commercial catalog.
// This module does not create pricing or service authority; it only filters the
// already customer-visible catalog payload for the relationship the customer chose.
//
// IMPORTANT: a division-level channel map is not commercial authorization. The
// catalog endpoint publishes the exact governed channel availability for each SKU;
// this picker fails closed unless that selected channel is explicitly authorized.

const INTAKE_TO_CHANNEL=Object.freeze({
 B2C:'CH01',
 B2B_APT:'CH02',
 B2B_RE:'CH03',
 B2B:'CH04',
 B2G:'CH05',
});

const governedChannel=channelType=>INTAKE_TO_CHANNEL[channelType]||'';

export function requestCatalogServices(services=[],channelType='',frontDoorCode=''){
 const channel=governedChannel(channelType);
 if(!channel)return [];
 return (services||[])
  .filter(service=>['SELL_NOW','INTAKE_ONLY'].includes(service?.commercialOfferStatus))
  .filter(service=>service?.releaseState==='LIVE_READY')
  .filter(service=>Array.isArray(service?.authorizedChannels)&&service.authorizedChannels.includes(channel))
  .filter(service=>channel!=='CH01'||!frontDoorCode||!service?.ch01FrontDoorCode||service.ch01FrontDoorCode===frontDoorCode)
  .sort((a,b)=>String(a?.family||'').localeCompare(String(b?.family||''))||String(a?.name||'').localeCompare(String(b?.name||'')));
}

export function selectRequestCatalogService(services=[],serviceId=''){
 return (services||[]).find(service=>service?.serviceId===serviceId)||null;
}

// A shared service link (/request-service?service=SKU) without channelType used to land on
// the Resident channel even when the SKU is not authorized for CH01, so the form showed the
// service as selected while the channel picker could not list it. Pick the channel the SKU
// is actually authorized for. An explicit, authorized channelType in the link always wins;
// this never widens authorization -- it only chooses among the SKU's own governed channels.
const LINK_CHANNEL_PREFERENCE=['B2C','B2B','B2B_RE','B2B_APT','B2G'];

export function channelTypeForLinkedService(service,requestedChannelType=''){
 const authorized=Array.isArray(service?.authorizedChannels)?service.authorizedChannels:[];
 if(requestedChannelType&&authorized.includes(governedChannel(requestedChannelType)))return requestedChannelType;
 if(requestedChannelType&&!service)return requestedChannelType;
 return LINK_CHANNEL_PREFERENCE.find(type=>authorized.includes(INTAKE_TO_CHANNEL[type]))||requestedChannelType||'B2C';
}
