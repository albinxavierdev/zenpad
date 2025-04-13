
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Clock, 
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { WritingSession } from '@/services/StorageService';
import { formatDistanceToNow } from 'date-fns';

interface SessionReviewProps {
  session: WritingSession;
  onDelete: () => void;
  onBack: () => void;
  onAnalyze: () => void;
  hasReflection: boolean;
}

export const SessionReview: React.FC<SessionReviewProps> = ({
  session,
  onDelete,
  onBack,
  onAnalyze,
  hasReflection
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(session.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownload = () => {
    const date = new Date(session.timestamp);
    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `freewrite-${formattedDate}-${formattedTime}.txt`;
    
    const element = document.createElement('a');
    const file = new Blob([session.text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const wordCount = session.text.trim().split(/\s+/).filter(Boolean).length;
  const characterCount = session.text.length;
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {session.duration} min
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            {wordCount} words
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            {characterCount} chars
          </Badge>
          <Badge variant="secondary">
            {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-1"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        
        {!hasReflection && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyze}
            className="flex items-center gap-1"
          >
            <BarChart3 className="h-4 w-4" />
            Get AI Reflection
          </Button>
        )}
        
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
      
      <Separator />
      
      <div className="bg-card p-6 rounded-lg border border-border">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {session.text || <span className="text-muted-foreground italic">No content</span>}
        </pre>
      </div>
      
      {hasReflection && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              AI Reflection
            </h3>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="prose prose-invert max-w-none">
                {session.reflection?.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4 last:mb-0 text-sm">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
