import React, { useState } from 'react';
import { SessionReview } from '@/components/SessionReview';
import { AIReflection } from '@/components/AIReflection';
import { WritingSession, StorageService } from '@/services/StorageService';
import { WritingAnalysis } from '@/services/AIService';
import { useToast } from '@/components/ui/use-toast';

interface ReviewScreenProps {
  session: WritingSession;
  onBack: () => void;
  onDelete: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  session,
  onBack,
  onDelete,
}) => {
  const [currentView, setCurrentView] = useState<'review' | 'ai'>('review');
  const [currentSession, setCurrentSession] = useState<WritingSession>(session);
  const { toast } = useToast();
  
  const handleDelete = async () => {
    try {
      await StorageService.deleteSession(session.id);
      toast({
        title: "Session deleted",
        description: "Your writing session has been deleted."
      });
      onDelete();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete session"
      });
    }
  };
  
  const handleAIAnalyze = () => {
    setCurrentView('ai');
  };
  
  const handleAIComplete = async (analysis: WritingAnalysis) => {
    try {
      // Update the session with the analysis
      await StorageService.updateSession(session.id, {
        reflection: JSON.stringify(analysis)
      });
      
      // Update local state
      setCurrentSession(prev => ({
        ...prev,
        reflection: JSON.stringify(analysis)
      }));
      
      // Show success message
      toast({
        title: "Analysis saved",
        description: "Your writing analysis has been saved successfully."
      });
      
      // Switch back to review view
      setCurrentView('review');
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save writing analysis"
      });
    }
  };
  
  return (
    <div className="h-screen w-full grid-background overflow-y-auto">
      <div className="h-full min-h-screen w-full flex justify-center">
        <div className="w-full">
          {currentView === 'review' ? (
            <SessionReview
              session={currentSession}
              onDelete={handleDelete}
              onBack={onBack}
              onAnalyze={handleAIAnalyze}
              hasReflection={!!currentSession.reflection}
            />
          ) : (
            <AIReflection
              session={session}
              onBack={() => setCurrentView('review')}
              onComplete={handleAIComplete}
              onRefreshRequest={() => {
                setCurrentSession(prev => ({
                  ...prev,
                  reflection: undefined
                }));
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
