import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TimerSlider } from '@/components/TimerSlider';
import { Button } from '@/components/ui/button';
import { History, Timer, Brain, CircleDot, LogIn, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';

interface SetupScreenProps {
  onStart: (duration: number) => void;
  onViewHistory: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, onViewHistory }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="h-screen w-full grid-background flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="w-full border-b border-border p-4 md:p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CircleDot className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">zenpad</h1>
        </div>
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/signin')}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden md:inline">Sign in</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/signup')}
              >
                Sign up
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate('/app/profile')}
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Profile</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                onClick={onViewHistory}
              >
                <History className="h-4 w-4" />
                <span className="hidden md:inline">view history</span>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row gap-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">distraction-free writing</h2>
            <p className="text-lg text-muted-foreground">
              {user 
                ? "Ready to start a new writing session?"
                : "Sign up to save your writing sessions and get AI-powered insights."}
            </p>
            
            <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-primary" />
                    timed sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    challenge yourself to write continuously without stopping.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    ai reflection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {user
                      ? "get insights about your writing after your session."
                      : "sign up to unlock AI-powered writing insights."}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="md:w-80 flex flex-col justify-center">
          <div className="sticky top-10 space-y-4">
            <h3 className="text-xl font-bold text-center mb-6">
              {user ? "start writing" : "try it out"}
            </h3>
            <TimerSlider onStart={onStart} />
            {!user && (
              <p className="text-sm text-center text-muted-foreground mt-4">
                Sign up to save your sessions and get AI insights
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground">
        <p>zenpad — distraction-free writing</p>
      </footer>
    </div>
  );
};
