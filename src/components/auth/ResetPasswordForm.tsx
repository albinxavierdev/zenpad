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

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      await resetPassword(data.email);
      setIsSuccess(true);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We've sent you instructions to reset your password.
            Please check your email and follow the link to continue.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link to="/signin">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you instructions to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
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

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        Remember your password?{' '}
        <Link to="/signin" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
} 