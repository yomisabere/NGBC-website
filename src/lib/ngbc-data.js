import { supabase } from './supabase.js';

export async function getLatestDevotional() {
  const { data, error } = await supabase
    .from('devotionals')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getLatestSundaySchoolLesson() {
  const { data, error } = await supabase
    .from('sunday_school_lessons')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAnnouncements(limit = 6) {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('pinned', { ascending: false })
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getLivestreamState() {
  const { data, error } = await supabase
    .from('livestream_state')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitPrayerRequest({ name, request, is_private = true }) {
  const { data, error } = await supabase
    .from('prayer_requests')
    .insert({ name: name || null, request, is_private })
    .select()
    .single();
  if (error) throw error;
  return data;
}
