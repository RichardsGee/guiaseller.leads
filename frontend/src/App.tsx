import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/Login';
import { Zap } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center justify-center w-14 h-14 bg-green-500 rounded-2xl mb-4 animate-pulse">
        <Zap className="w-8 h-8 text-white" />
      </div>
      <p className="text-sm text-slate-500">Carregando...</p>
    </div>
  );
}

function App() {
  const { isAuthenticated, isInitializing, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AppLayout />;
}

export default App;
