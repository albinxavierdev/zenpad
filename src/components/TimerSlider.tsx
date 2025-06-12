import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Clock, ChevronUp, ChevronDown, Play } from "lucide-react";
import { StorageService } from '@/services/StorageService';
import { Card, CardContent } from "@/components/ui/card";

interface TimerSliderProps {
  value: number;
  onChange: (minutes: number) => void;
}

export const TimerSlider: React.FC<TimerSliderProps> = ({ value, onChange }) => {
  const handleSliderChange = (val: number[]) => {
    onChange(val[0]);
  };

  const handleWheelChange = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newValue = Math.max(1, Math.min(60, value + delta));
    onChange(newValue);
  };

  const incrementMinutes = () => {
    onChange(Math.min(60, value + 1));
  };

  const decrementMinutes = () => {
    onChange(Math.max(1, value - 1));
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
                {value}
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
            value={[value]}
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
      </CardContent>
    </Card>
  );
};
