
import React, { useState } from 'react';
import { SetupScreen } from '@/screens/SetupScreen';
import { WritingScreen } from '@/screens/WritingScreen';
import { ReviewScreen } from '@/screens/ReviewScreen';
import { 
  StorageService, 
  WritingSession 
} from '@/services/StorageService';

// App states
type AppState = 'setup' | 'writing' | 'review' | 'history';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [duration, setDuration] = useState(5);
  const [currentSession, setCurrentSession] = useState<WritingSession | null>(null);
  
  const handleStartWriting = (minutes: number) => {
    setDuration(minutes);
    setAppState('writing');
  };
  
  const handleCompleteWriting = (text: string) => {
    const newSession: Omit<WritingSession, 'id'> = {
      timestamp: Date.now(),
      duration,
      text
    };
    
    const sessionId = StorageService.saveSession(newSession);
    const session = StorageService.getSession(sessionId);
    
    if (session) {
      setCurrentSession(session);
      setAppState('review');
    }
  };
  
  const handleExitWriting = () => {
    setAppState('setup');
  };
  
  const handleBackToSetup = () => {
    setAppState('setup');
    setCurrentSession(null);
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      {appState === 'setup' && (
        <SetupScreen onStart={handleStartWriting} />
      )}
      
      {appState === 'writing' && (
        <WritingScreen 
          duration={duration}
          onComplete={handleCompleteWriting}
          onExit={handleExitWriting}
        />
      )}
      
      {appState === 'review' && currentSession && (
        <ReviewScreen
          session={currentSession}
          onBack={handleBackToSetup}
          onDelete={handleBackToSetup}
        />
      )}
    </div>
  );
};

export default Index;
