export const MARKET_CONFIGS = {
  ATL: {
    label: 'Atlanta Metro',
    laborRate: 95,
    mileageIncluded: 25,
    mileageRate: 1.25,
    taxRate: 0.07
  },
  SC_UPSTATE: {
    label: 'South Carolina Upstate',
    laborRate: 88,
    mileageIncluded: 20,
    mileageRate: 1.1,
    taxRate: 0.06
  },
  AUGUSTA: {
    label: 'Augusta',
    laborRate: 85,
    mileageIncluded: 20,
    mileageRate: 1.0,
    taxRate: 0.06
  },
  CHARLOTTE: {
    label: 'Charlotte',
    laborRate: 92,
    mileageIncluded: 30,
    mileageRate: 1.35,
    taxRate: 0.07
  }
};

export function getMarketConfig(marketCode) {
  return MARKET_CONFIGS[marketCode] || MARKET_CONFIGS.ATL;
}
