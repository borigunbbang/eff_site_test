import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY. .env(.local) 파일을 확인하세요.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
