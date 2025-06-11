import React, { useEffect, useRef, useState } from 'react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Clock, Type } from "lucide-react";
import { useTimer } from '@/services/TimerService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WritingAreaProps {
  duration: number;
  onComplete: (text: string) => void;
  onExit: () => void;
}

// Font options
const FONTS = {
  sans: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
  serif: '"Georgia", "Times New Roman", serif',
  mono: '"Fira Code", "SF Mono", "Menlo", monospace',
  cursive: '"Caveat", "Brush Script MT", cursive',
  heading: '"Playfair Display", "Palatino", serif'
};

// Add font size options
const FONT_SIZES = [18, 20, 24, 28, 32];

export const WritingArea: React.FC<WritingAreaProps> = ({
  duration,
  onComplete,
  onExit
}) => {
  const [text, setText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedFont, setSelectedFont] = useState<keyof typeof FONTS>(() => {
    // Load saved font preference from localStorage
    const savedFont = localStorage.getItem('zenpad-font-preference');
    return (savedFont as keyof typeof FONTS) || 'sans';
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('zenpad-font-size');
    return saved ? parseInt(saved, 10) : 24;
  });
  const [prepTime, setPrepTime] = useState(5);
  const [prepActive, setPrepActive] = useState(true);
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

  // Auto fullscreen on mount
  useEffect(() => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
    // Start timer on component mount
    start();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    // Set up fullscreen change listener
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      
      // Force light mode in fullscreen
      if (document.fullscreenElement) {
        document.documentElement.classList.add('light-mode-fullscreen');
      } else {
        document.documentElement.classList.remove('light-mode-fullscreen');
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Prep timer
    setPrepTime(5);
    setPrepActive(true);
    const prepInterval = setInterval(() => {
      setPrepTime((prev) => {
        if (prev <= 1) {
          clearInterval(prepInterval);
          setPrepActive(false);
          start();
          if (textareaRef.current) textareaRef.current.focus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      stop();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.documentElement.classList.remove('light-mode-fullscreen');
      clearInterval(prepInterval);
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

  // Handle font change
  const handleFontChange = (font: string) => {
    const newFont = font as keyof typeof FONTS;
    setSelectedFont(newFont);
    localStorage.setItem('zenpad-font-preference', newFont);
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
  
  // Handle font size change
  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    localStorage.setItem('zenpad-font-size', String(size));
  };

  return (
    <div 
      ref={containerRef}
      className={`relative min-h-screen w-full flex flex-col ${isFullscreen ? 'fullscreen' : ''}`}
    >
      {/* Progress bar - keep at top */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <Progress 
          value={percentRemaining} 
          className={`h-3 rounded-full shadow-lg border border-primary/40 bg-secondary`} 
        />
      </div>
      
      {/* Prep timer overlay */}
      {prepActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="text-6xl font-bold text-primary animate-pulse">
            {prepTime > 0 ? prepTime : 'Go!'}
          </div>
        </div>
      )}
      
      {/* Main text area */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        className={`writing-area flex-grow ${mouseIdle ? 'cursor-none' : ''}`}
        placeholder="start writing... (you cannot delete or use backspace)"
        autoFocus
        spellCheck={false}
        style={{ 
          paddingLeft: '45px',
          fontFamily: FONTS[selectedFont],
          fontSize: fontSize
        }}
        disabled={prepActive}
      />

      {/* Footer controls - visible when controls are shown */}
      <div 
        className={`transition-opacity duration-300 absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-background to-transparent p-4 flex justify-between items-center ${
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
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 mr-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedFont} onValueChange={handleFontChange}>
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  value="sans"
                  className="font-sans"
                >
                  Sans
                </SelectItem>
                <SelectItem 
                  value="serif"
                  className="font-serif"
                  style={{ fontFamily: FONTS.serif }}
                >
                  Serif
                </SelectItem>
                <SelectItem 
                  value="mono"
                  className="font-mono"
                >
                  Mono
                </SelectItem>
                <SelectItem 
                  value="cursive"
                  className="font-handwritten" 
                  style={{ fontFamily: FONTS.cursive }}
                >
                  Cursive
                </SelectItem>
                <SelectItem 
                  value="heading"
                  style={{ fontFamily: FONTS.heading }}
                >
                  Heading
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-xs text-muted-foreground">A</span>
            <select
              value={fontSize}
              onChange={e => handleFontSizeChange(Number(e.target.value))}
              className="border rounded px-1 py-0.5 text-xs bg-background"
              style={{ minWidth: 40 }}
            >
              {FONT_SIZES.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
            <span className="text-lg text-muted-foreground">A</span>
          </div>
          
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
