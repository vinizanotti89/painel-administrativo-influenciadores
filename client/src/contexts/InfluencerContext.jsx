import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from './mockApi.js';

const InfluencerContext = createContext();

export const InfluencerProvider = ({ children }) => {
  const [influencers, setInfluencers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); // Start with true
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    platform: '',
  });

  const fetchInfluencers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching influencers...'); // Add more logging
      const data = await api.getInfluencers();
      console.log('Data received:', data);
      
      if (!data || data.length === 0) {
        console.warn('No influencers found');
      }
      
      setInfluencers(data || []);
      setTotal(data ? data.length : 0);
    } catch (err) {
      console.error('Error fetching influencers:', err);
      setError(err.message || 'Failed to fetch influencers');
      setInfluencers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const value = {
    influencers,
    total,
    loading,
    error,
    filters,
    updateFilters,
    fetchInfluencers,
  };

  return (
    <InfluencerContext.Provider value={value}>
      {children}
    </InfluencerContext.Provider>
  );
};

export const useInfluencer = () => {
  const context = useContext(InfluencerContext);
  if (context === undefined) {
    throw new Error('useInfluencer must be used within a InfluencerProvider');
  }
  return context;
};


