import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthService } from '@/services/AuthService';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type SignInFormData = z.infer<typeof signInSchema>;

export function SignInForm() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema)
  });

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await AuthService.signInWithGoogle();
    } catch (err) {
      // Optionally show error to user
      console.error('Google sign-in error:', err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      await signIn(data.email, data.password);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      {/* Google Sign-In Button */}
      <Button
        type="button"
        className="w-full flex items-center justify-center gap-2 bg-white border text-black hover:bg-gray-100 mb-4"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
      >
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" style={{ width: 20, height: 20 }} />
        {isGoogleLoading ? 'Signing in with Google...' : 'Sign in with Google'}
      </Button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">password</Label>
            <Link
              to="/reset-password"
              className="text-sm text-primary hover:underline"
            >
              forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            {...register('password')}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              signing in...
            </>
          ) : (
            'sign in'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        don't have an account?{' '}
        <Link to="/signup" className="text-primary hover:underline">
          sign up
        </Link>
      </div>
    </div>
  );
} 