import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignInForm } from '@/components/auth/SignInForm';
import { useAuth } from '@/contexts/AuthContext';

export function SignInPage() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const message = location.state?.message;

  // If user is already signed in, redirect to dashboard
  if (!isLoading && user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <AuthLayout>
      {message && (
        <div className="mb-6 p-4 rounded-lg bg-muted text-sm">
          {message}
        </div>
      )}
      <SignInForm />
    </AuthLayout>
  );
} 