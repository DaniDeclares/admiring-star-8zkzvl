/**
 * Read-only scope integrity guard for existing staff Quote Builder.
 * The saved customer scope, not the filtered LIVE_READY catalog, defines the
 * requested components. An explicit scope revision must happen in the owning
 * scope workflow before an incomplete package can be quoted.
 */
export function requiredScopeComponents(scope) {
  if (!scope || !Array.isArray(scope.components)) return [];
  return scope.components.map((item,index) => ({
    sku: typeof item?.sku === 'string' ? item.sku.trim() : '',
    name: typeof item?.name === 'string' ? item.name.trim() : '',
    required: item?.is_required !== false && item?.isRequired !== false,
    index
  }));
}
export function inspectQuoteScope(scopeComponents, lineItems, serviceBySku) {
  const available = new Map();
  for (const item of lineItems || []) {
    const sku = String(item?.serviceSku || '').trim();
    available.set(sku,(available.get(sku)||0)+1);
  }
  const rows = (scopeComponents||[]).map(c => {
    const sku = String(c?.sku||'').trim();
    const service = sku && serviceBySku.get(sku);
    const remaining = available.get(sku)||0;
    if (remaining) available.set(sku,remaining-1);
    const selected = remaining>0;
    const live = !!service && service.releaseState === 'LIVE_READY' &&
      service.governedOfferStatus === 'SELL_NOW' &&
      service.fulfillmentGateStatus === 'READY';
    const reason = !sku ? 'Scope component has no SKU' :
      !selected ? 'Required component absent from quote selection' :
      !service ? 'Not in current authorized quote catalog; verify release hold or SKU' :
      !live ? 'Commercial release/fulfillment not verified for this component' : null;
    return {...c,sku,selected,availableForQuote:live,reason,
      canQuote:selected&&live&&!!sku};
  });
  const unmatched = (lineItems||[]).filter(item => !serviceBySku.has(item.serviceSku));
  const blocking = rows.filter(row => row.required && !row.canQuote);
  return {rows,blocking,unmatched,canCreate:blocking.length===0&&unmatched.length===0,
    requestedCount:rows.length,visibleCount:rows.length};
}
export function assertOriginalScopeRetained(scope, requestedLineItems) {
  const required=requiredScopeComponents(scope).filter(c=>c.required);
  const selected=new Map();
  for (const item of requestedLineItems||[]) {
    const sku=String(item?.serviceSku||'').trim();
    selected.set(sku,(selected.get(sku)||0)+1);
  }
  const missing=[];
  for(const row of required){
    const remaining=selected.get(row.sku)||0;
    if(!row.sku||remaining<1) missing.push(row.sku||'(missing SKU)');
    else selected.set(row.sku,remaining-1);
  }
  if(missing.length) throw new Error('The original requested scope has required components missing from this quote: '+missing.join(', ')+'. Review and explicitly revise the saved scope before creating a reduced quote.');
  return true;
}
