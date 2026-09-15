// Shared NGBC Supabase client
// Uses the same project as the NGBC app. Never place a service_role/secret key here.
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://qljcllxruouuqclgxbxj.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_-3N7xN1HaIv1cDREKnKmeg_82l9UQxI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
