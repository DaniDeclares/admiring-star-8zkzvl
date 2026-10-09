// Shared read-only pagination and credential preflight for Shopify recovery.
export async function shopifyGraphQL({domain,token,query,variables={},fetcher=fetch}) {
  if (!/^[a-z0-9-]+\.myshopify\.com$/.test(domain||'') || !token) throw Error('SHOPIFY_CREDENTIALS_MISSING');
  const response=await fetcher('https://'+domain+'/admin/api/2025-10/graphql.json',{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Access-Token':token},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(20000)});
  if(!response.ok) throw Error('SHOPIFY_HTTP_'+response.status);
  const result=await response.json();
  if(result.errors?.length || !result.data) throw Error('SHOPIFY_GRAPHQL_ERROR');
  return result.data;
}
export async function readAllShopifyProducts(credentials,request=shopifyGraphQL) {
  const products=[];let cursor=null;const seen=new Set();
  do {
    const data=await request({...credentials,query:`query($cursor:String){products(first:100,after:$cursor){nodes{id title handle status variants(first:100){nodes{sku} pageInfo{hasNextPage endCursor}}}pageInfo{hasNextPage endCursor}}}`,variables:{cursor}});
    const page=data.products;
    if(!page || !Array.isArray(page.nodes) || !page.pageInfo) throw Error('SHOPIFY_PAGE_INVALID');
    for(const product of page.nodes) {
      if(seen.has(product.id)) throw Error('SHOPIFY_DUPLICATE_ID');
      seen.add(product.id);
      if(!product.variants?.pageInfo || !Array.isArray(product.variants.nodes)) throw Error('SHOPIFY_VARIANTS_INVALID');
      const variants=[...product.variants.nodes];let vc=product.variants.pageInfo.endCursor;
      while(product.variants.pageInfo.hasNextPage && variants.length>=100 && vc) {
        // Nested variant pages are fetched separately; no silent truncation.
        const vd=await request({...credentials,query:`query($id:ID!,$cursor:String){product(id:$id){variants(first:100,after:$cursor){nodes{sku}pageInfo{hasNextPage endCursor}}}}`,variables:{id:product.id,cursor:vc}});
        const vp=vd.product?.variants;
        if(!vp || !Array.isArray(vp.nodes)) throw Error('SHOPIFY_VARIANT_PAGE_INVALID');
        variants.push(...vp.nodes);
        if(!vp.pageInfo?.hasNextPage) break;
        if(!vp.pageInfo.endCursor || vp.pageInfo.endCursor===vc) throw Error('SHOPIFY_VARIANT_CURSOR_STALLED');
        vc=vp.pageInfo.endCursor;
      }
      if(product.variants.pageInfo.hasNextPage && variants.length<101) throw Error('SHOPIFY_VARIANTS_INCOMPLETE');
      products.push({...product,variants});
    }
    if(!page.pageInfo.hasNextPage) break;
    if(!page.pageInfo.endCursor || page.pageInfo.endCursor===cursor) throw Error('SHOPIFY_PRODUCT_CURSOR_STALLED');
    cursor=page.pageInfo.endCursor;
  }while(true);
  return products;
}
export async function readAllGovernedCandidates({url,key,fetcher=fetch}) {
  if(!url || !key) throw Error('GOVERNED_CREDENTIALS_MISSING');
  const base=new URL(url);
  if(base.protocol!=='https:') throw Error('GOVERNED_HTTPS_REQUIRED');
  const results=[];const limit=250;
  for(let offset=0;offset<100000;offset+=limit){
    const endpoint=new URL('/rest/v1/dd_merch_product_candidates',base);
    endpoint.searchParams.set('select','candidate_key,canonical_sku,title,verification_state,approval_state,approved_by,approved_at,publication_state,economics_snapshot,asset_refs,provenance');
    endpoint.searchParams.set('order','candidate_key.asc');
    endpoint.searchParams.set('limit',String(limit));
    endpoint.searchParams.set('offset',String(offset));
    const response=await fetcher(endpoint,{headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(20000)});
    if(!response.ok) throw Error('GOVERNED_HTTP_'+response.status);
    const page=await response.json();
    if(!Array.isArray(page)) throw Error('GOVERNED_PAGE_INVALID');
    results.push(...page);
    if(page.length<limit) return results;
  }
  throw Error('GOVERNED_SCAN_LIMIT_EXCEEDED');
}
export function approvedCandidate(row){
  return row?.verification_state==='VERIFIED' && row.approval_state==='APPROVED' &&
    Boolean(row.approved_by && row.approved_at && row.canonical_sku) &&
    ['READY','QUEUED','PUBLISHED'].includes(row.publication_state);
}
