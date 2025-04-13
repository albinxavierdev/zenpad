
import React, { useState } from 'react';
import { SessionReview } from '@/components/SessionReview';
import { AIReflection } from '@/components/AIReflection';
import { WritingSession, StorageService } from '@/services/StorageService';
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
  
  const handleDelete = () => {
    StorageService.deleteSession(session.id);
    toast({
      title: "Session deleted",
      description: "Your writing session has been deleted."
    });
    onDelete();
  };
  
  const handleAIAnalyze = () => {
    setCurrentView('ai');
  };
  
  const handleAIComplete = (reflection: string) => {
    setCurrentSession({
      ...currentSession,
      reflection
    });
    setCurrentView('review');
  };
  
  return (
    <div className="min-h-screen bg-background">
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
          text={session.text}
          sessionId={session.id}
          onBack={() => setCurrentView('review')}
          onComplete={handleAIComplete}
        />
      )}
    </div>
  );
};
