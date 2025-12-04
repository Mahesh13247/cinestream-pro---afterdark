import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdultSecurityProvider } from './contexts/AdultSecurityContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdultRoute from './components/AdultRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { initializeProviders } from './providers';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Details = lazy(() => import('./pages/Details'));
const Watch = lazy(() => import('./pages/Watch'));
const Adult = lazy(() => import('./pages/Adult'));
const Search = lazy(() => import('./pages/Search'));
const Genres = lazy(() => import('./pages/Genres'));
const Movies = lazy(() => import('./pages/Movies'));
const WebSeries = lazy(() => import('./pages/WebSeries'));
const Favorites = lazy(() => import('./pages/Favorites'));
const History = lazy(() => import('./pages/History'));
const LiveTV = lazy(() => import('./pages/LiveTV'));
const Actor = lazy(() => import('./pages/Actor'));
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

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
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
};

const App = () => {
    // Initialize providers when app starts
    useEffect(() => {
        initializeProviders();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <HashRouter>
                <AuthProvider>
                    <AdultSecurityProvider>
                        <ThemeProvider>
                            <Suspense fallback={<LoadingSpinner />}>
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
                                            <AdultRoute>
                                                <Layout>
                                                    <Adult />
                                                </Layout>
                                            </AdultRoute>
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
                            </Suspense>
                        </ThemeProvider>
                    </AdultSecurityProvider>
                </AuthProvider>
            </HashRouter>
        </QueryClientProvider>
    );
};

export default App;