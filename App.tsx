import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Details from './pages/Details';
import Watch from './pages/Watch';
import Adult from './pages/Adult';
import Search from './pages/Search';
import Genres from './pages/Genres';
import Movies from './pages/Movies';
import WebSeries from './pages/WebSeries';
import Favorites from './pages/Favorites';
import History from './pages/History';
import LiveTV from './pages/LiveTV';
import Actor from './pages/Actor';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import { initializeProviders } from './providers';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import LockScreen from './components/LockScreen';
import ScrollToTop from './components/ScrollToTop';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple wrapper to conditionally render Navbar and Footer
const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

// AppRoutes component to handle routing and lock screen
const AppRoutes = () => {
  const { isLocked, isAuthenticated } = useAuth();

  if (isAuthenticated && isLocked) {
    return <LockScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/movies"
        element={
          <ProtectedRoute>
            <Layout>
              <Movies />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/webseries"
        element={
          <ProtectedRoute>
            <Layout>
              <WebSeries />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/livetv"
        element={
          <ProtectedRoute>
            <Layout>
              <LiveTV />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Layout>
              <Favorites />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <Layout>
              <History />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <Layout>
              <Search />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/genres"
        element={
          <ProtectedRoute>
            <Layout>
              <Genres />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/genres/:genreId"
        element={
          <ProtectedRoute>
            <Layout>
              <Genres />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/movies/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <Details type="movie" />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/webseries/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <Details type="tv" />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/watch/:movieId"
        element={
          <ProtectedRoute>
            <Layout>
              <Watch />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/actor/:actorId"
        element={
          <ProtectedRoute>
            <Layout>
              <Actor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/adult/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Adult />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin-dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Fallbacks */}
      <Route path="*" element={<div className="p-20 text-center text-white">404 - Page Not Found</div>} />
    </Routes>
  );
};

const App = () => {
  // Initialize providers when app starts
  useEffect(() => {
    initializeProviders();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <ScrollToTop />
          <AuthProvider>
            <ThemeProvider>
              <AppRoutes />
            </ThemeProvider>
          </AuthProvider>
        </HashRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;