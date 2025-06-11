import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, File, Trash2 } from "lucide-react";
import { StorageService, WritingSession } from '@/services/StorageService';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow, format } from 'date-fns';

interface HistoryScreenProps {
  onBack: () => void;
  onSelectSession: (session: WritingSession) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ 
  onBack,
  onSelectSession
}) => {
  const [sessions, setSessions] = useState<WritingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load sessions on component mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        // Use await with the async StorageService method
        const allSessions = await StorageService.getAllSessions();
        // Sort sessions by timestamp (newest first)
        allSessions.sort((a, b) => b.timestamp - a.timestamp);
        setSessions(allSessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
        setSessions([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load writing history"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSessions();
  }, [toast]);

  const handleDeleteSession = async (id: string) => {
    try {
      await StorageService.deleteSession(id);
      setSessions(prev => prev.filter(session => session.id !== id));
      toast({
        title: "Session deleted",
        description: "Your writing session has been deleted."
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete session"
      });
    }
  };

  return (
    <div className="h-screen w-full grid-background overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              zenpad history
            </h1>
          </div>
        </div>
        
        <Separator />
        
        {loading ? (
          <div className="text-center py-8">
            <p>loading sessions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>no writing sessions yet.</p>
              </div>
            ) : (
              sessions.map(session => (
                <div 
                  key={session.id} 
                  className="zen-card p-4 flex justify-between items-center hover:cursor-pointer transition-all shadow-sm hover:shadow-md"
                  onClick={() => onSelectSession(session)}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(session.timestamp), 'MMM d, yyyy')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(session.timestamp), 'h:mm a')}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-1 max-w-lg">
                      {session.text.slice(0, 120)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.duration} min
                    </Badge>
                    <Badge variant="secondary">
                      {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 