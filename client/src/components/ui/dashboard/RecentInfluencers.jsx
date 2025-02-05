import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import '@/styles/components/dashboard/recent-influencers.css';

const RecentInfluencers = ({ influencers }) => {
  return (
    <Card className="recent-influencers-card">
      <div className="recent-influencers-header">
        <h2 className="recent-influencers-title">Influenciadores Recentes</h2>
      </div>
      <div className="recent-influencers-content">
        <div className="table-container">
          <table className="influencers-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Plataforma</th>
                <th>Seguidores</th>
                <th>Trust Score</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {influencers.map((influencer) => (
                <tr key={influencer.id}>
                  <td className="influencer-name">{influencer.name}</td>
                  <td className="platform">{influencer.platform}</td>
                  <td className="followers">{influencer.followers.toLocaleString()}</td>
                  <td>
                    <Badge
                      className={`trust-score ${
                        influencer.trustScore >= 80 ? "high" :
                        influencer.trustScore >= 60 ? "medium" : 
                        "low"
                      }`}
                    >
                      {influencer.trustScore}%
                    </Badge>
                  </td>
                  <td>
                    <Badge className="status-badge">
                      {influencer.status}
                    </Badge>
                  </td>
                  <td className="actions">
                    <Button className="view-details-button">
                      Ver Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default RecentInfluencers;