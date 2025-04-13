
import React, { useEffect, useRef, useState } from 'react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Clock } from "lucide-react";
import { useTimer } from '@/services/TimerService';

interface WritingAreaProps {
  duration: number;
  onComplete: (text: string) => void;
  onExit: () => void;
}

export const WritingArea: React.FC<WritingAreaProps> = ({
  duration,
  onComplete,
  onExit
}) => {
  const [text, setText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseIdle, setMouseIdle] = useState(false);
  const mouseTimerRef = useRef<number | null>(null);
  
  const handleTimerComplete = () => {
    onComplete(text);
  };
  
  const {
    formattedTime,
    percentRemaining,
    isRunning,
    start,
    stop
  } = useTimer(duration, handleTimerComplete);

  // Start timer on component mount
  useEffect(() => {
    start();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    // Set up fullscreen change listener
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      stop();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [start, stop]);
  
  // Handle keydown to prevent backspace/delete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent backspace and delete keys
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
    }
    
    // Allow keyboard shortcuts for copy (Ctrl+C)
    if (e.ctrlKey && e.key === 'c') {
      return;
    }
    
    // Prevent cut (Ctrl+X)
    if (e.ctrlKey && e.key === 'x') {
      e.preventDefault();
    }
    
    // Show controls on Escape
    if (e.key === 'Escape') {
      setShowControls(true);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  };
  
  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  // Handle mouse movement to show/hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      setMouseIdle(false);
      
      if (mouseTimerRef.current) {
        window.clearTimeout(mouseTimerRef.current);
      }
      
      mouseTimerRef.current = window.setTimeout(() => {
        if (isRunning) {
          setShowControls(false);
          setMouseIdle(true);
        }
      }, 3000);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (mouseTimerRef.current) {
        window.clearTimeout(mouseTimerRef.current);
      }
    };
  }, [isRunning]);
  
  // Handle exit
  const handleExit = () => {
    if (isFullscreen && document.exitFullscreen) {
      document.exitFullscreen();
    }
    stop();
    onExit();
  };
  
  return (
    <div 
      ref={containerRef}
      className={`relative min-h-screen flex flex-col ${isFullscreen ? 'fullscreen' : ''}`}
    >
      {/* Header controls - visible when controls are shown */}
      <div 
        className={`transition-opacity duration-300 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-background to-transparent p-4 flex justify-between items-center ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExit}>
            Exit
          </Button>
          <div className="flex items-center space-x-2 pl-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-lg">{formattedTime}</span>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <Progress value={percentRemaining} className="h-1 rounded-none bg-background" />
      </div>
      
      {/* Main text area */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        className={`writing-area ${mouseIdle ? 'cursor-none' : ''}`}
        placeholder="Start writing... (you cannot delete or use backspace)"
        autoFocus
        spellCheck={false}
      />
    </div>
  );
};
