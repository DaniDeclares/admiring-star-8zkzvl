import { createClient } from '@supabase/supabase-js';

const PROD_URL = Netlify.env.get('SUPABASE_URL');
const TEST_URL = 'https://okvepooyxurujcwgfoju.supabase.co';
const clean = (v) => typeof v === 'string' ? v.trim() : '';

function client(url, key) {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export default async (req, context) => {
  const deployContext = context?.deploy?.context || 'unknown';
  const published = context?.deploy?.published === true;
  if (deployContext !== 'production' || !published) {
    return Response.json({
      success:false, mode:'PREFLIGHT', ready:false,
      error:'Privileged bridge execution is restricted to a published production deploy.',
      deployContext, published, transported:0
    }, { status:403 });
  }

  if (req.method !== 'POST') return Response.json({ success:false, error:'Method not allowed' }, { status:405 });

  const expected = clean(Netlify.env.get('CRON_SECRET'));
  const supplied = clean(req.headers.get('authorization')).replace(/^Bearer\s+/i, '');
  if (!expected || supplied !== expected) return Response.json({ success:false, error:'Unauthorized' }, { status:401 });

  const productionKey = clean(Netlify.env.get('PRODUCTION_SUPABASE_SECRET_KEY'));
  const testerKey = clean(Netlify.env.get('TESTER_SUPABASE_SECRET_KEY'));
  if (!productionKey || !testerKey) {
    return Response.json({
      success:false, mode:'PREFLIGHT', ready:false,
      missing:[
        ...(!productionKey ? ['PRODUCTION_SUPABASE_SECRET_KEY'] : []),
        ...(!testerKey ? ['TESTER_SUPABASE_SECRET_KEY'] : []),
      ],
      transported:0,
    }, { status:503 });
  }

  try {
    const production = client(PROD_URL, productionKey);
    const tester = client(TEST_URL, testerKey);
    const [prodProbe,testProbe] = await Promise.all([
      production.from('dd_environment_bridge_receipts').select('id',{count:'exact',head:true}).limit(1),
      tester.from('dd_environment_bridge_receipts').select('id',{count:'exact',head:true}).limit(1),
    ]);
    if (prodProbe.error) throw prodProbe.error;
    if (testProbe.error) throw testProbe.error;

    return Response.json({
      success:true, mode:'PREFLIGHT', ready:true,
      productionProjectRef:'ajxezpczaemunlcmqlgl',
      testerProjectRef:'okvepooyxurujcwgfoju',
      productionReceiptCount:prodProbe.count,
      testerReceiptCount:testProbe.count,
      transported:0,
      productionRuntimeMutation:false,
      testerAuthorityOverProduction:false,
    });
  } catch (error) {
    return Response.json({ success:false, mode:'PREFLIGHT', ready:false, error:error?.message || 'Bridge preflight failed', transported:0 }, { status:500 });
  }
};

export const config = {
  path: '/api/environment-bridge-preflight',
};
