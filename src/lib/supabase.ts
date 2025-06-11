import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Tables = {
  sessions: {
    id: string;
    user_id: string;
    timestamp: number;
    duration: number;
    text: string;
    reflection?: string;
    created_at: string;
    updated_at: string;
  };
  user_settings: {
    id: string;
    user_id: string;
    gemini_api_key: string;
    created_at: string;
    updated_at: string;
  };
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to get user settings
export const getUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Helper function to update user settings
export const updateUserSettings = async (userId: string, settings: Partial<Tables['user_settings']>) => {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}; 