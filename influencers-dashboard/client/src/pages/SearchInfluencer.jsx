import React, { useState, useEffect } from 'react';
import { useInfluencer } from '@/contexts/InfluencerContext';
import { useTheme } from '@/contexts/ThemeContext';
import Card, { CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonGroup } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import '@/styles/pages/SearchInfluencer.css';

const SearchInfluencer = () => {
  const { influencers, total, fetchInfluencers, filters, updateFilters } = useInfluencer();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [selectedPlatform, setSelectedPlatform] = useState(filters.platform || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    updateFilters({ search: searchTerm, category: selectedCategory, platform: selectedPlatform });
    setCurrentPage(1);
    fetchInfluencers();
  }, [searchTerm, selectedCategory, selectedPlatform, fetchInfluencers, updateFilters]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchInfluencers();
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
    fetchInfluencers();
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1 className="search-title">Buscar Influenciadores</h1>
        <div className="search-filters">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="Nutrição">Nutrição</SelectItem>
              <SelectItem value="Saúde Mental">Saúde Mental</SelectItem>
              <SelectItem value="Fitness">Fitness</SelectItem>
              <SelectItem value="Viagem">Viagem</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="YouTube">YouTube</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="search-bar">
        <Input
          placeholder="Buscar influenciadores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button>Buscar</Button>
      </div>

      <div className="influencers-grid">
        {influencers.map((influencer) => (
          <Card key={influencer.id}>
            <CardHeader>
              <CardTitle>{influencer.name}</CardTitle>
              <Badge variant="outline">{influencer.platform}</Badge>
            </CardHeader>
            <CardContent>
              <div className="influencer-stats">
                <div className="stat-row">
                  <span className="stat-label">Seguidores:</span>
                  <span>{influencer.followers.toLocaleString()}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Score de Confiabilidade:</span>
                  <span>{influencer.trustScore}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Categorias:</span>
                  <div className="categories">
                    {influencer.categories.map((category) => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="ghost" href={`/influencer-details/${influencer.id}`}>
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pagination">
        <ButtonGroup>
          {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'solid' : 'outline'}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
        </ButtonGroup>
        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
          <SelectTrigger>
            <SelectValue>{pageSize}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchInfluencer;