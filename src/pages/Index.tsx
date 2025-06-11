import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleCTA = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (user) {
        navigate('/app');
      } else {
        navigate('/signin');
      }
    }, 500); // Match animation duration
  };

  return (
    <div className="h-screen w-full grid-background flex flex-col items-center justify-center">
      <div className="min-h-screen w-full bg-background/80 text-foreground flex flex-col items-center justify-center">
        <main
          className={`flex flex-col items-center justify-center w-full max-w-xl px-4 py-32 text-center transition-all duration-500 ${
            isTransitioning ? 'opacity-0 scale-95 blur-sm pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          <h1 className="text-5xl md:text-6xl font-doodle font-bold tracking-tight mb-6">
            zenpad
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10">
            distraction-free writing for modern creatives.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 py-4 text-lg shadow-xl bg-primary hover:bg-primary/90 transition-transform duration-200 hover:scale-105"
            onClick={handleCTA}
            disabled={isTransitioning}
          >
            start writing
          </Button>
        </main>
        <footer className="w-full text-center text-muted-foreground py-4 text-sm mt-auto">
          © {new Date().getFullYear()} zenpad. developed by albin.
        </footer>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap');
          .font-doodle {
            font-family: 'Shadows Into Light', cursive;
            letter-spacing: 0.02em;
          }
        `}</style>
      </div>
    </div>
  );
};

export default LandingPage;
