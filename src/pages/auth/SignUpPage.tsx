import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { useAuth } from '@/contexts/AuthContext';

export function SignUpPage() {
  const { user, isLoading } = useAuth();

  // If user is already signed in, redirect to home
  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
} 