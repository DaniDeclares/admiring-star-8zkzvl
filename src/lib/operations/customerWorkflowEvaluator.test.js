import { validateCustomerWorkflow } from './customerWorkflowEvaluator';

test('invalid workflow is rejected', () => {
  expect(validateCustomerWorkflow(null)).toContain('INVALID_RECIPE');
});
