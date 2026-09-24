const MAPS_KEY_ENV='GOOGLE_MAPS_SERVER_API_KEY';

const requiredKey=()=>{
  const key=String(process.env[MAPS_KEY_ENV]||'').trim();
  if(!key){
    const error=new Error('ROUTING_CREDENTIAL_NOT_CONFIGURED');
    error.code='ROUTING_CREDENTIAL_NOT_CONFIGURED';
    throw error;
  }
  return key;
};

const cleanAddress=value=>String(value||'').replace(/\s+/g,' ').trim();

export function routingCredentialStatus(){
  return {provider:'GOOGLE_MAPS_PLATFORM',configured:Boolean(String(process.env[MAPS_KEY_ENV]||'').trim()),environmentVariable:MAPS_KEY_ENV};
}

export async function geocodeDispatchAddress(address){
  const key=requiredKey();
  const normalized=cleanAddress(address);
  if(!normalized) throw new Error('ROUTING_ADDRESS_REQUIRED');
  const url=new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address',normalized);
  url.searchParams.set('key',key);
  const response=await fetch(url,{headers:{accept:'application/json'}});
  if(!response.ok) throw new Error(`GEOCODING_HTTP_${response.status}`);
  const payload=await response.json();
  const result=payload?.results?.[0];
  if(payload?.status!=='OK'||!result?.geometry?.location) throw new Error(`GEOCODING_${payload?.status||'NO_RESULT'}`);
  const components=Object.fromEntries((result.address_components||[]).flatMap(c=>(c.types||[]).map(type=>[type,c.short_name])));
  return {
    latitude:Number(result.geometry.location.lat),
    longitude:Number(result.geometry.location.lng),
    formattedAddress:result.formatted_address||normalized,
    placeId:result.place_id||null,
    state:components.administrative_area_level_1||null,
    county:components.administrative_area_level_2||null,
    postalCode:components.postal_code||null,
    source:'GOOGLE_GEOCODING_API'
  };
}

export async function computeRoadRoute({origin,destination}){
  const key=requiredKey();
  if(!origin?.latitude||!origin?.longitude||!destination?.latitude||!destination?.longitude) throw new Error('ROUTING_COORDINATES_REQUIRED');
  const response=await fetch('https://routes.googleapis.com/directions/v2:computeRoutes',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'X-Goog-Api-Key':key,
      'X-Goog-FieldMask':'routes.distanceMeters,routes.duration'
    },
    body:JSON.stringify({
      origin:{location:{latLng:{latitude:Number(origin.latitude),longitude:Number(origin.longitude)}}},
      destination:{location:{latLng:{latitude:Number(destination.latitude),longitude:Number(destination.longitude)}}},
      travelMode:'DRIVE',
      routingPreference:'TRAFFIC_UNAWARE',
      computeAlternativeRoutes:false,
      units:'IMPERIAL'
    })
  });
  if(!response.ok) throw new Error(`ROUTES_HTTP_${response.status}`);
  const payload=await response.json();
  const route=payload?.routes?.[0];
  if(!route?.distanceMeters) throw new Error('ROUTE_NOT_FOUND');
  const oneWayMiles=Math.round((Number(route.distanceMeters)/1609.344)*100)/100;
  return {
    oneWayMiles,
    roundTripMiles:Math.round(oneWayMiles*2*100)/100,
    duration:route.duration||null,
    distanceMeters:Number(route.distanceMeters),
    source:'GOOGLE_ROUTES_API',
    trafficModel:'TRAFFIC_UNAWARE'
  };
}

export function calculateTravelEconomics({route,mileageRatePerMile=0.76,includedOneWayMiles=15,customerExcessMileageRate=2.50}={}){
  if(!route||!Number.isFinite(Number(route.oneWayMiles))) throw new Error('ROUTE_REQUIRED');
  const oneWay=Math.max(0,Number(route.oneWayMiles));
  const roundTrip=Math.max(0,Number(route.roundTripMiles??oneWay*2));
  const operatingCost=Math.round(roundTrip*Number(mileageRatePerMile)*100)/100;
  const billableOneWay=Math.max(0,oneWay-Number(includedOneWayMiles||0));
  const customerTravelCharge=Math.round(billableOneWay*Number(customerExcessMileageRate)*100)/100;
  return {
    oneWayMiles:oneWay,
    roundTripMiles:roundTrip,
    mileageRatePerMile:Number(mileageRatePerMile),
    includedOneWayMiles:Number(includedOneWayMiles),
    billableOneWayMiles:Math.round(billableOneWay*100)/100,
    operatingCost,
    customerTravelCharge,
    policy:'DANI_ROUTE_ECONOMICS_V1'
  };
}
