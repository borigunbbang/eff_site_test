import { supabase } from '../lib/supabase.js';

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('slug, label, description')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCategory(slug) {
  const { data, error } = await supabase
    .from('categories')
    .select('slug, label, description')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}
