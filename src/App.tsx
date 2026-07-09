import { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VBMotorsPage from './pages/VBMotorsPage';
import UsedCarsPage from './pages/UsedCarsPage';
import EventsPage from './pages/EventsPage';
import RealEstatePage from './pages/RealEstatePage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <div className="min-h-screen bg-transparent font-body-md text-on-surface">
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/motors" element={<VBMotorsPage />} />
          <Route path="/used-cars" element={<UsedCarsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/real-estate-constructions" element={<RealEstatePage />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
