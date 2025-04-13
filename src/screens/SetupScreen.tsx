
import React from 'react';
import { TimerSlider } from '@/components/TimerSlider';

interface SetupScreenProps {
  onStart: (minutes: number) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">FreeWrite</h1>
        <p className="text-muted-foreground">
          Set a timer and write freely without the ability to delete or backspace.
          Get your thoughts flowing without judgment or editing.
        </p>
      </div>
      
      <TimerSlider onStart={onStart} />
    </div>
  );
};
