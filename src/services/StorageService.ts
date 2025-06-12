import { supabase, Tables } from '@/lib/supabase';
import { AuthService } from './AuthService';

export interface WritingSession {
  id: string;
  user_id: string;
  timestamp: number;
  duration: number; // in minutes
  text: string;
  reflection?: string;
  created_at: string;
  updated_at: string;
}

export const StorageService = {
  // Session management
  async createSession(duration: number): Promise<WritingSession> {
    const { user, error: authError } = await AuthService.getCurrentUser();
    if (authError || !user) throw new Error('User not authenticated');

    const session: Omit<WritingSession, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user.id,
      timestamp: Date.now(),
      duration,
      text: '',
      reflection: null
    };

    const { data, error } = await supabase
      .from('sessions')
      .insert(session)
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }
    return data;
  },
  
  async getSession(id: string): Promise<WritingSession | undefined> {
    const { user, error: authError } = await AuthService.getCurrentUser();
    if (authError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error getting session:', error);
      throw error;
    }

    return data;
  },
  
  async getAllSessions(): Promise<WritingSession[]> {
    const { user, error: authError } = await AuthService.getCurrentUser();
    if (authError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error getting all sessions:', error);
      throw error;
    }
    return data || [];
  },
  
  async updateSession(id: string, updates: Partial<Omit<WritingSession, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const { user, error: authError } = await AuthService.getCurrentUser();
    if (authError || !user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },
  
  async deleteSession(id: string): Promise<void> {
    const { user, error: authError } = await AuthService.getCurrentUser();
    if (authError || !user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },
  
  // Session duration preferences
  async getSavedDuration(): Promise<number> {
    const { user, error: authError } = await AuthService.getCurrentUser();
    if (authError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_settings')
      .select('session_duration')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return 5; // Default to 5 minutes if no setting found
      console.error('Error getting saved duration:', error);
      throw error;
    }

    return data?.session_duration || 5;
  },

  async saveDuration(minutes: number): Promise<void> {
    const { user, error: authError } = await AuthService.getCurrentUser();
    if (authError || !user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        session_duration: minutes,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving duration:', error);
      throw error;
    }
  },
  
  // Initialize storage service
  async initialize(): Promise<void> {
    // No initialization needed for Supabase
    return;
  }
};
