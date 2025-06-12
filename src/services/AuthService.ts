import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
}

export const AuthService = {
  async signUp(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error: any) {
      return {
        user: null,
        error: {
          message: error.message || 'An error occurred during sign up'
        }
      };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error: any) {
      return {
        user: null,
        error: {
          message: error.message || 'An error occurred during sign in'
        }
      };
    }
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'An error occurred during sign out'
        }
      };
    }
  },

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'An error occurred while resetting password'
        }
      };
    }
  },

  async updatePassword(password: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'An error occurred while updating password'
        }
      };
    }
  },

  async getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      return { user, error: null };
    } catch (error: any) {
      return {
        user: null,
        error: {
          message: error.message || 'An error occurred while getting current user'
        }
      };
    }
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  },

  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://zenpad0.vercel.app/app',
      },
    });
    if (error) throw error;
  },
}; 