import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { AuthService, AuthError } from '@/services/AuthService';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    AuthService.getCurrentUser().then(({ user, error }) => {
      if (error) {
        console.error('Error getting current user:', error);
      }
      setUser(user);
      setIsLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthError = (error: AuthError) => {
    toast({
      variant: 'destructive',
      title: 'Authentication Error',
      description: error.message
    });
  };

  const signIn = async (email: string, password: string) => {
    const { user, error } = await AuthService.signIn(email, password);
    if (error) {
      handleAuthError(error);
      throw error;
    }
    setUser(user);
  };

  const signUp = async (email: string, password: string) => {
    const { user, error } = await AuthService.signUp(email, password);
    if (error) {
      handleAuthError(error);
      throw error;
    }
    setUser(user);
  };

  const signOut = async () => {
    const { error } = await AuthService.signOut();
    if (error) {
      handleAuthError(error);
      throw error;
    }
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await AuthService.resetPassword(email);
    if (error) {
      handleAuthError(error);
      throw error;
    }
    toast({
      title: 'Password Reset Email Sent',
      description: 'Check your email for instructions to reset your password.'
    });
  };

  const updatePassword = async (password: string) => {
    const { error } = await AuthService.updatePassword(password);
    if (error) {
      handleAuthError(error);
      throw error;
    }
    toast({
      title: 'Password Updated',
      description: 'Your password has been successfully updated.'
    });
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 