import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">zenpad</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} zenpad. all rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:underline"
            >
              privacy policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:underline"
            >
              terms of service
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
} 