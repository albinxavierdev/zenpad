import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  File, 
  Plus, 
  X, 
  Clock, 
  LayoutDashboard,
  History,
  LogOut,
  User,
  Settings
} from "lucide-react";
import { WritingSession } from '@/services/StorageService';
import { format } from 'date-fns';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  isOpen: boolean;
  sessions: WritingSession[];
  onClose: () => void;
  onSelectSession: (session: WritingSession) => void;
  onNewSession: () => void;
  onViewHistory: () => void;
  currentScreen: 'setup' | 'writing' | 'review' | 'history';
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  sessions,
  onClose,
  onSelectSession,
  onNewSession,
  onViewHistory,
  currentScreen,
  className = ''
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Function to handle history button click
  const handleHistoryClick = () => {
    if (currentScreen !== 'history') {
      onViewHistory();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div 
      className={`
        h-screen border-r border-border bg-card w-80
        fixed md:relative z-40
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${className}
      `}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-bold text-primary">
          Zenpad
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4 space-y-2">
        <Button 
          variant={currentScreen === 'setup' ? 'secondary' : 'ghost'} 
          className="w-full justify-start" 
          onClick={onNewSession}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        
        <Button 
          variant={currentScreen === 'history' ? 'secondary' : 'ghost'} 
          className="w-full justify-start" 
          onClick={handleHistoryClick}
        >
          <History className="mr-2 h-4 w-4" />
          History
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={onNewSession}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Writing Session
        </Button>
      </div>
      
      <Separator className="my-2" />
      
      <div className="px-4 py-2">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent sessions</h3>
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-1 px-2">
          {sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center p-4">
              No writing sessions yet.
            </p>
          ) : (
            sessions.map(session => (
              <Button
                key={session.id}
                variant="ghost"
                className="w-full justify-start text-left p-2 h-auto"
                onClick={() => onSelectSession(session)}
              >
                <div className="flex items-start space-x-2 w-full">
                  <File className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm truncate">
                        {format(new Date(session.timestamp), 'MMM d, yyyy')}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {session.duration}m
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.text.substring(0, 50)}
                      {session.text.length > 50 ? '...' : ''}
                    </p>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              <span className="truncate">{user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}; 