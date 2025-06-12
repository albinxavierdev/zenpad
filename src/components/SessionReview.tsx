import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Clock, 
  BrainCircuit,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Target,
  Lightbulb,
  BarChart3
} from "lucide-react";
import { WritingSession } from '@/services/StorageService';
import { WritingAnalysis } from '@/services/AIService';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  const isElectron = window.electron !== undefined;
  
  const analysis: WritingAnalysis | null = session.reflection ? JSON.parse(session.reflection) : null;
  
  // Merge backend and AI metrics, prefer backend for most fields
  let metrics = (analysis?.metrics || {}) as any;
  if (analysis) {
    metrics = {
      ...metrics,
      // Prefer backend-calculated values for these fields
      wordCount: metrics.wordCount,
      characterCount: metrics.characterCount,
      typingSpeed: metrics.typingSpeed,
      vocabularyDiversity: metrics.vocabularyDiversity,
      averageSentenceLength: metrics.averageSentenceLength,
      sentenceLengthStdDev: metrics.sentenceLengthStdDev,
      paragraphs: metrics.paragraphs,
      mostRepeatedWords: metrics.mostRepeatedWords,
      longestStreak: metrics.longestStreak,
      // Use AI values for these if present
      passiveVoicePercent: metrics.passiveVoicePercent ?? 'N/A',
      fleschKincaidGrade: metrics.fleschKincaidGrade ?? 'N/A',
    };
  }
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(session.text);
    setCopied(true);
      toast({
        title: "copied to clipboard",
        description: "your writing has been copied to the clipboard."
      });
    setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying text:', error);
      toast({
        variant: "destructive",
        title: "error",
        description: "failed to copy text to clipboard"
      });
    }
  };
  
  const handleDownload = async () => {
    if (isElectron) {
      try {
        await window.electron.saveFile(session.text);
          toast({
          title: "file saved",
          description: "your writing has been saved successfully."
          });
      } catch (error) {
        console.error('Error saving file:', error);
        toast({
          variant: "destructive",
          title: "error",
          description: "failed to save file"
        });
      }
    } else {
      const blob = new Blob([session.text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zenpad-session-${new Date(session.timestamp).toISOString()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 min-h-full">
      {/* Header section - fixed */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              back
            </Button>
            <h1 className="text-xl font-bold tracking-tight hidden md:block text-primary">zenpad</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(session.timestamp, { addSuffix: true })}
            </Badge>
            <Badge variant="outline">
              {session.duration} min
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-end mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-1"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'copied' : 'copy'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            {isElectron ? 'save as' : 'download'}
          </Button>
          
          {!hasReflection ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onAnalyze}
              className="flex items-center gap-1"
            >
              <BrainCircuit className="h-4 w-4" />
              get analysis
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onAnalyze}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              new analysis
            </Button>
          )}
          
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            delete
          </Button>
        </div>
        
        <Separator className="mt-4" />
      </div>
      
      {/* Scrollable content */}
      <div className="space-y-6">
        {/* Writing content */}
        <div className="zen-card p-6 rounded-lg border border-border shadow-sm max-h-[60vh] overflow-y-auto">
          <pre className="whitespace-pre-wrap font-handwritten text-xl leading-relaxed">
            {session.text || <span className="text-muted-foreground italic">no content</span>}
          </pre>
        </div>
        
        {analysis ? (
          <>
            <Separator />
            <div className="space-y-6">
              <div className="flex items-center justify-between sticky top-[120px] z-10 bg-background/80 backdrop-blur-sm py-2">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" />
                  writing analysis
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAnalyze}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  new analysis
                </Button>
              </div>

              {/* Analysis cards */}
              <div className="space-y-6">
                {/* Metrics Card: Quantitative and Readability Metrics */}
                {analysis.metrics && typeof analysis.metrics === 'object' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        writing metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">words</p>
                          <p className="text-2xl font-bold">{analysis.metrics.wordCount ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">characters</p>
                          <p className="text-2xl font-bold">{analysis.metrics.characterCount ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">paragraphs</p>
                          <p className="text-2xl font-bold">{analysis.metrics.paragraphs ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">typing speed (WPM)</p>
                          <p className="text-2xl font-bold">{analysis.metrics.typingSpeed ?? 0}</p>
                          <p className="text-xs text-muted-foreground">(calculated as (characters / 5) / minutes)</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">time taken (min)</p>
                          <p className="text-2xl font-bold">{analysis.metrics.timeTaken ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">avg words/sentence</p>
                          <p className="text-2xl font-bold">{analysis.metrics.avgWordsPerSentence?.toFixed(1) ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">avg sentence length</p>
                          <p className="text-2xl font-bold">{analysis.metrics.avgSentenceLength?.toFixed(1) ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">unique words</p>
                          <p className="text-2xl font-bold">{analysis.metrics.uniqueWords ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">repetition rate</p>
                          <p className="text-2xl font-bold">{(analysis.metrics.repetitionRate * 100).toFixed(1)}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">grammar errors</p>
                          <p className="text-2xl font-bold">{analysis.metrics.grammarErrors ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">passive voice %</p>
                          <p className="text-2xl font-bold">{analysis.metrics.passiveVoicePercent ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Flesch-Kincaid Grade</p>
                          <p className="text-2xl font-bold">{analysis.metrics.fleschKincaidGrade ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Flesch Reading Ease</p>
                          <p className="text-2xl font-bold">{analysis.metrics.fleschReadingEase ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Gunning Fog Index</p>
                          <p className="text-2xl font-bold">{analysis.metrics.gunningFogIndex ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">SMOG Index</p>
                          <p className="text-2xl font-bold">{analysis.metrics.smogIndex ?? 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Qualitative Analysis */}
                {analysis.qualitative && typeof analysis.qualitative === 'object' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4" />
                        qualitative analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold">Clarity</p>
                          <p className="text-sm text-muted-foreground">{analysis.qualitative.clarity}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Coherence</p>
                          <p className="text-sm text-muted-foreground">{analysis.qualitative.coherence}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Tone & Voice</p>
                          <p className="text-sm text-muted-foreground">{analysis.qualitative.toneAndVoice}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Engagement</p>
                          <p className="text-sm text-muted-foreground">{analysis.qualitative.engagement}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Purpose Fulfillment</p>
                          <p className="text-sm text-muted-foreground">{analysis.qualitative.purposeFulfillment}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Creativity / Originality</p>
                          <p className="text-sm text-muted-foreground">{analysis.qualitative.creativity}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Grammar & Syntax</p>
                          <p className="text-sm text-muted-foreground">{analysis.qualitative.grammarAndSyntax}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Structure & Format</p>
                          <p className="text-sm text-muted-foreground">{analysis.qualitative.structureAndFormat}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Suggestions */}
                {Array.isArray(analysis.suggestions) && analysis.suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.suggestions.map((imp: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                            <span className="text-sm">{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* AI Reflection */}
                {typeof analysis.reflection === 'string' && analysis.reflection.trim().length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4" />
                        AI Reflection
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="mb-4 last:mb-0 text-sm text-muted-foreground">
                          {analysis.reflection}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-destructive text-sm p-4 border border-destructive rounded">
            <strong>Error:</strong> No analysis data available.<br />
            Please try generating the analysis again.<br />
          </div>
        )}
      </div>
    </div>
  );
};
