
import React from 'react';
import { WritingArea } from '@/components/WritingArea';

interface WritingScreenProps {
  duration: number;
  onComplete: (text: string) => void;
  onExit: () => void;
}

export const WritingScreen: React.FC<WritingScreenProps> = ({ 
  duration, 
  onComplete,
  onExit
}) => {
  return (
    <WritingArea 
      duration={duration}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};
