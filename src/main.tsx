import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StorageService } from './services/StorageService'
import { AuthService } from './services/AuthService'

// Initialize the app
const initializeApp = async () => {
  try {
    // Check authentication state
    const { user, error: authError } = await AuthService.getCurrentUser();
    if (authError) {
      console.error('Error checking auth state:', authError);
    }
    
    // Initialize storage service
    await StorageService.initialize();
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
  } finally {
    // Render the app regardless of initialization status
    // The auth context will handle the authentication state
    createRoot(document.getElementById("root")!).render(<App />);
  }
}

// Start the app
initializeApp();
