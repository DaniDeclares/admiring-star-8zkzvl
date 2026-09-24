import { calculateTravelEconomics, routingCredentialStatus } from './googleRouting2026.js';

describe('google routing economics adapter',()=>{
  const original=process.env.GOOGLE_MAPS_SERVER_API_KEY;
  afterEach(()=>{
    if(original===undefined) delete process.env.GOOGLE_MAPS_SERVER_API_KEY;
    else process.env.GOOGLE_MAPS_SERVER_API_KEY=original;
  });

  test('reports credential state without exposing the credential',()=>{
    process.env.GOOGLE_MAPS_SERVER_API_KEY='secret-value';
    expect(routingCredentialStatus()).toEqual({
      provider:'GOOGLE_MAPS_PLATFORM',
      configured:true,
      environmentVariable:'GOOGLE_MAPS_SERVER_API_KEY'
    });
  });

  test('applies DANI mileage policy to road distance',()=>{
    expect(calculateTravelEconomics({
      route:{oneWayMiles:20,roundTripMiles:40},
      mileageRatePerMile:0.76,
      includedOneWayMiles:15,
      customerExcessMileageRate:2.50
    })).toEqual({
      oneWayMiles:20,
      roundTripMiles:40,
      mileageRatePerMile:0.76,
      includedOneWayMiles:15,
      billableOneWayMiles:5,
      operatingCost:30.4,
      customerTravelCharge:12.5,
      policy:'DANI_ROUTE_ECONOMICS_V1'
    });
  });
});
