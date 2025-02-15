import React, { createContext, useContext, useState, useCallback } from 'react';

const InfluencerContext = createContext();

export function InfluencerProvider({ children }) {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    platform: ''
  });

  const fetchInfluencers = useCallback(async () => {
    setLoading(true);
    try {
      // Simulando uma chamada API
      const response = await new Promise(resolve => 
        setTimeout(() => resolve([
          {
            id: 1,
            name: 'João Silva',
            platform: 'Instagram',
            followers: 50000,
            trustScore: 85,
            status: 'Ativo'
          },
          {
            id: 2,
            name: 'Maria Santos',
            platform: 'YouTube',
            followers: 75000,
            trustScore: 92,
            status: 'Ativo'
          }
        ]), 500)
      );

      let filteredInfluencers = response;

      // Aplicar filtros
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredInfluencers = filteredInfluencers.filter(inf => 
          inf.name.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.platform) {
        filteredInfluencers = filteredInfluencers.filter(inf => 
          inf.platform === filters.platform
        );
      }

      if (filters.category) {
        filteredInfluencers = filteredInfluencers.filter(inf => 
          inf.categories?.includes(filters.category)
        );
      }

      setInfluencers(filteredInfluencers);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar influenciadores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return (
    <InfluencerContext.Provider value={{
      influencers,
      loading,
      error,
      filters,
      fetchInfluencers,
      updateFilters
    }}>
      {children}
    </InfluencerContext.Provider>
  );
}

export const useInfluencer = () => {
  const context = useContext(InfluencerContext);
  if (!context) {
    throw new Error('useInfluencer must be used within an InfluencerProvider');
  }
  return context;
};
