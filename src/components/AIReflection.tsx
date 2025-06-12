import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  BrainCircuit, 
  ArrowLeft,
  Check,
  AlertCircle,
  TrendingUp,
  Target,
  Lightbulb,
  BarChart3
} from "lucide-react";
import { AIService, WritingAnalysis } from '@/services/AIService';
import { StorageService, WritingSession } from '@/services/StorageService';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIReflectionProps {
  session: WritingSession;
  onBack: () => void;
  onComplete: (analysis: WritingAnalysis) => void;
  onRefreshRequest?: () => void;
}

export const AIReflection: React.FC<AIReflectionProps> = ({
  session,
  onBack,
  onComplete,
  onRefreshRequest
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleGetReflection = async () => {
    const trimmedText = session.text?.trim();
    
    if (!trimmedText) {
      setError('No text provided for analysis. Please write something first.');
      toast({
        variant: "destructive",
        title: "Empty Content",
        description: "You need to write something before getting an analysis."
      });
      return;
    }
    
    if (trimmedText.length < 50) {
      setError('Text is too short for meaningful analysis. Please write at least 50 characters.');
      toast({
        variant: "destructive",
        title: "Content Too Short",
        description: "Please write at least 50 characters for a meaningful analysis."
      });
      return;
    }
    
    if (!session.duration || session.duration <= 0) {
      setError('Session duration is missing or zero. Please ensure you selected a valid timer.');
      toast({
        variant: "destructive",
        title: "Invalid Timer",
        description: "Session duration is missing or zero. Please ensure you selected a valid timer."
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AIService.getReflection(trimmedText, session.duration);
      
      if (response.error) {
        setError(response.error);
        toast({
          variant: "destructive",
          title: "Error getting AI reflection",
          description: response.error
        });
      } else if (response.analysis) {
        // Save the analysis to storage
        try {
          await StorageService.updateSession(session.id, {
            reflection: JSON.stringify(response.analysis)
          });
          
          // Call completion handler
          onComplete(response.analysis);
          
          toast({
            title: "Analysis Complete",
            description: "Your writing has been analyzed successfully."
          });
        } catch (error) {
          console.error('Error updating session:', error);
          let errorMessage = 'Failed to save analysis. Please try again.';
          if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = (error as any).message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: "Error saving analysis",
            description: errorMessage
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while analyzing your writing."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="h-full grid-background">
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Header section - fixed */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onBack}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  back
                </Button>
                <h1 className="text-xl font-bold tracking-tight hidden md:block text-primary">zenpad</h1>
              </div>
              
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" />
                writing analysis
              </h2>
            </div>
            
            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                get a detailed analysis of your writing session using google's gemini ai. your text will be analyzed for writing skills, strengths, areas for improvement, and suggestions.
              </p>
              
              {error && (
                <div className="flex items-start gap-2 text-destructive text-sm mt-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isLoading}
              >
                cancel
              </Button>
              <Button
                onClick={handleGetReflection}
                disabled={isLoading}
                className="min-w-[120px] bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    analyzing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    analyze writing
                  </>
                )}
              </Button>
            </div>
            
            <Separator className="mt-4" />
          </div>
          
          {/* Scrollable content */}
          <div className="space-y-6 pb-8">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Text Preview (first 300 characters)</h3>
              <div className="zen-card p-4 rounded border border-border shadow-sm max-h-[40vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                  {session.text.slice(0, 300)}
                  {session.text.length > 300 && '...'}
                </pre>
              </div>
            </div>
            
            {onRefreshRequest && (
              <div className="flex justify-end">
                <Button variant="outline" onClick={onRefreshRequest} disabled={isLoading}>
                  New Analysis
                </Button>
              </div>
            )}
          </div>
          
          {/* Debug section: show text and timer being analyzed */}
          <div className="zen-card p-2 mb-4 border border-dashed border-blue-300 bg-blue-50 text-xs text-blue-900">
            <div><strong>Debug:</strong> <span>Analyzing <b>{session.text.length}</b> chars, <b>{session.text.split(/\s+/).filter(Boolean).length}</b> words, <b>{session.duration}</b> min timer</span></div>
            <div><strong>First 100 chars:</strong> <pre className="whitespace-pre-wrap inline">{session.text.slice(0, 100)}</pre></div>
          </div>
        </div>
      </div>
    </div>
  );
};
