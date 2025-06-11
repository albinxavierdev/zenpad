import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SignInPage } from "@/pages/auth/SignInPage";
import { SignUpPage } from "@/pages/auth/SignUpPage";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ProfilePage } from "./pages/ProfilePage";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SetupScreen } from "@/screens/SetupScreen";
import { ReviewScreen } from "@/screens/ReviewScreen";
import { WritingScreen } from "@/screens/WritingScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";

// Create a client
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const AppContent = () => {
  useEffect(() => {
    // Set the document title
    document.title = "zenpad - distraction-free writing";
    
    // Update metadata for the app
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'zenpad is a minimalist distraction-free writing app with timed sessions and local AI reflection');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'zenpad is a minimalist distraction-free writing app with timed sessions and local AI reflection';
      document.head.appendChild(meta);
    }
  }, []);

  const navigate = useNavigate();

  function SetupScreenWrapper() {
    return (
      <SetupScreen
        onStart={() => navigate('/app/write')}
        onViewHistory={() => navigate('/app/history')}
      />
    );
  }

  function WritingScreenWrapper() {
    return (
      <WritingScreen
        duration={5}
        onComplete={(session) => navigate('/app/review', { state: { session } })}
        onExit={() => navigate('/app')}
      />
    );
  }

  function ReviewScreenWrapper() {
    const location = useLocation();
    const session = location.state?.session;
    
    if (!session) {
      // If no session data is provided, redirect to history
      return <Navigate to="/app/history" replace />;
    }

    return (
      <ReviewScreen
        session={session}
        onBack={() => navigate('/app')}
        onDelete={() => navigate('/app/history')}
      />
    );
  }

  function HistoryScreenWrapper() {
    return (
      <HistoryScreen
        onBack={() => navigate('/app')}
        onSelectSession={(session) => navigate('/app/review', { state: { session } })}
      />
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={
          <AuthLayout>
            <ResetPasswordForm />
          </AuthLayout>
        } />
        <Route path="/update-password" element={
          <AuthLayout>
            <UpdatePasswordForm />
          </AuthLayout>
        } />

        {/* Protected writing app route */}
        <Route path="/app" element={
          <ProtectedRoute>
            <SetupScreenWrapper />
          </ProtectedRoute>
        } />
        <Route path="/app/write" element={
          <ProtectedRoute>
            <WritingScreenWrapper />
          </ProtectedRoute>
        } />
        <Route path="/app/review" element={
          <ProtectedRoute>
            <ReviewScreenWrapper />
          </ProtectedRoute>
        } />
        <Route path="/app/history" element={
          <ProtectedRoute>
            <HistoryScreenWrapper />
          </ProtectedRoute>
        } />
        <Route path="/app/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
};

export default App;
