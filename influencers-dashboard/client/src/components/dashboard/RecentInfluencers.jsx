import React from 'react';
import { Link } from 'react-router-dom';
import { useInfluencer } from '@/contexts/InfluencerContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import '@/styles/components/dashboard/recent-influencers.css';

const RecentInfluencers = () => {
  const { influencers, loading } = useInfluencer();

  const getTrustScoreClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <Card className="recent-influencers-card">
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="recent-influencers-card">
      <div className="recent-influencers-header">
        <h2 className="recent-influencers-title">Influenciadores Recentes</h2>
      </div>

      <div className="table-container">
        <Table className="influencers-table">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Seguidores</TableHead>
              <TableHead>Trust Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {influencers.slice(0, 5).map((influencer) => (
              <TableRow key={influencer.id}>
                <TableCell>
                  <span className="influencer-name">{influencer.name}</span>
                </TableCell>
                <TableCell>{influencer.platform}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('pt-BR').format(influencer.followers)}
                </TableCell>
                <TableCell>
                  <span className={`trust-score ${getTrustScoreClass(influencer.trustScore)}`}>
                    {influencer.trustScore}%
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="status-badge">
                    {influencer.status || 'Ativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link 
                    to={`/influencers/${influencer.id}`}
                    className="view-details-button"
                  >
                    Ver Detalhes
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default RecentInfluencers;