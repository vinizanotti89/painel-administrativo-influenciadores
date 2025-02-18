import React, { useState, useEffect } from 'react';
import { useInfluencer } from '@/contexts/InfluencerContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import '@/styles/pages/InfluencerDetails.css';

const InfluencerDetails = () => {
  const { influencers, loading, error } = useInfluencer();
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);

  useEffect(() => {
    const currentInfluencer = influencers.find((inf) => inf.id === 1);
    setSelectedInfluencer(currentInfluencer);
  }, [influencers]);

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error-message">Erro: {error}</div>;
  if (!selectedInfluencer) return null;

  const { name, platform, followers, trustScore, statistics } = selectedInfluencer;

  const renderTrustScoreBadge = (score) => {
    if (score >= 80) return <Badge className="badge verified">Alta Confiabilidade</Badge>;
    if (score >= 60) return <Badge className="badge pending">Média Confiabilidade</Badge>;
    return <Badge className="badge refuted">Baixa Confiabilidade</Badge>;
  };

  return (
    <div className="influencer-details">
      <div className="details-header">
        <div>
          <h1 className="influencer-name">{name}</h1>
          <div className="badges-container">
            <Badge variant="outline">{platform}</Badge>
            {renderTrustScoreBadge(trustScore)}
            <span className="followers-count">{followers.toLocaleString()} seguidores</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Total de Alegações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{statistics.totalClaims}</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Verificadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value verified">{statistics.verifiedClaims}</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Refutadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value refuted">{statistics.refutedClaims}</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value pending">{statistics.pendingClaims}</div>
          </CardContent>
        </Card>
      </div>

      <div className="claim-tabs">
        <Tabs defaultValue="allegations">
          <TabsList>
            <TabsTrigger value="allegations">Alegações</TabsTrigger>
            <TabsTrigger value="analysis">Análises</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="allegations" className="tab-content">
            {/* Conteúdo das alegações */}
          </TabsContent>

          <TabsContent value="analysis" className="tab-content">
            {/* Conteúdo das análises */}
          </TabsContent>

          <TabsContent value="history" className="tab-content">
            {/* Conteúdo do histórico */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InfluencerDetails;