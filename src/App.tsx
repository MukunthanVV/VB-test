import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GenericDivisionPage from './pages/GenericDivisionPage';
import JournalArticlePage from './pages/JournalArticlePage';
import AdminPage from './pages/admin/AdminPage';
import { AuthProvider } from './contexts/AuthContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const LegacyHashRedirector = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash.startsWith('#/')) {
      const cleanPath = window.location.hash.substring(1);
      navigate(cleanPath, { replace: true });
    }
  }, [navigate]);

  return null;
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent font-body-md text-on-surface">
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <LegacyHashRedirector />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/division/:id" element={<GenericDivisionPage />} />
            <Route path="/journal/:id" element={<JournalArticlePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
};

export default App;
