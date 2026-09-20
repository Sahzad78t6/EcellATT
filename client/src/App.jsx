import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2 // 2 minutes
    }
  }
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'surface-card border border-border-bright text-text-primary text-xs font-semibold rounded-xl shadow-depth-3 backdrop-blur-md',
              style: {
                background: '#0a1224',
                color: '#f1f5f9',
                border: '1px solid rgba(96, 165, 250, 0.25)',
                boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.8), 0 0 16px rgba(59, 130, 246, 0.2)',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#02040a'
                }
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#02040a'
                }
              }
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
