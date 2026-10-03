import { governedCH01FrontDoors } from '../../api-handlers/verify-commercial-intent.js';

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

const row = (sku, door, over = {}) => ({ sku, front_door_code: door, channel_code: 'CH01', status: 'LOCKED', customer_visible_candidate: true, disposition: 'FRONT_DOOR', ...over });

describe('catalog publishes the governed CH01 front door per service', () => {
 test('a SKU adjudicated to one door gets that door', () => {
  expect(governedCH01FrontDoors([row('DNI-01A-021', 'CH01-F01')]).get('DNI-01A-021')).toBe('CH01-F01');
 });
 test('a SKU adjudicated to several doors gets none, so the customer chooses', () => {
  expect(governedCH01FrontDoors([row('S', 'CH01-F01'), row('S', 'CH01-F02', { disposition: 'CONTROLLED_QUOTE' })]).has('S')).toBe(false);
 });
 test('unlocked, hidden, excluded or non-CH01 rows never publish a door', () => {
  const doors = governedCH01FrontDoors([
   row('A', 'CH01-F01', { status: 'DRAFT' }),
   row('B', 'CH01-F01', { customer_visible_candidate: false }),
   row('C', 'CH01-F01', { disposition: 'EXCLUDED' }),
   row('D', 'CH02-F01', { channel_code: 'CH02' }),
  ]);
  expect(doors.size).toBe(0);
 });
});
