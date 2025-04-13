
import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { StorageService } from '@/services/StorageService';

interface TimerSliderProps {
  onStart: (minutes: number) => void;
}

export const TimerSlider: React.FC<TimerSliderProps> = ({ onStart }) => {
  const [minutes, setMinutes] = useState<number>(() => StorageService.getSavedDuration());
  
  useEffect(() => {
    StorageService.saveDuration(minutes);
  }, [minutes]);
  
  const handleSliderChange = (value: number[]) => {
    setMinutes(value[0]);
  };
  
  const handleStartClick = () => {
    onStart(minutes);
  };
  
  const handleWheelChange = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newValue = Math.max(1, Math.min(60, minutes + delta));
    setMinutes(newValue);
  };
  
  return (
    <div className="w-full max-w-md mx-auto space-y-8 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Set Your Timer</h2>
        <p className="text-muted-foreground">How long do you want to write?</p>
      </div>
      
      <div 
        className="p-8 space-y-6" 
        onWheel={handleWheelChange}
      >
        <div className="flex justify-center items-center space-x-4">
          <Clock className="w-6 h-6 text-primary" />
          <span className="text-5xl font-mono font-bold tabular-nums">
            {minutes} <span className="text-2xl text-muted-foreground">min</span>
          </span>
        </div>
        
        <Slider
          value={[minutes]}
          min={1}
          max={60}
          step={1}
          onValueChange={handleSliderChange}
          className="w-full"
        />
        
        <p className="text-xs text-center text-muted-foreground">
          Scroll to adjust or drag the slider
        </p>
      </div>
      
      <Button 
        className="w-full py-6 text-lg font-medium"
        onClick={handleStartClick}
      >
        Start Writing
      </Button>
    </div>
  );
};
