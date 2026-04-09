import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useCmdK } from './hooks/useCmdK';
import { CommandPalette } from './components/modals/CommandPalette';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { SharedBrain } from './pages/SharedBrain';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuth = !!localStorage.getItem('secondbrain_jwt');
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  useCmdK();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground dark selection:bg-[#0070F3]/30">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/brain/:hash" element={<SharedBrain />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
          <CommandPalette />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
