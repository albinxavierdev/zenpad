import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Clock, ChevronUp, ChevronDown, Play } from "lucide-react";
import { StorageService } from '@/services/StorageService';
import { Card, CardContent } from "@/components/ui/card";

interface TimerSliderProps {
  onStart: (minutes: number) => void;
}

export const TimerSlider: React.FC<TimerSliderProps> = ({ onStart }) => {
  // Default to 5 minutes initially, then load from storage
  const [minutes, setMinutes] = useState<number>(5);
  
  // Load saved duration on component mount
  useEffect(() => {
    const loadSavedDuration = async () => {
      try {
        const savedDuration = await StorageService.getSavedDuration();
        setMinutes(savedDuration);
      } catch (error) {
        console.error('Error loading saved duration:', error);
        // Keep default value if there's an error
      }
    };
    
    loadSavedDuration();
  }, []);
  
  // Save duration when it changes
  useEffect(() => {
    const saveDuration = async () => {
      try {
        await StorageService.saveDuration(minutes);
      } catch (error) {
        console.error('Error saving duration:', error);
      }
    };
    
    saveDuration();
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
  
  const incrementMinutes = () => {
    setMinutes(prev => Math.min(60, prev + 1));
  };
  
  const decrementMinutes = () => {
    setMinutes(prev => Math.max(1, prev - 1));
  };
  
  return (
    <Card className="overflow-hidden shadow-md">
      <CardContent className="p-0">
        <div className="text-center space-y-2 pt-6 px-6">
          <div className="flex justify-center items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-lg font-medium">session duration</span>
          </div>
        </div>
        
        <div 
          className="p-6 space-y-8" 
          onWheel={handleWheelChange}
        >
          <div className="flex justify-center items-center">
            <div className="relative flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute -left-10 opacity-70 hover:opacity-100" 
                onClick={decrementMinutes}
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
              
              <span className="text-6xl font-mono font-bold tabular-nums text-primary w-24 text-center">
                {minutes}
              </span>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute -right-10 opacity-70 hover:opacity-100" 
                onClick={incrementMinutes}
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
            </div>
            
            <span className="text-2xl text-muted-foreground ml-2">min</span>
          </div>
          
          <Slider
            value={[minutes]}
            min={1}
            max={60}
            step={1}
            onValueChange={handleSliderChange}
            className="w-full"
          />
          
          <p className="text-xs text-center text-muted-foreground mt-4">
            use slider, scroll or buttons to adjust time
          </p>
        </div>
        
        <Button 
          className="w-full py-6 text-lg font-medium rounded-t-none bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
          onClick={handleStartClick}
        >
          <Play className="h-5 w-5" />
          start writing
        </Button>
      </CardContent>
    </Card>
  );
};
