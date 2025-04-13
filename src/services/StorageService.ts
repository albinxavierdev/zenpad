
export interface WritingSession {
  id: string;
  timestamp: number;
  duration: number; // in minutes
  text: string;
  reflection?: string;
}

export const StorageService = {
  saveSession(session: Omit<WritingSession, 'id'>): string {
    const id = crypto.randomUUID();
    const sessionWithId = { ...session, id };
    
    // Get existing sessions
    const sessions = this.getAllSessions();
    
    // Add new session
    sessions.push(sessionWithId);
    
    // Save updated sessions
    localStorage.setItem('freewrite-sessions', JSON.stringify(sessions));
    
    return id;
  },
  
  getSession(id: string): WritingSession | undefined {
    const sessions = this.getAllSessions();
    return sessions.find(session => session.id === id);
  },
  
  getAllSessions(): WritingSession[] {
    const sessions = localStorage.getItem('freewrite-sessions');
    return sessions ? JSON.parse(sessions) : [];
  },
  
  deleteSession(id: string): void {
    let sessions = this.getAllSessions();
    sessions = sessions.filter(session => session.id !== id);
    localStorage.setItem('freewrite-sessions', JSON.stringify(sessions));
  },
  
  updateSession(id: string, updates: Partial<Omit<WritingSession, 'id'>>): void {
    const sessions = this.getAllSessions();
    const index = sessions.findIndex(session => session.id === id);
    
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      localStorage.setItem('freewrite-sessions', JSON.stringify(sessions));
    }
  },
  
  getSavedDuration(): number {
    const duration = localStorage.getItem('freewrite-duration');
    return duration ? parseInt(duration, 10) : 5; // Default 5 minutes
  },
  
  saveDuration(minutes: number): void {
    localStorage.setItem('freewrite-duration', minutes.toString());
  },
  
  getSavedAPIKey(): string {
    return localStorage.getItem('freewrite-api-key') || '';
  },
  
  saveAPIKey(apiKey: string): void {
    localStorage.setItem('freewrite-api-key', apiKey);
  }
};
