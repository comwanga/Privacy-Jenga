import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const GamePage = lazy(() => import('./pages/GamePage'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-teal-400 font-semibold">Loading Privacy Jenga...</p>
    </div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
