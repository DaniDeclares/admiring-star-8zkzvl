import { categoriesMissingServices, explicitServiceEntries, filterServices, toggleServiceInSelection } from './providerCapabilitySelection';

const categories = [
  { category_key: 'cleaning', label: 'Cleaning' },
  { category_key: 'courier', label: 'Courier' },
];
const catalog = {
  cleaning: Array.from({ length: 120 }, (_, i) => ({ id: `c${i}`, name: `Clean service ${i}`, sku: `DNI-01A-${i}` })),
  courier: [{ id: 'k1', name: 'Same-day courier', sku: 'DNI-12A-001' }, { id: 'k2', name: 'Document delivery', sku: 'DNI-12A-002' }],
};
const servicesFor = category => catalog[category.category_key];

describe('provider capability selection', () => {
  test('ticking a category alone claims nothing (the 173-service bug)', () => {
    const selected = { cleaning: { checked: true }, courier: { checked: true } };
    expect(explicitServiceEntries(categories, selected, servicesFor)).toEqual([]);
    expect(categoriesMissingServices(categories, selected, servicesFor).map(c => c.label)).toEqual(['Cleaning', 'Courier']);
  });

  test('only explicitly ticked services are claimed', () => {
    let cleaning = { checked: true };
    cleaning = toggleServiceInSelection(cleaning, 'c3');
    cleaning = toggleServiceInSelection(cleaning, 'c7');
    cleaning = toggleServiceInSelection(cleaning, 'c3');
    const selected = { cleaning, courier: { checked: true, serviceIds: ['k2'] } };
    expect(explicitServiceEntries(categories, selected, servicesFor).map(e => e.service.id)).toEqual(['c7', 'k2']);
    expect(categoriesMissingServices(categories, selected, servicesFor)).toEqual([]);
  });

  test('unticking a category drops its services even if some were chosen', () => {
    const selected = { cleaning: { checked: false, serviceIds: ['c1', 'c2'] }, courier: { checked: true, serviceIds: ['k1'] } };
    expect(explicitServiceEntries(categories, selected, servicesFor).map(e => e.service.id)).toEqual(['k1']);
  });

  test('ids that are not in the category do not count as a selection', () => {
    const selected = { courier: { checked: true, serviceIds: ['c1'] } };
    expect(categoriesMissingServices(categories, selected, servicesFor).map(c => c.label)).toEqual(['Courier']);
    expect(explicitServiceEntries(categories, selected, servicesFor)).toEqual([]);
  });

  test('search narrows long lists by name or SKU', () => {
    expect(filterServices(catalog.courier, 'document').map(s => s.id)).toEqual(['k2']);
    expect(filterServices(catalog.courier, 'dni-12a-001').map(s => s.id)).toEqual(['k1']);
    expect(filterServices(catalog.courier, '  ').length).toBe(2);
  });
});
