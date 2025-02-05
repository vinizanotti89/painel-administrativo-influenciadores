import React, { useEffect } from 'react';
import { useInfluencer } from '@/contexts/InfluencerContext';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentInfluencers from '@/components/dashboard/RecentInfluencers';
import { Users, TrendingUp, BarChart2 } from 'lucide-react';
import '@/styles/pages/Dashboard.css';

const Dashboard = () => {
  const { influencers, loading, error, fetchInfluencers } = useInfluencer();
  
  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]); 

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          Error: {error}
        </div>
      </div>
    );
  }

  const totalInfluencers = influencers.length;
  const averageFollowers = Math.round(
    influencers.reduce((acc, inf) => acc + inf.followers, 0) / totalInfluencers || 0
  );
  const averageTrustScore = Math.round(
    influencers.reduce((acc, inf) => acc + inf.trustScore, 0) / totalInfluencers || 0
  );

  const stats = [
    {
      title: "Total de Influenciadores",
      value: totalInfluencers.toString(),
      icon: Users,
      trend: "+12%",
      description: "Em relação ao mês anterior"
    },
    {
      title: "Média de Seguidores",
      value: averageFollowers.toLocaleString(),
      icon: BarChart2,
      trend: "+5%",
      description: "Por influenciador"
    },
    {
      title: "Média Trust Score",
      value: `${averageTrustScore}%`,
      icon: TrendingUp,
      trend: "+8%",
      description: "Últimos 30 dias"
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <RecentInfluencers /> 
    </div>
  );
};

export default Dashboard;