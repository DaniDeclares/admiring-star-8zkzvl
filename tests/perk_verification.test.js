// filename: tests/perk_verification.test.js
// DANI DECLARES LLC — B2B RESIDENT PERK VERIFICATION INTEGRATION TESTS

import { validateResidentPerkCode } from '../src/services/residentPerkValidator.js';

describe('B2B Resident Perk Verification Engine Tests', () => {

  // Test 1: Valid Property Partner Code
  test('should validate active partner code ALL3-REALTY and apply 15% discount', () => {
    const result = validateResidentPerkCode('ALL3-REALTY');
    expect(result.valid).toBe(true);
    expect(result.communityName).toBe('All3 Realty Communities');
    expect(result.cleanDiscountPercent).toBe(15);
  });

  // Test 2: Case-Insensitive Code Input
  test('should handle lower-case code input gracefully', () => {
    const result = validateResidentPerkCode('tucker-oaks');
    expect(result.valid).toBe(true);
    expect(result.communityName).toBe('Tucker Oaks Apartment Homes');
  });

  // Test 3: Invalid / Malicious Code Rejection
  test('should reject invalid or non-existent perk codes', () => {
    const result = validateResidentPerkCode('MALICIOUS-HACK-CODE');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Invalid or expired');
  });

});
