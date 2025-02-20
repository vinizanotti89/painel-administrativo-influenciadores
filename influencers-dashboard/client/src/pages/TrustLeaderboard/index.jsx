import React from 'react';
import { useInfluencer } from '@/contexts/InfluencerContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';
import '@/styles/pages/TrustLeaderboard.css';

const TrustLeaderboard = () => {
  const { influencers, loading } = useInfluencer();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Calcular métricas globais
  const totalVerifiedClaims = influencers.reduce((acc, inf) => acc + inf.statistics.verifiedClaims, 0);
  const averageTrustScore = (
    influencers.reduce((acc, inf) => acc + inf.trustScore, 0) / influencers.length
  ).toFixed(1);

  // Ordenar influenciadores por trust score
  const sortedInfluencers = [...influencers].sort((a, b) => b.trustScore - a.trustScore);

  return (
    <div className="trust-leaderboard">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">Influencer Trust Leaderboard</h1>
        <p className="leaderboard-subtitle">
          Real-time rankings based on scientific accuracy, credibility, and transparency
        </p>
      </div>

      <div className="metrics-grid">
        <Card className="metric-card">
          <CardHeader>
            <CardTitle>Active Influencers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value">{influencers.length}</div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader>
            <CardTitle>Claims Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value">{totalVerifiedClaims}</div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader>
            <CardTitle>Average Trust Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value">{averageTrustScore}%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="leaderboard-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Influencer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Trust Score</TableHead>
              <TableHead>Trend</TableHead>
              <TableHead>Followers</TableHead>
              <TableHead>Verified Claims</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedInfluencers.map((influencer, index) => (
              <TableRow key={influencer.id}>
                <TableCell>#{index + 1}</TableCell>
                <TableCell>
                  <div className="influencer-info">
                    <div className="influencer-avatar">
                      {influencer.photo ? (
                        <img src={influencer.photo} alt={influencer.name} />
                      ) : (
                        <div className="avatar-placeholder" />
                      )}
                    </div>
                    <span className="influencer-name">{influencer.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{influencer.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className={`trust-score ${
                    influencer.trustScore >= 80 ? 'high' :
                    influencer.trustScore >= 60 ? 'medium' : 'low'
                  }`}>
                    {influencer.trustScore}%
                  </div>
                </TableCell>
                <TableCell>
                  {influencer.trend === 'up' ? (
                    <TrendingUp className="trend-icon up" />
                  ) : (
                    <TrendingDown className="trend-icon down" />
                  )}
                </TableCell>
                <TableCell>
                  {(influencer.followers / 1000000).toFixed(1)}M+
                </TableCell>
                <TableCell>
                  {influencer.statistics.verifiedClaims}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TrustLeaderboard;