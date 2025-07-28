import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

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