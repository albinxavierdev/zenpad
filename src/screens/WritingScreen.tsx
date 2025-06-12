import React, { useState, useEffect } from 'react';
import { WritingArea } from '@/components/WritingArea';
import { StorageService, WritingSession } from '@/services/StorageService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface WritingScreenProps {
  duration: number;
  onComplete: (session: WritingSession) => void;
  onExit: () => void;
}

export const WritingScreen: React.FC<WritingScreenProps> = ({ 
  duration, 
  onComplete,
  onExit
}) => {
  const [session, setSession] = useState<WritingSession | null>(null);
  const { toast } = useToast();

  // Create a new session when the component mounts
  useEffect(() => {
    const createNewSession = async () => {
      try {
        const newSession = await StorageService.createSession(duration);
        setSession(newSession);
      } catch (error) {
        console.error('Error creating session:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create writing session"
        });
        onExit();
      }
    };
    
    createNewSession();
  }, [duration, onExit, toast]);

  const handleComplete = async (text: string) => {
    if (!session) return;
    
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;
    
    while (retryCount < maxRetries) {
      try {
        // Update the session with the written text
        await StorageService.updateSession(session.id, { text });
        
        // Get the updated session
        const updatedSession = await StorageService.getSession(session.id);
        if (!updatedSession) {
          throw new Error('Session not found after update');
        }
        
        // Verify the content was saved correctly
        if (updatedSession.text !== text) {
          throw new Error('Session content mismatch after update');
        }
        
        // Pass the complete session to the parent
        onComplete(updatedSession);
        return; // Success, exit the function
      } catch (error) {
        lastError = error as Error;
        console.error(`Error completing session (attempt ${retryCount + 1}/${maxRetries}):`, error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
    }
    
    // If we get here, all retries failed
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to save writing session after ${maxRetries} attempts. ${lastError?.message || 'Please try again.'}`
    });
    onExit();
  };

  if (!session) {
    return null; // or a loading state
  }

  return (
    <div className="h-screen w-full grid-background overflow-y-auto">
      <WritingArea 
        duration={duration}
        onComplete={handleComplete}
        onExit={onExit}
      />
    </div>
  );
};
