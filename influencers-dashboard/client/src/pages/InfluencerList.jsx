import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfluencer } from '@/contexts/InfluencerContext';
import Card from '@/components/ui/card';
import SearchBar from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/button';
import '@/styles/pages/InfluencerList.css';

const InfluencerList = () => {
  const navigate = useNavigate();
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

  const handleViewClaims = (influencerId) => {
    navigate(`/influencer/${influencerId}/claims`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="influencer-list">
      <div className="list-header">
        <h2 className="title">Médicos Influenciadores</h2>
        <Button
          text="Adicionar Médico Influenciador"
          variant="primary"
          onClick={() => navigate('/influencer/new')}
          className="add-button"
        />
      </div>

      <Card className="list-content">
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

          <div className="table-container">
            <table className="influencers-table">
              <thead>
                <tr>
                  <th>Médico</th>
                  <th>Especialidade</th>
                  <th>Plataforma</th>
                  <th>Seguidores</th>
                  <th>Pontuação</th>
                  <th>Histórico</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {influencers.map((influencer) => (
                  <tr key={influencer.id}>
                    <td className="doctor-info">
                      <div className="doctor-name">
                        Dr(a). {influencer.name}
                      </div>
                    </td>
                    <td className="category-cell">{influencer.category}</td>
                    <td className="platform-cell">{influencer.platform}</td>
                    <td className="followers-cell">{influencer.followers}</td>
                    <td className="score-cell">
                      <span className={`score-badge ${influencer.pontuacao >= 80 ? 'high' :
                          influencer.pontuacao >= 60 ? 'medium' :
                            'low'}`}>
                        {influencer.pontuacao}/100
                      </span>
                    </td>
                    <td className="history-cell">
                      <span className={`history-badge ${influencer.jaPostouFakeNews ? 'has-fake-news' : 'no-fake-news'
                        }`}>
                        {influencer.jaPostouFakeNews ? 'Fake News Detectada' : 'Sem Fake News'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <Button
                        text="Ver Alegações"
                        variant="primary"
                        size="small"
                        onClick={() => handleViewClaims(influencer.id)}
                        className="view-claims-button"
                      />
                      <Button
                        text="Editar"
                        variant="secondary"
                        size="small"
                        className="edit-button"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InfluencerList;