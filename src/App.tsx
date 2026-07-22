import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const GenericDivisionPage = lazy(() => import('./pages/GenericDivisionPage'));
const JournalArticlePage = lazy(() => import('./pages/JournalArticlePage'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent font-body-md text-on-surface">
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/division/:id" element={<GenericDivisionPage />} />
              <Route path="/journal/:id" element={<JournalArticlePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>

    </div>
  );
};

export default App;
