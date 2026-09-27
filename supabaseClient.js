import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'DANI portal configuration error: REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are required at build time.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
