import React, { useEffect } from 'react';
import { useInfluencer } from '@/contexts/InfluencerContext';
import { Card, CardContent } from "@/components/ui/card";  // Modificado aqui
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/ui/SearchBar';
import InfluencerTable from '@/components/influencer/InfluencerTable';

const InfluencerList = () => {
  const {
    influencers,
    loading,
    error,
    filters,
    updateFilters,
    fetchInfluencers
  } = useInfluencer();

  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  const handleSearch = (searchTerm) => {
    updateFilters({ search: searchTerm });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        Erro: {error}
      </div>
    );
  }

  return (
    <div className="influencer-list">
      <div className="list-header">
        <h2 className="title">Médicos Influenciadores</h2>
        <Button
          variant="default"
          onClick={() => window.open('/influencer/new', '_blank')}
          className="add-button"
        >
          Adicionar Médico Influenciador
        </Button>
      </div>

      <Card>
        <CardContent className="list-content">
          <div className="filters-section">
            <div className="search-filters">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Buscar médico..."
                className="search-input"
              />
              <select
                className="category-select"
                onChange={(e) => updateFilters({ category: e.target.value })}
              >
                <option value="">Todas Especialidades</option>
                <option value="Neurologia">Neurologia</option>
                <option value="Pediatria">Pediatria</option>
                <option value="Cardiologia">Cardiologia</option>
              </select>
            </div>

            <InfluencerTable influencers={influencers} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfluencerList;