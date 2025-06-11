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
                {/* Metrics */}
                {analysis.metrics && typeof analysis.metrics === 'object' ? (
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
                          <p className="text-sm text-muted-foreground">typing speed</p>
                          <p className="text-2xl font-bold">{analysis.metrics.typingSpeed ?? 0} wpm</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">vocabulary</p>
                          <p className="text-2xl font-bold">{((analysis.metrics.vocabularyDiversity ?? 0) * 100).toFixed(1)}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">avg sentence length</p>
                          <p className="text-2xl font-bold">{(analysis.metrics.averageSentenceLength ?? 0).toFixed(1)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">sentence std dev</p>
                          <p className="text-2xl font-bold">{(analysis.metrics.sentenceLengthStdDev ?? 0).toFixed(1)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">paragraphs</p>
                          <p className="text-2xl font-bold">{analysis.metrics.paragraphs ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">most repeated</p>
                          <p className="text-2xl font-bold">{Array.isArray(analysis.metrics.mostRepeatedWords) ? analysis.metrics.mostRepeatedWords.join(', ') : ''}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">longest streak</p>
                          <p className="text-2xl font-bold">{analysis.metrics.longestStreak ?? 0} min</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">passive voice %</p>
                          <p className="text-2xl font-bold">{analysis.metrics.passiveVoicePercent ?? 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Flesch-Kincaid grade</p>
                          <p className="text-2xl font-bold">{analysis.metrics.fleschKincaidGrade ?? 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  (() => {
                    console.error('Invalid or missing metrics:', analysis.metrics);
                    return (
                      <div className="text-destructive text-sm p-4 border border-destructive rounded">
                        <strong>Error:</strong> Writing metrics are missing or invalid.<br />
                        Please try generating the analysis again.<br />
                      </div>
                    );
                  })()
                )}

                {/* Strengths */}
                {Array.isArray(analysis.strengths) && analysis.strengths.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        key strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Areas for Improvement */}
                {Array.isArray(analysis.areasForImprovement) && analysis.areasForImprovement.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        areas for improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.areasForImprovement.map((area, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <span className="text-sm">{area}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Summary */}
                {typeof analysis.summary === 'string' && analysis.summary.trim().length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4" />
                        summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        {analysis.summary.split('\n').map((paragraph, i) => (
                          <p key={i} className="mb-4 last:mb-0 text-sm text-muted-foreground">
                            {paragraph}
                          </p>
                        ))}
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
