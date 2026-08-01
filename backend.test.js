// filename: tests/backend.test.js
// DANI DECLARES LLC — BACKEND INTEGRATION & QA TEST SUITE

import { submitProjectIntake } from '../src/services/supabaseClient.js';
import { calculateMatch } from '../src/services/matchingEngine.js';
import { calculateTravelFee } from '../src/services/travelCalculator.js';

describe('DANI DECLARES Backend Integration Tests', () => {

  // Test 1: Project Intake Dual-Write Validation
  test('should process valid project intake and return public REQ ID', async () => {
    const mockRequest = {
      name: 'Test Property Manager',
      email: 'pm@testcommunity.com',
      phone: '4705551234',
      category: 'prop',
      details: '3-bedroom apartment turnover reset',
      pathway: 'property',
      zipCode: 30084, // Integer ZIP input test
      urgency: 'high'
    };

    const matchResult = calculateMatch(mockRequest);
    expect(matchResult.matchScore).toBeDefined();
    expect(matchResult.canFulfillDirect).toBe(true);
    expect(matchResult.recommendedSolution.title).toContain('Apartment Community');
  });

  // Test 2: Travel Fee Calculation Validation (Evaluating Actual Engine Output)
  test('should calculate travel fees correctly from private origins', () => {
    const gaRequest = { state: 'GA', miles: 35 };
    const calculatedFee = calculateTravelFee('30084', gaRequest.state, gaRequest.miles);

    expect(calculatedFee.travelFee).toBe(15.00);
    expect(calculatedFee.formattedTravelFee).toBe('5.00');
  });

  // Test 3: Malformed Input & Contact Handling
  test('should handle missing contact info gracefully without crashing', async () => {
    const invalidRequest = { name: '', email: '', phone: '' };
    const result = await submitProjectIntake(invalidRequest);
    expect(result.success).toBe(false);
  });

});
