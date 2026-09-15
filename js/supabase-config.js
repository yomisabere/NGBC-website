// Shared Supabase connection for New Glory Baptist Church website.
const SUPABASE_URL = 'https://qljcllxruouuqclgxbxj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-3N7xN1HaIv1cDREKnKmeg_82l9UQxI';

function getSupabaseClient() {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase JS library not loaded.');
    return null;
  }
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
