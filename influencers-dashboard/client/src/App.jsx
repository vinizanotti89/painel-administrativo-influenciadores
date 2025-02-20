import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import InfluencerList from './pages/InfluencerList';
import { InfluencerProvider } from './contexts/InfluencerContext';
import InfluencerDetails from './pages/InfluencerDetails';
import Analytics from './pages/Analytics';
import ClaimDetails from './pages/ClaimDetails';
import HealthClaims from './pages/HealthClaims';
import HealthClaimForm from './pages/HealthClaimForm';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SearchInfluencer from './pages/SearchInfluencer';
import SearchPage from './pages/SearchPage';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import TrustLeaderboard from './pages/TrustLeaderboard';
import '@/styles/index.css';
import '@/styles/themes.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <InfluencerProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/influencers" element={<InfluencerList />} />
              <Route path="/influencers/:id" element={<InfluencerDetails />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/claims/new" element={<HealthClaimForm />} />
              <Route path="/claims/:id" element={<ClaimDetails />} />
              <Route path="/claims" element={<HealthClaims />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/search/influencer" element={<SearchInfluencer />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/leaderboard" element={<TrustLeaderboard />} />
            </Routes>
          </Layout>
        </InfluencerProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;