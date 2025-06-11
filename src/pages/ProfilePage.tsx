import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Mail, Calendar, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  if (!user) {
    return null; // This should never happen due to ProtectedRoute
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="h-full grid-background overflow-auto">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/app')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              profile
            </h1>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                account information
              </CardTitle>
              <CardDescription>
                your personal account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  joined {format(new Date(user.created_at), 'MMMM d, yyyy')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                account settings
              </CardTitle>
              <CardDescription>
                manage your account preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full sm:w-auto"
              >
                sign out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 