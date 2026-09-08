import { supabase } from '../lib/supabase.js';

export async function getAllSfx() {
  const { data, error } = await supabase
    .from('sfx')
    .select('id, name, category:category_slug, image')
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getSfxByCategory(categorySlug) {
  const { data, error } = await supabase
    .from('sfx')
    .select('id, name, category:category_slug, image')
    .eq('category_slug', categorySlug)
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
}
