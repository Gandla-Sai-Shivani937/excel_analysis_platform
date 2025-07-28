import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon-key')) {
  console.warn('Supabase credentials not configured. Please set up your Supabase project credentials in the .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadFile = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('excel-files')
    .upload(fileName, file);
    
  if (error) throw error;
  return data;
};

export const downloadFile = async (path: string) => {
  const { data, error } = await supabase.storage
    .from('excel-files')
    .download(path);
    
  if (error) throw error;
  return data;
};