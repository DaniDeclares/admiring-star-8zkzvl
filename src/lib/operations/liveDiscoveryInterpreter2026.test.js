import { interpretLiveDiscoveryText } from './liveDiscoveryInterpreter2026.js';

test('extracts bathroom count from spelled-out numbers', () => {
  const evidence = interpretLiveDiscoveryText('She actually just needs two bathrooms done.');
  expect(evidence.extractedFacts).toContainEqual(expect.objectContaining({ key:'bathroom_count', value:2 }));
});

test('extracts bedroom/bathroom shorthand', () => {
  const evidence = interpretLiveDiscoveryText('2BR/2BA deep cleaning, every two weeks');
  expect(evidence.extractedFacts).toContainEqual(expect.objectContaining({ key:'bedroom_count', value:2 }));
  expect(evidence.extractedFacts).toContainEqual(expect.objectContaining({ key:'bathroom_count', value:2 }));
  expect(evidence.extractedFacts).toContainEqual(expect.objectContaining({ key:'clean_type', value:'DEEP' }));
  expect(evidence.extractedFacts).toContainEqual(expect.objectContaining({ key:'recurring_frequency', value:'BIWEEKLY' }));
});

test('pet presence alone never sets a severity fact', () => {
  const evidence = interpretLiveDiscoveryText('3BR/2BA deep clean, they do have a dog in the home');
  expect(evidence.extractedFacts).toContainEqual(expect.objectContaining({ key:'pet_present', value:true }));
  expect(evidence.extractedFacts.find(f => f.key === 'pet_condition_severity')).toBeUndefined();
});

test('explicit severity language does set the severity fact', () => {
  const evidence = interpretLiveDiscoveryText('there is a severe pet mess in the home from the dog');
  expect(evidence.extractedFacts).toContainEqual(expect.objectContaining({ key:'pet_condition_severity', value:'SEVERE' }));
});

test('detects an explicit negative-scope exclusion', () => {
  const evidence = interpretLiveDiscoveryText('garage cleaning and organization, but I do not need junk or clutter removed');
  expect(evidence.negativeScope.some(n => n.key === 'junk')).toBe(true);
});

test('does not ask the junk/clutter clarifying question once it has been answered explicitly', () => {
  const evidence = interpretLiveDiscoveryText('500 to 750 sq ft garage, cleaning and organization only, no junk or clutter removal needed');
  expect(evidence.unresolvedQuestions.some(q => /junk\/clutter/.test(q))).toBe(false);
});

test('asks the junk/clutter clarifying question when garage scope is ambiguous', () => {
  const evidence = interpretLiveDiscoveryText('customer has a garage they want cleaned and organized');
  expect(evidence.unresolvedQuestions.some(q => /junk\/clutter/.test(q))).toBe(true);
});
