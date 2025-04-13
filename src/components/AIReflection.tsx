
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  BrainCircuit, 
  Key, 
  ArrowLeft, 
  KeyRound,
  Check,
  AlertCircle
} from "lucide-react";
import { AIService } from '@/services/AIService';
import { StorageService } from '@/services/StorageService';
import { useToast } from '@/components/ui/use-toast';

interface AIReflectionProps {
  text: string;
  sessionId: string;
  onBack: () => void;
  onComplete: (reflection: string) => void;
}

export const AIReflection: React.FC<AIReflectionProps> = ({
  text,
  sessionId,
  onBack,
  onComplete
}) => {
  const [apiKey, setApiKey] = useState(StorageService.getSavedAPIKey());
  const [isLoading, setIsLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    StorageService.saveAPIKey(e.target.value);
  };
  
  const handleGetReflection = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an OpenAI API key');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AIService.getReflection(text, apiKey);
      
      if (response.error) {
        setError(response.error);
        toast({
          variant: "destructive",
          title: "Error getting AI reflection",
          description: response.error
        });
      } else if (response.reflection) {
        // Save the reflection to storage
        StorageService.updateSession(sessionId, {
          reflection: response.reflection
        });
        
        // Call completion handler
        onComplete(response.reflection);
        
        toast({
          title: "AI Reflection Generated",
          description: "Your writing has been analyzed successfully."
        });
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while getting AI reflection."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BrainCircuit className="h-5 w-5" />
          AI Reflection
        </h2>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Get an AI-powered reflection on your writing session. Your text will be sent to OpenAI's API 
          for analysis. You'll need to provide your own API key.
        </p>
        
        <div className="bg-card p-6 rounded-lg border border-border space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            OpenAI API Key
          </h3>
          
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Enter your OpenAI API key"
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowKey(!showKey)}
              >
                <Key className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and is never sent to our servers.
            </p>
            {error && (
              <div className="flex items-start gap-2 text-destructive text-sm mt-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleGetReflection}
          disabled={isLoading || !apiKey.trim()}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Generate Reflection
            </>
          )}
        </Button>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Text Preview (first 300 characters)</h3>
        <div className="bg-card p-4 rounded border border-border">
          <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
            {text.slice(0, 300)}
            {text.length > 300 && '...'}
          </pre>
        </div>
      </div>
    </div>
  );
};
